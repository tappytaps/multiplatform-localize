const fs = require("fs");

const conf = require("../config");
const strings = require("../strings");
const files = require("../files");
const spinner = require("../spinner");

module.exports = async function generateStrings() {
    conf.validate();

    try {
        await exportStrings();
        await exportPlurals();
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function exportStrings() {
    spinner.start("Generating strings");

    files.exportStrings(await strings.getPlatformStrings(), conf.baseLanguage);

    spinner.succeed();
}

async function exportPlurals() {
    if (!conf.hasPlurals()) return;

    spinner.start("Generating plurals");

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
