const { table } = require("table");

module.exports = function checkForDuplicates(
    projectSheets,
    warningLogger,
    { checkIds = true, checkKeys = true, checkValues = true } = {}
) {
    const allStrings = projectSheets.reduce((acc, projectSheet) => {
        return [...acc, ...projectSheet.getStrings()];
    }, []);

    if (checkIds) {
        const duplicatedStrings = checkIdsDuplicatesInLocalizations(allStrings);
        if (duplicatedStrings.length > 0) {
            throw new Error(
                `Found duplicated ids:\n${formatDuplicatedStrings(duplicatedStrings)}`
            );
        }
    }

    if (checkKeys) {
        const platformStrings = projectSheets.reduce((acc, projectSheet) => {
            return [...acc, ...projectSheet.getPlatformStrings()];
        }, []);
        const duplicatedStrings =
            checkKeysDuplicatesInLocalizations(platformStrings);
        if (duplicatedStrings.length > 0) {
            throw new Error(
                `Found duplicated keys:\n${formatDuplicatedStrings(duplicatedStrings)}`
            );
        }
    }

    if (checkValues) {
        const duplicatedStrings =
            checkValuesDuplicatesInLocalizations(allStrings);
        if (duplicatedStrings.length > 0 && warningLogger) {
            warningLogger(
                `Found duplicated strings:\n${formatDuplicatedStrings(duplicatedStrings)}`
            );
        }
    }
};

function formatDuplicatedStrings(duplicatedStrings) {
    const tableData = duplicatedStrings.reduce(
        (acc, string) => [...acc, [string.id, string.key, string.value]],
        [["id", "key", "value"]]
    );
    return table(tableData);
}

function checkIdsDuplicatesInLocalizations(strings) {
    return findDuplicates(strings, "id");
}

function checkKeysDuplicatesInLocalizations(strings) {
    return findDuplicates(strings, "key");
}

function checkValuesDuplicatesInLocalizations(strings) {
    return findDuplicates(
        strings.filter((string) => !string.allowDuplicates),
        "value"
    );
}

function count(strings, key) {
    return strings.reduce(
        (acc, string) =>
            Object.assign(acc, {
                [string[key]]: [...(acc[string[key]] || []), string]
            }),
        {}
    );
}

function findDuplicates(strings, key) {
    const keysCount = count(strings, key);
    return Object.keys(keysCount)
        .map((k) => keysCount[k])
        .filter((duplicates) => duplicates.length > 1)
        .flat();
}
