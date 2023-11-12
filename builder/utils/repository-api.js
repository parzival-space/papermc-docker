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
        const response =
            await this.#agent.get(`https://api.github.com/users/${username}/packages/container/${container}/versions`, {
                headers: {
                    "Authorization": `Bearer ${this.#githubToken}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });

        /** @type {Array<String>} */
        let tags = [];
        
        if (response.status === 404) return tags;

        response.data.forEach(version => {
            /** @type {Array<String>} */
            const versionTags = version.metadata.container.tags;
            tags.push(...versionTags);
        })
        
        return tags;
    }
    
    hasGitHubToken() {
        return this.#githubToken !== undefined &&
            this.#githubToken !== "" &&
            this.#githubToken !== null;
    }
}