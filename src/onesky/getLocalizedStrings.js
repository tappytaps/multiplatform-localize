const client = require("./client");
const conf = require("../config");

module.exports = async function getLocalizedStrings(language) {
    let strings = [];

    for (const sheet of conf.getSheets()) {
        const translations = await client.getTranslations(
            language,
            sheet.oneSkyProjectId
        );
        if (translations) {
            const projectStrings = Object.keys(translations).map(
                (translationId) => {
                    const id = translationId;
                    const value = translations[translationId].trim();
                    return { id, value };
                }
            );
            strings = [...strings, ...projectStrings];
        }
    }

    return strings;
};
