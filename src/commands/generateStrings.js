const ora = require("ora");

const conf = require("../config");
const xlsx = require("../xlsx");
const { prepareLocalizationsFromSheets } = require("../sheet-utils");
const { prepareValueForPlatform } = require("../strings-utils");
const { exportStrings } = require("../files");

const spinner = ora();

module.exports = async function generateStrings() {
    spinner.start("Downloading xlsx file");
    try {
        const xlsxBuffer = await xlsx.download(conf.xlsxUrl);

        spinner.succeed();
        spinner.start("Making localization files");

        const sheets = xlsx.parse(xlsxBuffer);
        const localizations = prepareLocalizationsFromSheets(
            sheets,
            (duplicates) => spinner.warn(duplicates)
        ).map((localization) => {
            return {
                ...localization,
                value: prepareValueForPlatform(
                    localization.value,
                    conf.platform
                )
            };
        });
        exportStrings(localizations, conf.developmentLanguage);
        spinner.succeed();
    } catch (error) {
        spinner.fail(error.message);
    }
};
