module.exports = function checkForDuplicates(localizations, warningLogger) {
    const idsDuplicates = checkIdsDuplicatesInLocalizations(localizations);
    const keysDuplicates = checkKeysDuplicatesInLocalizations(localizations);
    const valuesDuplicates = checkValuesDuplicatesInLocalizations(
        localizations
    );
    const stringsWithBothValues = checkBothValues(localizations);

    if (idsDuplicates.length > 0) {
        throw new Error(`Found id duplicates: ${idsDuplicates.join()}`);
    }
    if (keysDuplicates.length > 0) {
        throw new Error(
            `Found localization keys duplicates: ${keysDuplicates.join()}`
        );
    }
    if (valuesDuplicates.length > 0 && warningLogger) {
        warningLogger(
            `Found localization duplicates: ${valuesDuplicates.join()}`
        );
    }
    if (stringsWithBothValues.length > 0 && warningLogger) {
        warningLogger(
            `Found strings with common and app specific values: ${stringsWithBothValues.join()}`
        );
    }
};

function checkIdsDuplicatesInLocalizations(localizations) {
    const localizationIds = localizations.map(
        (localization) => localization.id
    );
    return duplicates(localizationIds);
}

function checkKeysDuplicatesInLocalizations(localizations) {
    const localizationKeys = localizations.map(
        (localization) => localization.key
    );
    return duplicates(localizationKeys);
}

function checkValuesDuplicatesInLocalizations(localizations) {
    const localizationValues = localizations
        .filter((localization) => !localization.allowDuplicates)
        .map((localization) => localization.value);
    return duplicates(localizationValues);
}

function checkBothValues(localizations) {
    return localizations
        .filter((localization) => localization.hasBothValues)
        .map((localization) => localization.id);
}

function count(values) {
    return values.reduce(
        (a, b) => Object.assign(a, { [b]: (a[b] || 0) + 1 }),
        {}
    );
}

function duplicates(values) {
    const valuesCount = count(values);
    return Object.keys(valuesCount).filter((a) => valuesCount[a] > 1);
}
