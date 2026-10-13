// printf style format specifiers used in strings (%@, %d, %ld, %1$@, %.1f, ...).
// The space flag is left out on purpose, so plain text like "50% off" is not taken for a specifier.
const formatSpecifierExpression =
    /%(?:\d+\$)?[-+0#]*(?:\d+|\*)?(?:\.(?:\d+|\*))?(?:hh|h|ll|l|q|L|z|t|j)?[@dDiuUxXoOfFeEgGaAcCsSp%]/g;
const tagExpression = /<\/?[A-Za-z][\w-]*[^>]*>/g;

/**
 * Compares format specifiers and tags of a source string and its translation.
 *
 * @param {string} source
 * @param {string} target
 * @returns {string[]} problems, empty when the translation keeps all specifiers and tags
 */
module.exports = function findFormatMismatches(source, target) {
    const problems = [];
    for (const [label, extract] of [
        ["placeholder", formatSpecifiers],
        ["tag", tags]
    ]) {
        const sourceItems = extract(source);
        const targetItems = extract(target);
        for (const item of difference(sourceItems, targetItems)) {
            problems.push(`missing ${label} ${item}`);
        }
        for (const item of difference(targetItems, sourceItems)) {
            problems.push(`unexpected ${label} ${item}`);
        }
    }
    return problems;
};

function formatSpecifiers(text) {
    return (text.match(formatSpecifierExpression) ?? [])
        .filter((specifier) => specifier !== "%%")
        .map((specifier) => specifier.replace(/^%\d+\$/, "%"));
}

function tags(text) {
    return (text.match(tagExpression) ?? []).map((tag) =>
        tag.replace(/^<(\/?)([A-Za-z][\w-]*)[^>]*>$/, "<$1$2>")
    );
}

// Items of `items` that have no counterpart in `others` (multiset difference).
function difference(items, others) {
    const remaining = [...others];
    return items.filter((item) => {
        const index = remaining.indexOf(item);
        if (index === -1) {
            return true;
        }
        remaining.splice(index, 1);
        return false;
    });
}
