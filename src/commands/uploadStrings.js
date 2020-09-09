const fs = require("fs");
const path = require("path");

const ora = require("ora");

const xlsx = require("../xlsx");
const conf = require("../config");
const OneSkyProjectType = require("../OneSkyProjectType");
const { oneSkyClient } = require("../onesky");
const { getOneSkyStringsFromSheets } = require("../sheets");

const spinner = ora();

module.exports = async function uploadStrings(options) {
    conf.validateOneSkyConfiguration();

    try {
        await _uploadStrings(options);
        await _uploadPluralsIfNeeded(options);
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function _uploadStrings(options) {
    spinner.start("Downloading xlsx file");

    const { appSpecificOnly } = options;
    const xlsxBuffer = await xlsx.download(conf.xlsxUrl);
    const sheets = xlsx.parse(xlsxBuffer);

    spinner.succeed();

    const strings = getOneSkyStringsFromSheets(sheets, {
        warningLogger: (duplicates) => spinner.warn(duplicates)
    });

    for (const project of conf.getOneSkyProjects()) {
        let projectStrings = [];
        switch (project.type) {
            case OneSkyProjectType.all:
                projectStrings = strings;
                break;
            case OneSkyProjectType.common:
                projectStrings = strings.filter((string) => {
                    return !string.isAppSpecific;
                });
                break;
            case OneSkyProjectType.appSpecific:
                projectStrings = strings.filter((string) => {
                    return string.isAppSpecific;
                });
                break;
            default:
                break;
        }

        if (
            !appSpecificOnly ||
            project.type === OneSkyProjectType.appSpecific
        ) {
            spinner.start(
                `Uploading ${project.type} strings (${projectStrings.length}) to OneSky`
            );

            const localizations = transformStringsToLocalizations(
                projectStrings
            );
            await oneSkyClient.uploadTranslations(localizations, project.id);

            spinner.succeed();
        }
    }
}

async function _uploadPluralsIfNeeded() {
    if (conf.hasPlurals()) {
        spinner.start("Uploading plurals to OneSky");

        const pluralsPath = conf.getPluralsPath();
        const pluralsFileName = conf.getPluralsFileName();
        const pluralsFileExtension = path.extname(pluralsPath);
        const pluralsContent = fs.readFileSync(pluralsPath, "utf8");
        const pluralsProjectId = conf.getOneSkyPluralsProjectId();

        switch (pluralsFileExtension) {
            case ".stringsdict":
                await oneSkyClient.uploadStringsdict(
                    pluralsContent,
                    pluralsFileName,
                    pluralsProjectId
                );
                break;
            case ".xml":
                await oneSkyClient.uploadAndroidXml(
                    pluralsContent,
                    pluralsFileName,
                    pluralsProjectId
                );
                break;
            case ".json":
                await oneSkyClient.uploadHierarchicalJson(
                    pluralsContent,
                    pluralsFileName,
                    pluralsProjectId
                );
                break;
            default:
                throw new Error(
                    `Unknown plurals file type ${pluralsFileExtension}`
                );
        }

        spinner.succeed();
    }
}

function transformStringsToLocalizations(strings) {
    return strings.reduce(
        (obj, string) => Object.assign(obj, { [string.id]: string.value }),
        {}
    );
}
