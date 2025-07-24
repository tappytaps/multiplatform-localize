const conf = require("../config");
const prepareStringValueForPlatform = require("./prepareStringValueForPlatform");

module.exports = function mapLocalizedStringsForPlatform(
    sheetStrings,
    localizedStrings
) {
    return localizedStrings
        .map((localizedString) => {
            const sheetString = sheetStrings.find((s) => {
                return String(s.id) === String(localizedString.id);
            });
            if (!sheetString) {
                return null;
            }
            const { key, isHtml } = sheetString;
            return {
                key,
                value: prepareStringValueForPlatform(
                    localizedString.value,
                    conf.platform,
                    isHtml
                )
            };
        })
        .filter((string) => {
            return string !== null;
        });
};
