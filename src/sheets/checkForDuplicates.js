const chalk = require("chalk");

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
                `Found duplicated ids:\n${formatDuplicatedStrings(duplicatedStrings, "id")}`
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
                `Found duplicated keys:\n${formatDuplicatedStrings(duplicatedStrings, "key")}`
            );
        }
    }

    if (checkValues) {
        const duplicatedStrings =
            checkValuesDuplicatesInLocalizations(allStrings);
        if (duplicatedStrings.length > 0 && warningLogger) {
            warningLogger(
                `Found duplicated strings:\n${formatDuplicatedStrings(duplicatedStrings, "value")}`
            );
        }
    }
};

function formatDuplicatedStrings(duplicatedStrings, highlightedProperty) {
    return duplicatedStrings.reduce((acc, string) => {
        var result = `${acc}`;
        result +=
            (highlightedProperty === "id"
                ? chalk.red(string.id)
                : chalk.gray(string.id)) + chalk.gray(", ");
        if (string.key) {
            result +=
                highlightedProperty === "key"
                    ? chalk.red(string.key)
                    : chalk.gray(string.key) + chalk.gray(", ");
        }
        result +=
            highlightedProperty === "value"
                ? chalk.red(string.value)
                : chalk.gray(string.value);
        return `${result}\n`;
    }, "");
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
