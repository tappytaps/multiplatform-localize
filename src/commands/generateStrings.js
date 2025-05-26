const fs = require("fs");

const conf = require("../config");
const files = require("../files");
const spinner = require("../spinner");
const ProjectSheet = require("../sheets/ProjectSheet");

module.exports = async function generateStrings() {
    try {
        await exportStrings();
        await exportPlurals();
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function exportStrings() {
    try {
        spinner.start("Downloading sheets file...");

        const projectSheets = await ProjectSheet.downloadSheets();

        const platformStrings = projectSheets.reduce(
            (acc, sheet) => [...acc, ...sheet.getPlatformStrings()],
            []
        );

        spinner.succeed();

        spinner.start("Generating strings...");

        files.exportStrings(platformStrings, conf.baseLanguage);

        spinner.succeed();
    } catch (error) {
        spinner.fail(error.message);
    }
}

async function exportPlurals() {
    if (!conf.hasPlurals()) return;

    try {
        spinner.start("Generating plurals...");

        const pluralsPath = conf.getPluralsFilePath();
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
    } catch (error) {
        spinner.fail(error.message);
    }
}
