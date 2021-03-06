/* eslint-disable no-loop-func */
const ora = require("ora");

const conf = require("../config");
const xlsx = require("../xlsx");
const files = require("../files");
const { oneSkyClient } = require("../onesky");
const { prepareStringValueForPlatform } = require("../strings");
const { getPlatformStringsFromSheets } = require("../sheets");

const spinner = ora();

module.exports = async function downloadStrings() {
    conf.validate();
    conf.validateOneSkyConfiguration();

    try {
        const originalStrings = await _getOriginalStrings();
        const languages = await _getLanguages();
        await _downloadLocalizedStrings(originalStrings, languages);
        await _downloadLocalizedPluralsIfNeeded(languages);
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function _getOriginalStrings() {
    spinner.start("Downloading original xlsx file");

    const xlsxBuffer = await xlsx.download(conf.xlsxUrl);

    spinner.succeed();
    spinner.start("Parsing xlsx file");

    const sheets = xlsx.parse(xlsxBuffer);
    const strings = getPlatformStringsFromSheets(sheets, {
        validate: false
    });

    spinner.succeed();
    return strings;
}

async function _getLanguages() {
    spinner.start("Getting languages");

    let languages = [];

    for (const project of conf.getOneSkyProjects()) {
        const projectLanguages = await oneSkyClient.getLanguages(project.id);
        languages = [...languages, ...projectLanguages];
    }

    languages = Array.from(new Set(languages));

    spinner.succeed();
    spinner.info(`${languages.join()}`);

    return languages;
}

async function _downloadLocalizedStrings(originalStrings, languages) {
    for (const language of languages) {
        spinner.start(`Downloading localized strings for: ${language}`);

        let localizations = [];

        for (const project of conf.getOneSkyProjects()) {
            const projectFile = await oneSkyClient.getTranslationsFile(
                language,
                project.id
            );

            if (projectFile) {
                const projectLocalizations = Object.keys(projectFile)
                    .map((translationId) => {
                        const id = translationId;
                        const value = projectFile[translationId].trim();
                        return { id, value };
                    })
                    .map((localizedString) => {
                        const originalString = originalStrings.find((s) => {
                            return String(s.id) === String(localizedString.id);
                        });
                        if (!originalString) {
                            return null;
                        }
                        const { key, isHtml } = originalString;
                        return {
                            key,
                            value: prepareStringValueForPlatform(
                                localizedString.value,
                                conf.platform,
                                isHtml
                            )
                        };
                    })
                    .filter((s) => s != null);

                localizations = [...localizations, ...projectLocalizations];
            }
        }

        files.exportStrings(localizations, language);
        spinner.succeed();
    }
}

async function _downloadLocalizedPluralsIfNeeded(languages) {
    if (!conf.hasPlurals()) return;

    for (const language of languages) {
        spinner.start(`Downloading localized plurals for: ${language}`);

        const pluralsFileName = conf.getPluralsFileName();
        const pluralsProjectId = conf.getOneSkyPluralsProjectId();
        const pluralsFileContent = await oneSkyClient.getFile(
            language,
            pluralsFileName,
            pluralsProjectId
        );

        if (pluralsFileContent) {
            await files.exportFile(
                pluralsFileContent,
                pluralsFileName,
                language
            );
        }

        spinner.succeed();
    }
}
