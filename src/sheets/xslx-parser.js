const sheetParser = require("./sheet-parser");
const checkForDuplicates = require("./checkForDuplicates");

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
        checkForDuplicates(strings, warningLogger);
    }

    return strings;
}

function getOneSkyStringsFromSheets(
    sheets,
    { warningLogger = undefined, validate = true }
) {
    const strings = sheets
        .filter(isStringsSheet)
        .map(sheetParser.transformSheetToOneSkyStrings)
        .reduce((a, b) => a.concat(b), []);

    if (validate) {
        checkForDuplicates(strings, warningLogger);
    }

    return strings;
}

function isStringsSheet(sheet) {
    return sheet.name !== "max";
}
