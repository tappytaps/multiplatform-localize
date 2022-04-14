const conf = require("../config");
const client = require("./client");

module.exports = async function getLocalizedPlurals(language) {
    const pluralsFileName = conf.getPluralsFileName();
    const pluralsProjectId = conf.getOneSkyPluralsProjectId();

    return client.getFile(language, pluralsFileName, pluralsProjectId);
};
