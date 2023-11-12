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

    /** @returns {Promise<Array<{ id: Number, time: Date, latest: boolean}>>} */
    async getPaperBuilds(version) {
        const buildsRaw = await this.#agent.get(`/projects/paper/versions/${version}/builds`);

        /** @type {Array<{build: Number, time: String}>} */
        const builds = buildsRaw.data.builds ?? [];
        builds.sort((a, b) => new Date(a.time) - new Date(b.time));

        return builds.map((build, index) => {
            return {id: build.build, time: new Date(build.time), latest: index === builds.length - 1}
        });
    }
}