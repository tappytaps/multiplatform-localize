const client = require("./client");
const conf = require("../config");

module.exports = async function getLanguages() {
    let languages = [];

    for (const sheet of conf.getSheets()) {
        const projectLanguages = await client.getLanguages(
            sheet.oneSkyProjectId
        );
        languages = [...languages, ...projectLanguages];
    }

    return Array.from(new Set(languages));
};
