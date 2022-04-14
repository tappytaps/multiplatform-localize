const client = require("./client");
const conf = require("../config");

module.exports = async function getLanguages() {
    let languages = [];

    for (const project of conf.getOneSkyProjects()) {
        const projectLanguages = await client.getLanguages(project.id);
        languages = [...languages, ...projectLanguages];
    }

    return Array.from(new Set(languages));
};
