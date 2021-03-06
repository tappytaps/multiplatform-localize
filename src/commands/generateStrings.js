const fs = require("fs");

const ora = require("ora");

const conf = require("../config");
const xlsx = require("../xlsx");
const { getPlatformStringsFromSheets } = require("../sheets");
const { prepareStringValueForPlatform } = require("../strings");
const files = require("../files");

const spinner = ora();

module.exports = async function generateStrings() {
    conf.validate();

    try {
        const strings = await _downloadStrings();
        _exportStrings(strings);
        _exportPluralsStringsIfNeeded();
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function _downloadStrings() {
    spinner.start("Downloading xlsx file");

    const xlsxBuffer = await xlsx.download(conf.xlsxUrl);
    const sheets = xlsx.parse(xlsxBuffer);

    const strings = getPlatformStringsFromSheets(sheets, {
        warningLogger: (duplicates) => spinner.warn(duplicates)
    }).map((string) => {
        return {
            ...string,
            value: prepareStringValueForPlatform(
                string.value,
                conf.platform,
                string.isHtml
            )
        };
    });

    spinner.succeed();

    return strings;
}

function _exportStrings(strings) {
    spinner.start("Exporting strings file");
    files.exportStrings(strings, conf.baseLanguage);
    spinner.succeed();
}

async function _exportPluralsStringsIfNeeded() {
    if (!conf.hasPlurals()) return;

    spinner.start("Exporting plurals strings file");

    const pluralsPath = conf.getPluralsPath();
    const pluralsFileName = conf.getPluralsFileName();
    const pluralsFileContent = fs.readFileSync(pluralsPath, "utf8");

    if (pluralsFileContent) {
        await files.exportFile(
            pluralsFileContent,
            pluralsFileName,
            conf.baseLanguage
        );
    }

    spinner.succeed();
}
