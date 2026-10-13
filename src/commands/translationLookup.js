const spinner = require("../spinner");
const ProjectSheet = require("../sheets/ProjectSheet");
const findSheetStrings = require("../sheets/findSheetStrings");

const unitStateNames = {
    0: "untranslated",
    10: "needs editing",
    20: "translated",
    30: "approved",
    100: "read-only"
};

/**
 * Downloads the sheets and finds a string by its platform key or id.
 * Throws when the string is not in any sheet.
 */
async function findStringsInSheets(keyOrId) {
    spinner.start("Downloading sheets file...");
    const projectSheets = await ProjectSheet.downloadSheets({
        validateIds: false
    });
    spinner.succeed();
    const matches = findSheetStrings(projectSheets, keyOrId);
    if (matches.length === 0) {
        const sheetNames = projectSheets.map((sheet) => sheet.name);
        throw new Error(
            `String "${keyOrId}" not found in sheets: ${sheetNames.join(", ")}`
        );
    }
    return matches;
}

function unitStateName(state) {
    return unitStateNames[state] ?? `state ${state}`;
}

module.exports = {
    findStringsInSheets,
    unitStateName
};
