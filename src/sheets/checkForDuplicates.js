module.exports = function checkForDuplicates(
    projectSheets,
    warningLogger,
    { checkIds = true, checkKeys = true, checkValues = true } = {}
) {
    const allStrings = projectSheets.reduce((acc, projectSheet) => {
        return [...acc, ...projectSheet.getStrings()];
    }, []);

    if (checkIds) {
        const idsDuplicates = checkIdsDuplicatesInLocalizations(allStrings);
        if (idsDuplicates.length > 0) {
            throw new Error(`Found duplicated ids: ${idsDuplicates.join()}`);
        }
    }

    if (checkKeys) {
        const platformStrings = projectSheets.reduce((acc, projectSheet) => {
            return [...acc, ...projectSheet.getPlatformStrings()];
        }, []);
        const keysDuplicates =
            checkKeysDuplicatesInLocalizations(platformStrings);
        if (keysDuplicates.length > 0) {
            throw new Error(`Found duplicated keys: ${keysDuplicates.join()}`);
        }
    }

    if (checkValues) {
        const valuesDuplicates =
            checkValuesDuplicatesInLocalizations(allStrings);
        if (valuesDuplicates.length > 0 && warningLogger) {
            warningLogger(
                `Found duplicated strings: ${valuesDuplicates.join()}`
            );
        }
    }
};

function checkIdsDuplicatesInLocalizations(strings) {
    const stringsIds = strings.map((string) => string.id);
    return findDuplicates(stringsIds);
}

function checkKeysDuplicatesInLocalizations(strings) {
    const keys = strings.map((string) => string.key);
    return findDuplicates(keys);
}

function checkValuesDuplicatesInLocalizations(strings) {
    const keys = strings
        .filter((string) => !string.allowDuplicates)
        .map((string) => string.value);
    return findDuplicates(keys);
}

function count(values) {
    return values.reduce(
        (a, b) => Object.assign(a, { [b]: (a[b] || 0) + 1 }),
        {}
    );
}

function findDuplicates(values) {
    const valuesCount = count(values);
    return Object.keys(valuesCount).filter((a) => valuesCount[a] > 1);
}
