const conf = require("../config");
const { client: oneSkyClient } = require("../onesky");
const spinner = require("../spinner");
const ProjectSheet = require("../sheets/ProjectSheet");

module.exports = async function uploadStrings(options) {
    try {
        spinner.start(`Downloading sheets file...`);

        let projectSheets = await ProjectSheet.downloadSheets({
            filterSheets: options.sheet
        });

        spinner.succeed();

        for (const projectSheet of projectSheets) {
            const projectSheetStrings = projectSheet.getOneSkyStrings();

            spinner.start(
                `Uploading ${projectSheet.name} strings (${projectSheetStrings.length}) to OneSky`
            );

            await oneSkyClient.uploadTranslations(
                projectSheetStrings,
                projectSheet.oneSkyProjectId,
                conf.baseLanguage
            );

            spinner.succeed();
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
