const conf = require("../config");
const spinner = require("../spinner");
const weblate = require("../weblate");
const ProjectSheet = require("../sheets/ProjectSheet");
const config = require("../config");

module.exports = async function checkStrings() {
    try {
        config.validate();

        spinner.start("Downloading sheets file...");

        const projectSheets = await ProjectSheet.downloadSheets({
            validateValues: false
        });

        const originalStrings = projectSheets.reduce(
            (acc, sheet) => [...acc, ...sheet.getFinalStrings()],
            []
        );

        spinner.start("Downloading Weblate strings");

        const weblateStrings = await ProjectSheet.getLocalizedStrings(
            projectSheets,
            conf.baseLanguage
        );

        const notUsedStrings = weblateStrings.filter((weblateString) => {
            return (
                originalStrings.find((originalString) => {
                    return `${originalString.id}` === `${weblateString.id}`;
                }) === undefined
            );
        });

        if (notUsedStrings.length > 0) {
            spinner.warn("Found some unused strings on Weblate");
            console.log(notUsedStrings);
        } else {
            spinner.succeed("No unused strings on Weblate");
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
