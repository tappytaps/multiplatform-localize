const XLSX = require("xlsx-js-style");

module.exports = async function write(path, xlsxData) {
    const workbook = XLSX.utils.book_new();

    for (let index = 0; index < xlsxData.length; index++) {
        const sheet = xlsxData[index];
        const sheetName = sheet.name ?? `Sheet ${index}`;
        const sheetData = sheet.data;

        const numberOfColumns = Math.max(...sheetData.map((row) => row.length));
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!cols"] = [];

        for (let index = 0; index < numberOfColumns; index++) {
            worksheet["!cols"].push({ wch: 25 });
        }

        // Enable text wrapping for all cells
        for (let cell in worksheet) {
            // Skip non-cell properties (like !cols, !rows, etc.)
            if (cell[0] === "!") continue;

            // Apply wrapText style to each cell
            worksheet[cell].s = { alignment: { wrapText: true } };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    XLSX.writeFile(workbook, path);
};
