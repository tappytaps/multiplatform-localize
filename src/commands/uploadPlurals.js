const fs = require("fs");
const path = require("path");

const conf = require("../config");
const { client: oneSkyClient } = require("../onesky");
const spinner = require("../spinner");

module.exports = async function uploadStrings() {
    try {
        conf.validate();

        if (conf.hasPlurals()) {
            spinner.start("Uploading plurals to OneSky");

            const pluralsFilePath = conf.getPluralsFilePath();
            const pluralsFileName = conf.getPluralsFileName();
            const pluralsFileExtension = path.extname(pluralsFilePath);
            const pluralsContent = fs.readFileSync(pluralsFilePath, "utf8");
            const pluralsProjectId = conf.getPluralsOneSkyProjectId();

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
        } else {
            spinner.info("No plurals file configured for upload.");
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
