const conf = require("../config");
const { client: weblateClient } = require("../weblate");
const spinner = require("../spinner");
const ProjectSheet = require("../sheets/ProjectSheet");

module.exports = async function uploadStrings(options) {
    try {
        conf.validate();

        spinner.start(`Downloading sheets file...`);

        let projectSheets = await ProjectSheet.downloadSheets({
            filterSheets: options.sheet
        });

        spinner.succeed();

        for (const projectSheet of projectSheets) {
            const projectSheetStrings = projectSheet.getFinalStrings();

            spinner.start(
                `Uploading ${projectSheet.name} strings (${projectSheetStrings.length}) to Weblate`
            );

            await weblateClient.postTranslations(
                projectSheetStrings,
                projectSheet.weblateProjectSlug,
                projectSheet.weblateComponentSlug,
                conf.baseLanguage
            );

            spinner.succeed();
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
