const test = require("node:test");
const assert = require("node:assert/strict");

const findFormatMismatches = require("../src/strings/findFormatMismatches");

test("accepts a translation with the same placeholders and tags", () => {
    assert.deepEqual(
        findFormatMismatches(
            "Enter password for Bibino account <color>%@</color>",
            "Zadejte heslo k účtu Bibino <color>%@</color>"
        ),
        []
    );
});

test("accepts reordered positional placeholders", () => {
    assert.deepEqual(
        findFormatMismatches("%1$@ has %2$d cameras", "%2$d kamer má %1$@"),
        []
    );
});

test("ignores escaped percent signs", () => {
    assert.deepEqual(findFormatMismatches("Battery %d%%", "Baterie %d %%"), []);
    assert.deepEqual(findFormatMismatches("100%% sure", "Naprosto jistě"), []);
});

test("reports a missing placeholder", () => {
    const problems = findFormatMismatches("Hello %@", "Ahoj");

    assert.equal(problems.length, 1);
    assert.match(problems[0], /%@/);
});

test("reports a placeholder of a different type", () => {
    const problems = findFormatMismatches("%d minutes", "%@ minut");

    assert.ok(problems.length > 0);
    assert.match(problems.join("\n"), /%d/);
});

test("reports an extra placeholder", () => {
    const problems = findFormatMismatches("Hello", "Ahoj %@");

    assert.equal(problems.length, 1);
    assert.match(problems[0], /%@/);
});

test("reports a missing tag", () => {
    const problems = findFormatMismatches(
        "Enter password for <color>%@</color>",
        "Zadejte heslo pro %@"
    );

    assert.ok(problems.length > 0);
    assert.match(problems.join("\n"), /<color>/);
});

test("does not take a plain percent sign in text for a placeholder", () => {
    assert.deepEqual(findFormatMismatches("50% off", "Sleva 50 %"), []);
});
