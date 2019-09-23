const ora = require("ora");

const conf = require("../config");
const xlsx = require("../xlsx");
const { getPlatformStringsFromSheets } = require("../sheets");
const { prepareStringValueForPlatform } = require("../strings");
const { exportStrings } = require("../files");

const spinner = ora();

module.exports = async function generateStrings() {
    spinner.start("Downloading xlsx file");
    try {
        const xlsxBuffer = await xlsx.download(conf.xlsxUrl);

        spinner.succeed();
        spinner.start("Making localization files");

        const sheets = xlsx.parse(xlsxBuffer);
        const strings = getPlatformStringsFromSheets(sheets, (duplicates) =>
            spinner.warn(duplicates)
        ).map((string) => {
            return {
                ...string,
                value: prepareStringValueForPlatform(
                    string.value,
                    conf.platform
                )
            };
        });
        exportStrings(strings, conf.developmentLanguage);
        spinner.succeed();
    } catch (error) {
        spinner.fail(error.message);
    }
};
