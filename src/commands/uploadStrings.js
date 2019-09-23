const fs = require("fs");

const ora = require("ora");

const xlsx = require("../xlsx");
const conf = require("../config");
const PlatformKey = require("../PlatformKey");
const { oneSkyClient } = require("../onesky");
const { getOneSkyStringsFromSheets } = require("../sheets");

const spinner = ora();

module.exports = async function uploadStrings() {
    conf.validateOneSkyConfiguration();

    try {
        await _uploadStrings();
        await _uploadPluralsIfNeeded();
    } catch (error) {
        spinner.fail(error);
    }
};

async function _uploadStrings() {
    spinner.start("Downloading xlsx file");

    const xlsxBuffer = await xlsx.download(conf.xlsxUrl);
    const sheets = xlsx.parse(xlsxBuffer);

    spinner.succeed();

    const strings = getOneSkyStringsFromSheets(sheets, (duplicates) =>
        spinner.warn(duplicates)
    );

    spinner.start("Uploading strings to OneSky");

    const stringsForLocalization = strings.map((string) => {
        return { [string.id]: string.value };
    });
    await oneSkyClient.uploadTranslations(stringsForLocalization);

    spinner.succeed();
}

async function _uploadPluralsIfNeeded() {
    if (conf.hasPlurals()) {
        spinner.start("Uploading plurals to OneSky");

        const pluralsPath = conf.getPluralsPath();
        const pluralsFileName = conf.getPluralsFileName();
        const pluralsContent = fs.readFileSync(pluralsPath, "utf8");

        switch (conf.platform) {
            case PlatformKey.ios:
                await oneSkyClient.uploadStringsdict(
                    pluralsContent,
                    pluralsFileName
                );
                break;
            case PlatformKey.android:
                await oneSkyClient.uploadAndroidXml(
                    pluralsContent,
                    pluralsFileName
                );
                break;
            case PlatformKey.web:
                // TODO
                break;
            default:
                break;
        }

        spinner.succeed();
    }
}
