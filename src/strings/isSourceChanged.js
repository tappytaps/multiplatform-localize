/**
 * Compares a source string from the sheet with the source on Weblate.
 * The sheet writes line breaks as `\n`, Weblate keeps them as real line breaks.
 *
 * @param {string} sheetValue
 * @param {string} weblateSource
 * @returns {boolean} true when the sheet has a text that is not on Weblate yet
 */
module.exports = function isSourceChanged(sheetValue, weblateSource) {
    const sheetText = String(sheetValue).replace(/\\n/g, "\n").trim();
    return sheetText !== String(weblateSource).trim();
};
