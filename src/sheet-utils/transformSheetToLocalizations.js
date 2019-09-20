const conf = require("../config");
const PlatformKey = require("../PlatformKey");

module.exports = function transformSheetToLocalizations(sheet) {
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
        let value = rowValue;
        if (conf.platform === PlatformKey.android && isHtml) {
            value = `<![CDATA[${rowValue}]]>`;
        }
        return {
            id: row[idColumn],
            key: row[keysColumn],
            value,
            allowDuplicates: row[allowDuplicatesColumn] || false,
            description: row[descriptionsColumn]
        };
    });
};

function columnIndexForHeader(sheet, header) {
    return sheet.data[0].findIndex((cellContent) => cellContent === header);
}

function notEmptyValue(row, columnIndex) {
    return row[columnIndex] !== undefined;
}
