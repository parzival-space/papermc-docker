/** @param {String} name
 *  @param {String} fallback
 *  @returns {String} */
export function defaultEnv(name, fallback) {
    return process.env[name] ?? fallback;
}

/** @param {String} name
 *  @param {String} message
 *  @returns {String} */
export function throwEnv(name, message) {
    if (process.env[name] !== undefined) return process.env[name];
    throw message;
}