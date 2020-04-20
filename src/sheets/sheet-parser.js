const conf = require("../config");

module.exports = {
    transformSheetToPlatformStrings,
    transformSheetToOneSkyStrings
};

function transformSheetToPlatformStrings(sheet) {
    const idColumn = columnIndexForHeader(sheet, conf.idColumnName);
    const keysColumn = columnIndexForHeader(sheet, conf.keysColumnName);
    const commonValuesColumn = columnIndexForHeader(
        sheet,
        conf.commonValuesColumnName
    );
    const appValuesColumn = columnIndexForHeader(
        sheet,
        conf.appSpecificValuesColumnName
    );
    const allowDuplicatesColumn = columnIndexForHeader(
        sheet,
        conf.allowDuplicatesColumnName
    );
    const descriptionsColumn = columnIndexForHeader(
        sheet,
        conf.descriptionColumnName
    );
    const isHtmlColumn = columnIndexForHeader(sheet, conf.isHtmlColumnName);

    const sheetData = sheet.data
        .slice(1)
        .filter((row) => notEmptyValue(row, keysColumn))
        .filter(
            (row) =>
                notEmptyValue(row, commonValuesColumn) ||
                notEmptyValue(row, appValuesColumn)
        );

    return sheetData.map((row) => {
        const isHtml = row[isHtmlColumn] || false;
        const rowValue = row[appValuesColumn] || row[commonValuesColumn];
        const hasBothValues =
            (row[appValuesColumn] && row[commonValuesColumn]) || false;
        const isAppSpecific = row[appValuesColumn] !== undefined;
        return {
            id: row[idColumn],
            key: row[keysColumn],
            value: rowValue,
            allowDuplicates: row[allowDuplicatesColumn] || false,
            description: row[descriptionsColumn],
            isHtml,
            hasBothValues,
            isAppSpecific
        };
    });
}

function transformSheetToOneSkyStrings(sheet) {
    const idColumn = columnIndexForHeader(sheet, conf.idColumnName);
    const commonValuesColumn = columnIndexForHeader(
        sheet,
        conf.commonValuesColumnName
    );
    const appValuesColumn = columnIndexForHeader(
        sheet,
        conf.appSpecificValuesColumnName
    );
    const allowDuplicatesColumn = columnIndexForHeader(
        sheet,
        conf.allowDuplicatesColumnName
    );
    const descriptionsColumn = columnIndexForHeader(
        sheet,
        conf.descriptionColumnName
    );
    const sheetData = sheet.data
        .slice(1)
        .filter(
            (row) =>
                notEmptyValue(row, commonValuesColumn) ||
                notEmptyValue(row, appValuesColumn)
        );

    return sheetData.map((row) => {
        const rowValue = row[appValuesColumn] || row[commonValuesColumn];
        const hasBothValues =
            (row[appValuesColumn] && row[commonValuesColumn]) || false;
        const isAppSpecific = row[appValuesColumn] !== undefined;
        return {
            id: row[idColumn],
            key: row[idColumn],
            value: rowValue,
            allowDuplicates: row[allowDuplicatesColumn] || false,
            description: row[descriptionsColumn],
            hasBothValues,
            isAppSpecific
        };
    });
}

function columnIndexForHeader(sheet, header) {
    if (!header) {
        return -1;
    }
    return sheet.data[0].findIndex((cellContent) => cellContent === header);
}

function notEmptyValue(row, columnIndex) {
    return row[columnIndex] !== undefined;
}
