import { exec } from 'child_process';
import { join } from 'path';

export default class SimpleDocker {
    async #asyncCommand(command) {
        return await new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stdout)
                }
            });
        })
    }

    /** @param {{ context: String, dockerfile: String }} config
     *  @param {{ buildargs: {}, t: String }} options
     *  @param {Array<String>} platforms
     *  @returns {Promise<String>} */
    async buildxImage(config, options, platforms = [], doPush = false) {

        const buildArgsString = Object.keys(options.buildargs).map(buildArgName => `--build-arg ${buildArgName}=${options.buildargs[buildArgName]}`).join(' ');

        const buildxCommand =
            `docker buildx build --platform ${platforms.join(',')} ` +
            `${buildArgsString} ` +
            `-t ${options.t} ` +
            `-f ${join(config.context, config.dockerfile)} ` +
            `${doPush ? '--push' : ''}` +
            `${config.context}`;

        return await this.#asyncCommand(buildxCommand);
    }

    async login(username, password, server) {
        const loginCommand = `docker login -u ${username} -p ${password} ${server}`;
        return await this.#asyncCommand(loginCommand);
    }
}