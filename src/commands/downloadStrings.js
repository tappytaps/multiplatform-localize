const conf = require("../config");
const oneSky = require("../onesky");
const strings = require("../strings");
const spinner = require("../spinner");
const files = require("../files");
const ProjectSheet = require("../sheets/ProjectSheet");

module.exports = async function downloadStrings() {
    try {
        conf.validate();

        spinner.start("Downloading sheets file...");

        const projectSheets = await ProjectSheet.downloadSheets();

        const platformStrings = projectSheets.reduce(
            (acc, sheet) => [...acc, ...sheet.getPlatformStrings()],
            []
        );

        spinner.succeed();

        spinner.start("Getting languages");

        const languages =
            conf.getSupportedLanguages() ?? (await oneSky.getLanguages());

        spinner.succeed(`Getting languages: ${languages.join(" ")}`);

        await downloadLocalizedStrings(platformStrings, languages);
        await downloadLocalizedPlurals(languages);
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function downloadLocalizedStrings(originalStrings, languages) {
    let languageCount = 1;

    for (const language of languages) {
        spinner.start(
            `Downloading localized strings: ${language} (${languageCount}/${languages.length})`
        );

        const localizedStrings = await oneSky.getLocalizedStrings(language);
        const localizedPlatformStrings = strings.mapLocalizedStringsForPlatform(
            originalStrings,
            localizedStrings
        );

        await files.exportStrings(localizedPlatformStrings, language);

        languageCount += 1;
    }

    spinner.succeed("Downloading localized strings");
}

async function downloadLocalizedPlurals(languages) {
    if (!conf.hasPlurals()) return;

    let languageCount = 1;

    for (const language of languages) {
        spinner.start(
            `Downloading localized plurals: ${language} (${languageCount}/${languages.length})`
        );

        const localizedPlurals = await oneSky.getLocalizedPlurals(language);

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
