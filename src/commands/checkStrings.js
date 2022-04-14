const conf = require("../config");
const strings = require("../strings");
const spinner = require("../spinner");
const oneSky = require("../onesky");

module.exports = async function checkStrings() {
    conf.validate();
    conf.validateOneSkyConfiguration();

    try {
        spinner.start("Downloading xlsx strings");
        const originalStrings = await strings.getAllStrings();

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
