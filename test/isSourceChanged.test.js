const test = require("node:test");
const assert = require("node:assert/strict");

const isSourceChanged = require("../src/strings/isSourceChanged");

test("treats an escaped line break in the sheet as the line break on Weblate", () => {
    assert.equal(
        isSourceChanged(
            "Premium is active until %@.\\nWhen it expires, the app stays free.",
            "Premium is active until %@.\nWhen it expires, the app stays free."
        ),
        false
    );
});

test("reports a changed source text", () => {
    assert.equal(
        isSourceChanged("Enter password", "Enter your password"),
        true
    );
});

test("ignores surrounding whitespace", () => {
    assert.equal(isSourceChanged("Enter password ", "Enter password"), false);
});
