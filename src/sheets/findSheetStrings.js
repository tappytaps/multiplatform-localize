/**
 * Finds strings in project sheets by their platform key or id.
 *
 * @param {ProjectSheet[]} projectSheets
 * @param {string} keyOrId platform key (e.g. key_ios) or string id
 * @returns {{ sheet: ProjectSheet, string: object }[]} matches from all sheets
 */
module.exports = function findSheetStrings(projectSheets, keyOrId) {
    const query = String(keyOrId).trim();
    return projectSheets.flatMap((sheet) =>
        sheet
            .getStrings()
            .filter(
                (string) => string.key === query || String(string.id) === query
            )
            .map((string) => ({ sheet, string }))
    );
};
