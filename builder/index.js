import packageJson from './package.json' assert { type: 'json' };

import { join } from 'path';
import SimpleDocker from "./utils/simple-docker.js";
import {PaperAPI} from "./utils/paper-api.js";
import {MojangAPI} from "./utils/mojang-api.js";
import RepositoryAPI from "./utils/repository-api.js";
import {defaultEnv, throwEnv} from "./utils/env-parser.js";

// handle envs
const IMAGE_NAME = defaultEnv("S_IMAGE_NAME", "papermc");
const IMAGE_PLATFORMS = defaultEnv("S_IMAGE_PLATFORMS", "linux/arm/v7,linux/arm64/v8,linux/amd64");
const DOCKER_NAMESPACE = throwEnv("S_DOCKER_NAMESPACE", "S_DOCKER_NAMESPACE env missing!")
const DOCKER_TOKEN = throwEnv("S_DOCKER_TOKEN", "S_DOCKER_TOKEN env missing!")
const GITHUB_USER = throwEnv("S_GITHUB_USER", "S_GITHUB_USER env missing!")
const GITHUB_TOKEN = throwEnv("S_GITHUB_TOKEN", "S_GITHUB_TOKEN env missing!")

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

// build images
for (const paperVersion of await paper.getPaperVersions()) {
    console.log(`Paper ${paperVersion}`)
    
    for (const paperBuild of await paper.getPaperBuilds(paperVersion)) {
        const tagName = `${paperVersion}-${paperBuild}`;
        
        // only build & push image if not already in registry
        const buildForDockerHub = ! dockerVersions.includes(tagName);
        const buildForGitHub = !githubVersions.includes(tagName) && repo.hasGitHubToken();
        
        if (buildForDockerHub || buildForGitHub) {
            console.log(` > Build ${paperBuild}`)

            // get required java version
            /** @type {Number} */
            const javaVersion = javaCache[paperVersion] ?? (javaCache[paperVersion] = await mojang.getJavaVersion(paperVersion));

            const tagString = `${IMAGE_NAME}:${paperVersion}-${paperBuild}`;
            try {
                // build images using docker
                await docker.buildImage(
                    {
                        context: join('..', 'container'),
                        src: [ 'Dockerfile' ]
                    },
                    {
                        t: tagString,
                        platform: IMAGE_PLATFORMS,
                        buildargs: {
                            "JAVA_VERSION": `${javaVersion}`,
                            "PAPER_VERSION": `${paperVersion}`,
                            "PAPER_BUILD": `${paperBuild}`
                        }
                    }
                );

                // push image
                if (buildForDockerHub) {
                    console.log(`   > Pushing to Docker Hub`)
                    try {
                        await docker.pushImage(tagName, {
                            tag: tagName,
                            authconfig: {
                                username: DOCKER_NAMESPACE,
                                password: DOCKER_TOKEN
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
                if (buildForGitHub) {
                    try {
                        console.log(`   > Pushing to GitHub`)
                        await docker.pushImage(tagName, {
                            tag: `ghcr.io/${tagName}`,
                            authconfig: {
                                username: GITHUB_USER,
                                password: GITHUB_TOKEN
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
            } catch (e) {
                console.log(e);
                process.exit(-1);
            }
        }
        else {
            console.log(` > Skipped ${paperBuild}`)
        }
        
        
    }
}

// https://api.papermc.io/v2/projects/paper/versions/1.13-pre7/builds/1/downloads/paper-1.13-pre7-1.jar

//await fs.writeFile("builds.json", JSON.stringify(builds))