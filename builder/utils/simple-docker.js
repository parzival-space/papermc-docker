import Dockerode from 'dockerode';
import { exec } from 'child_process';

export default class SimpleDocker {
    /** @type {Dockerode} */
    #docker;

    /** @param {Dockerode.DockerOptions} options */
    constructor(options = undefined) {
        this.#docker = options === undefined ? new Dockerode() : new Dockerode(options);
    }

    /** @param {NodeJS.ReadableStream} stream */
    async #followProgress(stream) {
        return await new Promise((resolve, reject) => {
            this.#docker.modem.followProgress(stream, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    const resultString = result.map(s => s.stream).join()
                    resolve(resultString);
                }
            })
        })
    }
    
    /** @param {string | NodeJS.ReadableStream | Dockerode.ImageBuildContext} file
     *  @param {Dockerode.ImageBuildOptions} options
     *  @returns {Promise<String>} */
    async buildImage(file, options ) {
        const buildStream = await this.#docker.buildImage(file, options);
        return await this.#followProgress(buildStream);
    }

    /** @param {string} file
     *  @param {Dockerode.ImageBuildOptions} options
     *  @param {Array<String>} platforms
     *  @returns {Promise<String>} */
    async buildxImage(file, options, platforms = []) {
        const buildArgsString = Object.keys(options.buildargs).map(buildArgName => `--build-arg ${buildArgName}=${options.buildargs[buildArgName]}`).join(' ');
        const buildxCommand = `docker buildx build --platform ${platforms.join(',')} ${buildArgsString} -t ${options.t} -f ${file}`;
        return await new Promise((resolve, reject) => {
            exec(buildxCommand, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stdout)
                }
            });
        })
    }

    /** @param {String} image
     *  @param {Dockerode.ImagePushOptions | undefined} options */
    async pushImage(image, options = undefined) {
        const imageInstance = await this.#docker.getImage(image);
        const pushStream = options === undefined ? await imageInstance.push() : await imageInstance.push(options);
        return await this.#followProgress(pushStream);
    }
}