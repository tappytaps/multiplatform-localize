const xlsx = require("../xlsx");
const conf = require("../config");
const sheets = require("../sheets");
const prepareStringValueForPlatform = require("./prepareStringValueForPlatform");

module.exports = async function getPlatformStrings({ validate = false } = {}) {
    const xlsxBuffer = await xlsx.download(conf.xlsxUrl);
    const xlsxSheets = xlsx.parse(xlsxBuffer);

    return sheets
        .getPlatformStringsFromSheets(xlsxSheets, {
            validate
        })
        .map((string) => {
            return {
                ...string,
                value: prepareStringValueForPlatform(
                    string.value,
                    conf.platform,
                    string.isHtml
                )
            };
        });
};
