const conf = require("../config");
const oneSky = require("../onesky");
const strings = require("../strings");
const spinner = require("../spinner");
const files = require("../files");

module.exports = async function downloadStrings() {
    conf.validate();
    conf.validateOneSkyConfiguration();

    try {
        spinner.start("Downloading strings");
        const originalStrings = await strings.getPlatformStrings();
        spinner.succeed();

        spinner.start("Getting languages");
        const languages = await oneSky.getLanguages();
        spinner.succeed(`Getting languages ${languages.join(" ")}`);

        await downloadLocalizedStrings(originalStrings, languages);
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

        const localizedStrings = await strings.getLocalizedStrings(
            originalStrings,
            language
        );
        await files.exportStrings(localizedStrings, language);

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

        await files.exportFile(
            await oneSky.getLocalizedPlurals(language),
            conf.getPluralsFileName(),
            language
        );

        languageCount += 1;
    }

    spinner.succeed("Downloading localized plurals");
}
