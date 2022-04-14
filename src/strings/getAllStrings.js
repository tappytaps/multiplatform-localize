const xlsx = require("../xlsx");
const conf = require("../config");
const sheets = require("../sheets");

/**
 *
 * @returns {Array}
 */
module.exports = async function getAllStrings({ validate = false } = {}) {
    const xlsxBuffer = await xlsx.download(conf.xlsxUrl);
    const xlsxSheets = xlsx.parse(xlsxBuffer);

    return sheets.getOneSkyStringsFromSheets(xlsxSheets, {
        validate
    });
};
