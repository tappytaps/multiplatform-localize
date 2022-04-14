const sheetParser = require("./sheet-parser");
const checkForDuplicates = require("./checkForDuplicates");
const spinner = require("../spinner");

module.exports = { getPlatformStringsFromSheets, getOneSkyStringsFromSheets };

function getPlatformStringsFromSheets(
    sheets,
    { warningLogger = undefined, validate = true }
) {
    const strings = sheets
        .filter(isStringsSheet)
        .map(sheetParser.transformSheetToPlatformStrings)
        .reduce((a, b) => a.concat(b), []);

    if (validate) {
        checkForDuplicates(strings, warningLogger, { checkIds: false });
    }

    return strings;
}

function getOneSkyStringsFromSheets(sheets, { validate = true }) {
    const strings = sheets
        .filter(isStringsSheet)
        .map(sheetParser.transformSheetToOneSkyStrings)
        .reduce((a, b) => a.concat(b), []);

    if (validate) {
        checkForDuplicates(strings, (duplicates) => spinner.warn(duplicates), {
            checkKeys: false
        });
    }

    return strings;
}

function isStringsSheet(sheet) {
    return sheet.name !== "max";
}
