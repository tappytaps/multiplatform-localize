const test = require("node:test");
const assert = require("node:assert/strict");

const unitsQuery = require("../src/weblate/unitsQuery");

test("matches the string id exactly, not as a substring", () => {
    assert.equal(
        unitsQuery({
            projectSlug: "monitoring-apps",
            componentSlug: "bibino",
            context: 2392
        }),
        "project:monitoring-apps AND component:bibino AND context:=2392"
    );
});

test("limits units to a language and to not yet translated ones", () => {
    assert.equal(
        unitsQuery({
            projectSlug: "monitoring-apps",
            componentSlug: "common",
            language: "cs",
            untranslated: true
        }),
        "project:monitoring-apps AND component:common AND language:cs AND state:<translated"
    );
});
