import axios from 'axios';

export default class RepositoryAPI {
    /** @type {AxiosInstance} */
    #agent;

    /** @type {String | undefined} */
    #githubToken;

    constructor(githubToken = undefined, agent = "RepostiroyAPI Node Agent") {
        this.#githubToken = githubToken
        this.#agent = axios.create({
            headers: {
                'User-Agent': agent,
                'Accept': 'application/json'
            }
        });
    }

    /** @param {String} namespace
     *  @param {String} repostiroy
     *  @returns {Promise<Array<String>>} */
    async getDockerHubVersions(namespace, repostiroy) {
        /** @type {Array<String>} */
        let tags = [];
        let nextPage = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repostiroy}/tags?page_size=100`;

        while (nextPage !== null) {
            const response = await this.#agent.get(nextPage);
            tags.push(...response.data?.results.map(tag => tag.name));

            // load next page if possible
            nextPage = response.data?.next ?? null;
        }

        return tags;
    }

    /** @param {String} username
     *  @param {String} container
     *  @returns {Promise<Array<String>>} */
    async getGitHubVersions(username, container) {
        /** @type {Array<String>} */
        let tags = [];
        let nextPage = 1;

        while (nextPage !== -1){
            try {
                console.log(`Fetching tags for ${username}/${container}... Page ${nextPage}`)

                const response = await this.#agent.get(`https://api.github.com/users/${username}/packages/container/${container}/versions?per_page=100&page=${nextPage}`, {
                    headers: {
                        "Authorization": `Bearer ${this.#githubToken}`,
                        "X-GitHub-Api-Version": "2022-11-28"
                    }
                });
                nextPage++;

                if (response.data.length === 0) {
                    // no more data
                    nextPage = -1;
                } else {
                    response.data.forEach(version => {
                        /** @type {Array<String>} */
                        const versionTags = version.metadata.container.tags;
                        tags.push(...versionTags);
                    });
                }
            } catch (e) {
                if (nextPage === 1) {
                    console.warn(`Failed to fetch published image versions. Are there even any images yet?`);
                } else {
                    console.log(e);
                }
                nextPage = -1;
            }
        }


        return tags;
    }

    hasGitHubToken() {
        return this.#githubToken !== undefined &&
            this.#githubToken !== "" &&
            this.#githubToken !== null;
    }
}