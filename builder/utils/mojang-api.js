import axios from 'axios';

export class MojangAPI {
    /** @type {AxiosInstance} */
    #agent;

    constructor(agent = "MojangAPI Node Agent") {
        this.#agent = axios.create({
            baseURL: "https://launchermeta.mojang.com",
            headers: {
                'User-Agent': agent,
                'Accept': 'application/json'
            }
        });
    }
    
    /** @return {Promise<{ release: String | undefined, snapshot: String | undefined }>} */
    async getLatest() {
        const manifestRaw = await this.#agent.get("/mc/game/version_manifest.json");
        return manifestRaw.data?.latest ?? { release: undefined, snapshot: undefined };
    }
    
    /** @return {Promise<Array<String>>} */
    async getVersions() {
        const versionsRaw = await this.#agent.get("/mc/game/version_manifest.json");
        const versions = versionsRaw.data?.versions ?? [];
        return versions
            .filter(versionInfos => versionInfos?.id !== undefined)
            .map(versionInfo => versionInfo?.id);        
    }

    /** @return {Promise<Number>} */
    async getJavaVersion(minecraftVersion) {
        const gameInfosRaw = await this.#agent.get("/mc/game/version_manifest.json");
        const gameInfos = gameInfosRaw.data?.versions ?? [];
        
        /** @type {{ url: String} | undefined} */
        const gameInfo = gameInfos
            .filter(info => info?.id !== undefined)
            .find(info => info?.id.toUpperCase() === minecraftVersion.toUpperCase());
        if (gameInfo === undefined)
            throw "Failed to find version.";
        
        const manifestRaw = await this.#agent.get(gameInfo.url);
        
        /** @type {Number | undefined} */
        const javaVersion = manifestRaw.data?.javaVersion?.majorVersion ?? null;
        if (javaVersion === null)
            throw "Failed to find java version.";
        
        return javaVersion;
    }
}