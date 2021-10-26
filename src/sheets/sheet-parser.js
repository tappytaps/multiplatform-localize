const conf = require("../config");

module.exports = {
    transformSheetToPlatformStrings,
    transformSheetToOneSkyStrings
};

class Sheet {
    
    constructor(sheet) {
        this.sheet = sheet;
    }

    columnIndexForHeader(columnName) {
        if (!columnName) {
            return -1;
        }
        return this.sheet.data[0].findIndex((cellContent) => cellContent === columnName);
    }

    getPlatformStrings() {
        return this.getRows().filter((string) => string.key);
    }

    getOneSkyStrings() {
        return this.getRows().filter((string) => string.isFinal);
    }

    getRows() {
        const idColumn = this.columnIndexForHeader(conf.idColumnName);
        const keysColumn = this.columnIndexForHeader(conf.keysColumnName);
        const commonValuesColumn = this.columnIndexForHeader(conf.commonValuesColumnName);
        const appValuesColumn = this.columnIndexForHeader(conf.appSpecificValuesColumnName);
        const allowDuplicatesColumn = this.columnIndexForHeader(conf.allowDuplicatesColumnName);
        const descriptionsColumn = this.columnIndexForHeader(conf.descriptionColumnName);
        const isHtmlColumn = this.columnIndexForHeader(conf.isHtmlColumnName);
        const isFinalColumn = this.columnIndexForHeader(conf.isFinalColumnName);

        const rowsWithValue = this.sheet.data
            .slice(1)
            .filter(
                (row) =>
                    notEmptyValue(row, commonValuesColumn) ||
                    notEmptyValue(row, appValuesColumn)
            );

        return rowsWithValue.map((row) => {
            const isHtml = row[isHtmlColumn] || false;
            const rowValue = row[appValuesColumn] || row[commonValuesColumn];
            const hasBothValues =
                (row[appValuesColumn] && row[commonValuesColumn]) || false;
            const isAppSpecific = row[appValuesColumn] !== undefined;
            
            let isFinal = row[isFinalColumn];
            
            if (isFinal === undefined) {
                isFinal = true;
            }

            return {
                id: row[idColumn],
                key: row[keysColumn],
                value: rowValue,
                allowDuplicates: row[allowDuplicatesColumn] || false,
                description: row[descriptionsColumn],
                isHtml,
                isFinal,
                hasBothValues,
                isAppSpecific
            };
        });
    }

}

function transformSheetToPlatformStrings(sheetData) {
    const sheet = new Sheet(sheetData);
    return sheet.getPlatformStrings();
}

function transformSheetToOneSkyStrings(sheetData) {
    const sheet = new Sheet(sheetData)
    return sheet.getOneSkyStrings()
}

function notEmptyValue(row, columnIndex) {
    return row[columnIndex] !== undefined;
}