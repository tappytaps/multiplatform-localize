const oneSky = require("../onesky");
const conf = require("../config");
const prepareStringValueForPlatform = require("./prepareStringValueForPlatform");

module.exports = async function getLocalizedStrings(strings, language) {
    return prepareLocalizedStringsForPlatform(
        strings,
        await oneSky.getLocalizedStrings(language)
    );
};

function prepareLocalizedStringsForPlatform(strings, localizedStrings) {
    return localizedStrings
        .map((localizedString) => {
            const originalString = strings.find((s) => {
                return String(s.id) === String(localizedString.id);
            });
            if (!originalString) {
                return null;
            }
            const { key, isHtml } = originalString;
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
}
