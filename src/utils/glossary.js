const conf = require("../config");
const xlsx = require("../xlsx");

module.exports = {
    isAvailable,
    getGlossaryForLanguage
};

function isAvailable() {
    if (!conf.glossaryUrl) {
        return false;
    }
    return true;
}

async function getGlossaryForLanguage(oneSkyLanguage) {
    const glossaryXlsx = await xlsx.download(conf.glossaryUrl);
    const glossarySheet = glossaryXlsx[0].data;
    const glossarySheetHeader = glossarySheet[0];
    const glossarySheetData = glossarySheet.slice(1);

    const languageColumnIndex = glossarySheetHeader.indexOf(
        oneSkyLanguage.englishName
    );

    return glossarySheetData.reduce(
        (acc, row) =>
            Object.assign(acc, { [row[0]]: row[languageColumnIndex] }),
        {}
    );
}
