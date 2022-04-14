const client = require("./client");
const conf = require("../config");

module.exports = async function getLocalizedStrings(language) {
    let strings = [];

    for (const project of conf.getOneSkyProjects()) {
        const projectFile = await client.getTranslationsFile(
            language,
            project.id
        );

        if (projectFile) {
            const projectStrings = Object.keys(projectFile).map(
                (translationId) => {
                    const id = translationId;
                    const value = projectFile[translationId].trim();
                    return { id, value };
                }
            );
            strings = [...strings, ...projectStrings];
        }
    }

    return strings;
};
