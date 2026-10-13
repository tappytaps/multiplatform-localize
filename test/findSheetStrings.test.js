const test = require("node:test");
const assert = require("node:assert/strict");

const conf = require("../src/config");
const ProjectSheet = require("../src/sheets/ProjectSheet");
const findSheetStrings = require("../src/sheets/findSheetStrings");

function projectSheet(name, componentSlug, rows) {
    const header = [conf.columns.id, conf.columns.key, "value"];
    return new ProjectSheet(
        name,
        [header, ...rows],
        "value",
        "monitoring-apps",
        componentSlug
    );
}

const common = projectSheet("Common", "common", [
    [2390, "authentication.accountVerification.title", "Account exists"],
    [12392, "other.key", "Other"]
]);
const appSpecific = projectSheet("App specific", "bibino", [
    [2392, "authentication.accountVerification.message", "Enter password"],
    [2393, "shared.key", "Shared in app specific"]
]);
const camerito = projectSheet("Camerito", "camerito", [
    [2403, "shared.key", "Shared in Camerito"]
]);

function describe(matches) {
    return matches.map(({ sheet, string }) => [sheet.name, string.id]);
}

test("finds a string by its platform key", () => {
    const matches = findSheetStrings(
        [common, appSpecific],
        "authentication.accountVerification.message"
    );

    assert.deepEqual(describe(matches), [["App specific", 2392]]);
});

test("finds a string by its id given as text, without partial id matches", () => {
    const matches = findSheetStrings([common, appSpecific], "2392");

    assert.deepEqual(describe(matches), [["App specific", 2392]]);
});

test("returns the string from every sheet that has the key", () => {
    const matches = findSheetStrings(
        [common, appSpecific, camerito],
        "shared.key"
    );

    assert.deepEqual(describe(matches), [
        ["App specific", 2393],
        ["Camerito", 2403]
    ]);
});

test("returns no matches for an unknown key", () => {
    assert.deepEqual(
        findSheetStrings([common, appSpecific], "missing.key"),
        []
    );
});
