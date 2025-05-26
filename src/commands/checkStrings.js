const conf = require("../config");
const spinner = require("../spinner");
const oneSky = require("../onesky");
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
            (acc, sheet) => [...acc, ...sheet.getOneSkyStrings()],
            []
        );

        spinner.start("Downloading OneSky strings");

        const oneSkyStrings = await oneSky.getLocalizedStrings(
            conf.baseLanguage
        );

        const notUsedStrings = oneSkyStrings.filter((oneSkyString) => {
            return (
                originalStrings.find((originalString) => {
                    return `${originalString.id}` === `${oneSkyString.id}`;
                }) === undefined
            );
        });

        if (notUsedStrings.length > 0) {
            spinner.warn("Found some unused strings on OneSky");
            console.log(notUsedStrings);
        } else {
            spinner.succeed("No unused strings on OneSky");
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
