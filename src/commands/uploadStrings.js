const ora = require("ora");

const xlsx = require("../xlsx");
const conf = require("../config");
const { client } = require("../one-sky");
const { prepareLocalizationsFromSheets } = require("../sheet-utils");

const spinner = ora();

module.exports = async function uploadStrings() {
    conf.validateOneSkyConfiguration();

    spinner.start("Downloading xlsx file");
    try {
        const xlsxBuffer = await xlsx.download(conf.xlsxUrl);
        const sheets = xlsx.parse(xlsxBuffer);

        spinner.succeed();

        const localizations = prepareLocalizationsFromSheets(
            sheets,
            (duplicates) => spinner.warn(duplicates)
        );

        spinner.start("Uploading strings to OneSky");

        const translations = localizations.map((localization) => {
            return { [localization.id]: localization.value };
        });
        await client.uploadFile(translations);

        spinner.succeed();
    } catch (error) {
        spinner.fail(error);
    }
};
