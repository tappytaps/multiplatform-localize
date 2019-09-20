const ora = require("ora");

const conf = require("../config");
const xlsx = require("../xlsx");
const { client } = require("../one-sky");
const { prepareValueForPlatform } = require("../strings-utils");
const { exportStrings } = require("../files");
const { prepareLocalizationsFromSheets } = require("../sheet-utils");

const spinner = ora();

module.exports = async function downloadStrings() {
    conf.validateOneSkyConfiguration();

    spinner.start("Downloading original xlsx file");
    try {
        const xlsxBuffer = await xlsx.download(conf.xlsxUrl);

        spinner.succeed();
        spinner.start("Parsing xlsx file");

        const sheets = xlsx.parse(xlsxBuffer);
        const originalLocalizations = prepareLocalizationsFromSheets(sheets, {
            validate: false
        });

        spinner.succeed();
        spinner.start("Getting languages");

        const languages = await client.getLanguages();

        spinner.succeed();

        for (const language of languages) {
            spinner.start(`Downloading strings for: ${language}`);

            const file = await client.getFile(language);
            const localizations = Object.keys(file)
                .map((key) => file[key])
                .map((translation) => {
                    const id = Object.keys(translation)[0];
                    const value = Object.values(translation)[0];
                    return { id, value };
                })
                .map((localization) => {
                    const originalLocalization = originalLocalizations.find(
                        (l) => {
                            return String(l.id) === String(localization.id);
                        }
                    );
                    const { key } = originalLocalization;
                    return {
                        key,
                        value: prepareValueForPlatform(
                            localization.value,
                            conf.platform
                        )
                    };
                });

            exportStrings(localizations, language);
            spinner.succeed();
        }
    } catch (error) {
        spinner.fail(error);
    }
};
