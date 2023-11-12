import packageJson from './package.json' assert {type: 'json'};
import {join} from 'path';
import SimpleDocker from "./utils/simple-docker.js";
import {PaperAPI} from "./utils/paper-api.js";
import {MojangAPI} from "./utils/mojang-api.js";
import RepositoryAPI from "./utils/repository-api.js";
import {defaultEnv, throwEnv} from "./utils/env-parser.js";

// parse envs
const IMAGE_NAME = defaultEnv("VAR_IMAGE_NAME", "papermc");
const IMAGE_PLATFORMS = defaultEnv("VAR_IMAGE_PLATFORMS", "linux/arm/v7,linux/arm64/v8,linux/amd64");
const DOCKER_NAMESPACE = throwEnv("VAR_DOCKER_NAMESPACE", "VAR_DOCKER_NAMESPACE env missing!")
const DOCKER_TOKEN = throwEnv("VAR_DOCKER_TOKEN", "VAR_DOCKER_TOKEN env missing!")
const GITHUB_USER = throwEnv("VAR_GITHUB_USER", "VAR_GITHUB_USER env missing!")
const GITHUB_TOKEN = throwEnv("VAR_GITHUB_TOKEN", "VAR_GITHUB_TOKEN env missing!")

// configure docker
const docker = new SimpleDocker()

// configure api wrappers
const agentString = `${packageJson.name} (${packageJson.description})`;
const paper = new PaperAPI(agentString);
const mojang = new MojangAPI(agentString);
const repo = new RepositoryAPI(GITHUB_TOKEN, agentString);

// repository tags
const dockerVersions = await repo.getDockerHubVersions(DOCKER_NAMESPACE, IMAGE_NAME);
const githubVersions = await repo.getGitHubVersions(GITHUB_USER, IMAGE_NAME);

// used to cache java versions
const javaCache = {};

// login to registries
await docker.login(DOCKER_NAMESPACE, DOCKER_TOKEN, "");
await docker.login(GITHUB_USER, GITHUB_TOKEN, "ghcr.io");

// build images
for (const paperVersion of await paper.getPaperVersions()) {
    console.log(`Paper ${paperVersion}`)

    for (const paperBuild of await paper.getPaperBuilds(paperVersion)) {
        const tagName = `${paperVersion}-${paperBuild.id}`;

        // only build & push image if not already in registry
        const buildForDockerHub = !dockerVersions.includes(tagName);
        const buildForGitHub = !githubVersions.includes(tagName) && repo.hasGitHubToken();

        if (buildForDockerHub || buildForGitHub) {
            console.log(` > Build ${paperBuild.id} (Latest: ${paperBuild.latest})`)

            // get required java version
            /** @type {Number} */
            const javaVersion = javaCache[paperVersion] ?? (javaCache[paperVersion] = await mojang.getJavaVersion(paperVersion));

            // image config
            const tagString = `${IMAGE_NAME}:${tagName}`;
            const buildConfig = {context: join('..', 'container'), dockerfile: 'Dockerfile'};
            const buildArgs = {
                "JAVA_VERSION": `${javaVersion}`,
                "PAPER_VERSION": `${paperVersion}`,
                "PAPER_BUILD": `${paperBuild.id}`
            };

            try {
                // push image
                if (buildForDockerHub) {
                    console.log(`> Pushing to Docker Hub`)
                    try {
                        // build images using docker
                        await docker.buildxImage(
                            buildConfig,
                            {
                                t: `${DOCKER_NAMESPACE}/${tagString}`,
                                buildargs: buildArgs
                            },
                            IMAGE_PLATFORMS.split(','),
                            true
                        );
                    } catch (e) {
                        console.log(e);
                    }
                }
                if (buildForGitHub) {
                    try {
                        console.log(` > Pushing to GitHub`)
                        // build images using docker
                        await docker.buildxImage(
                            buildConfig,
                            {
                                t: `ghcr.io/${GITHUB_USER}/${tagString}`,
                                buildargs: buildArgs
                            },
                            IMAGE_PLATFORMS.split(','),
                            true
                        );
                    } catch (e) {
                        console.log(e);
                    }
                }

                // publish if latest for build
                if (paperBuild.latest) {
                    // dockher hub
                    console.log(` > Marking as latest for Docker Hub`)
                    await docker.buildxImage(
                        buildConfig,
                        {
                            t: `${DOCKER_NAMESPACE}/${IMAGE_NAME}:${paperVersion}`,
                            buildargs: buildArgs
                        },
                        IMAGE_PLATFORMS.split(','),
                        true
                    );

                    // github hub
                    console.log(` > Marking as latest for GitHub`)
                    await docker.buildxImage(
                        buildConfig,
                        {
                            t: `ghcr.io/${GITHUB_USER}/${IMAGE_NAME}:${paperVersion}`,
                            buildargs: buildArgs
                        },
                        IMAGE_PLATFORMS.split(','),
                        true
                    );
                }
            } catch (e) {
                console.log(e);
                process.exit(-1);
            }
        } else {
            console.log(` > Skipped ${paperBuild}`)
        }

    }
}

// https://api.papermc.io/v2/projects/paper/versions/1.13-pre7/builds/1/downloads/paper-1.13-pre7-1.jar

//await fs.writeFile("builds.json", JSON.stringify(builds))