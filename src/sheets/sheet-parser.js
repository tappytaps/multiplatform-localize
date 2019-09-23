const conf = require("../config");

module.exports = {
    transformSheetToPlatformStrings,
    transformSheetToOneSkyStrings
};

function transformSheetToPlatformStrings(sheet) {
    const idColumn = columnIndexForHeader(sheet, conf.idColumnName);
    const keysColumn = columnIndexForHeader(sheet, conf.keysColumnName);
    const valuesColumn = columnIndexForHeader(sheet, conf.valuesColumnName);
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
        .filter((row) => notEmptyValue(row, valuesColumn));

    return sheetData.map((row) => {
        const isHtml = row[isHtmlColumn] || false;
        const rowValue = row[valuesColumn];
        return {
            id: row[idColumn],
            key: row[keysColumn],
            value: rowValue,
            allowDuplicates: row[allowDuplicatesColumn] || false,
            description: row[descriptionsColumn],
            isHtml
        };
    });
}

function transformSheetToOneSkyStrings(sheet) {
    const idColumn = columnIndexForHeader(sheet, conf.idColumnName);
    const valuesColumn = columnIndexForHeader(sheet, conf.valuesColumnName);
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
        .filter((row) => notEmptyValue(row, valuesColumn));

    return sheetData.map((row) => {
        const rowValue = row[valuesColumn];
        return {
            id: row[idColumn],
            key: row[idColumn],
            value: rowValue,
            allowDuplicates: row[allowDuplicatesColumn] || false,
            description: row[descriptionsColumn]
        };
    });
}

function columnIndexForHeader(sheet, header) {
    return sheet.data[0].findIndex((cellContent) => cellContent === header);
}

function notEmptyValue(row, columnIndex) {
    return row[columnIndex] !== undefined;
}
