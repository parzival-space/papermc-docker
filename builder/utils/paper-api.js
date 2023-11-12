import axios from 'axios';

export class PaperAPI {
    /** @type {AxiosInstance} */
    #agent;

    constructor(agent = "PaperAPI Node Agent") {
        this.#agent = axios.create({
            baseURL: "https://api.papermc.io/v2",
            headers: {
                'User-Agent': agent,
                'Accept': 'application/json'
            }
        });
    }
    
    /** @returns {Promise<Array<String>>} */
    async getPaperVersions() {
        const versionsRaw = await this.#agent.get("/projects/paper");
        return versionsRaw.data?.versions ?? [];
    }

    /** @returns {Promise<Array<Number>>} */
    async getPaperBuilds(version) {
        const buildsRaw = await  this.#agent.get(`/projects/paper/versions/${version}`);
        return buildsRaw.data?.builds ?? [];
    }
}