const conf = require("../config");
const weblate = require("../weblate");
const strings = require("../strings");
const spinner = require("../spinner");
const files = require("../files");
const ProjectSheet = require("../sheets/ProjectSheet");

module.exports = async function downloadStrings() {
    try {
        conf.validate();

        spinner.start("Downloading sheets file...");

        const projectSheets = await ProjectSheet.downloadSheets();

        spinner.succeed();

        await downloadLocalizedStrings(projectSheets);
        await downloadLocalizedPlurals();
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function downloadLocalizedStrings(projectSheets) {
    const languages =
        conf.getSupportedLanguages() ??
        (await ProjectSheet.getLanguages(projectSheets)).map(
            (language) => language.code
        );

    let languageCount = 1;

    for (const language of languages) {
        spinner.start(
            `Downloading localized strings: ${language} (${languageCount}/${languages.length})`
        );

        const originalStrings =
            await ProjectSheet.getPlatformStrings(projectSheets);

        const localizedStrings = await ProjectSheet.getLocalizedStrings(
            projectSheets,
            language
        );
        const localizedPlatformStrings = strings.mapLocalizedStringsForPlatform(
            originalStrings,
            localizedStrings
        );
        await files.exportStrings(localizedPlatformStrings, language);

        languageCount += 1;
    }

    spinner.succeed("Downloading localized strings");
}

async function downloadLocalizedPlurals() {
    if (!conf.hasPlurals()) return;

    const languages =
        conf.getSupportedLanguages() ??
        (
            await weblate.client.getComponentLanguages(
                conf.plurals.weblateProjectSlug,
                conf.plurals.weblateComponentSlug
            )
        ).map((language) => language.code);

    let languageCount = 1;

    for (const language of languages) {
        spinner.start(
            `Downloading localized plurals: ${language} (${languageCount}/${languages.length})`
        );

        const localizedPlurals = await weblate.client.getTranslationsFile(
            conf.plurals.weblateProjectSlug,
            conf.plurals.weblateComponentSlug,
            language
        );

        if (localizedPlurals) {
            await files.exportFile(
                localizedPlurals,
                conf.getPluralsFileName(),
                language
            );
        } else {
            spinner.warn(`Found empty plurals file (${language})`);
        }

        languageCount += 1;
    }

    spinner.succeed("Downloading localized plurals");
}
