const fs = require("fs");

const conf = require("../config");
const weblateClient = require("../weblate/client");
const spinner = require("../spinner");

module.exports = async function uploadStrings() {
    try {
        conf.validate();

        if (conf.hasPlurals()) {
            spinner.start("Uploading plurals to Weblate");

            const pluralsFilePath = conf.getPluralsFilePath();
            const pluralsFileName = conf.getPluralsFileName();
            const pluralsContent = fs.readFileSync(pluralsFilePath, "utf8");

            await weblateClient.postTranslationsFile(
                conf.plurals.weblateProjectSlug,
                conf.plurals.weblateComponentSlug,
                conf.baseLanguage,
                pluralsContent,
                pluralsFileName
            );

            spinner.succeed();
        } else {
            spinner.info("No plurals file configured for upload.");
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
