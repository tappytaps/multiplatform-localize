var idsColumnName = "id";
var valuesColumnName = "value_en";

var sheetNames = ["Sheet1"];
var maxIdSheetName = "max";

function onChange() {
    generateIds();
}

function generateIds() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var worksheets = sheetNames.map(function (sheetName) {
        return spreadsheet.getSheetByName(sheetName);
    });
    var maxWorksheet = spreadsheet.getSheetByName(maxIdSheetName);
    var max = Number(maxWorksheet.getRange(1, 1).getValue());

    for (
        var worksheetIndex = 0;
        worksheetIndex < worksheets.length;
        worksheetIndex++
    ) {
        var worksheet = worksheets[worksheetIndex];
        var numberOfRows = worksheet.getDataRange().getNumRows();
        var numberOfColumns = worksheet.getDataRange().getNumColumns();

        var headers = worksheet.getSheetValues(1, 1, 1, numberOfColumns)[0];
        var idsColumnIndex = headers.indexOf(idsColumnName);
        var valuesColumnIndex = headers.indexOf(valuesColumnName);

        var values = worksheet.getSheetValues(
            2,
            1,
            numberOfRows,
            numberOfColumns
        );

        for (var i = 0; i < values.length; i++) {
            var id = values[i][idsColumnIndex];
            var value = values[i][valuesColumnIndex];
            if (value && id === "") {
                worksheet.getRange(i + 2, idsColumnIndex + 1).setValue(max + 1);
                max += 1;
                saveMaxValue(max);
            }
        }
    }
}

function saveMaxValue(value) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var maxWorksheet = spreadsheet.getSheetByName(maxIdSheetName);
    maxWorksheet.getRange(1, 1).setValue(value);
}
