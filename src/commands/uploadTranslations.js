const fs = require("fs/promises");

const conf = require("../config");
const xlsx = require("../xlsx");
const path = require("path");
const { client: oneSkyClient } = require("../onesky");
const spinner = require("../spinner");
const languageCodes = require("../utils/language-codes");

module.exports = async function uploadTranslations() {
    try {
        conf.validate();

        const translationsDirPath = conf.getTranslationsDirPath();

        let files;
        try {
            files = await fs.readdir(translationsDirPath);
        } catch {
            files = [];
        }

        files = files.filter((file) => path.extname(file) === ".xlsx");

        if (files.length === 0) {
            spinner.fail(
                `No translation files found in ${translationsDirPath}. Please run the "translate" command first.`
            );
            return;
        }

        for (const file of files) {
            const filePath = path.join(translationsDirPath, file);
            const filePathInfo = path.parse(filePath);
            const fileName = filePathInfo.name;
            const oneSkyProjectId = conf.getOneSkyProjectIdForSheet(fileName);

            if (!oneSkyProjectId) {
                spinner.fail(
                    `No OneSky project ID found for "${fileName}". Please ensure the translation file name matches a configured sheet name. Skipping...`
                );
                continue;
            }

            const xlsxFile = await xlsx.read(filePath);

            const translationsSheet = xlsxFile[0];
            const translationsSheetHeader = translationsSheet.data[0];
            const translationsSheetData = translationsSheet.data.slice(1);

            for (let i = 2; i < translationsSheetHeader.length; i++) {
                const languageCode = translationsSheetHeader[i];
                const languageName = languageCodes.getName(languageCode);

                const localizedStrings = translationsSheetData.map((row) => ({
                    id: row[0],
                    value: row[i]
                }));

                spinner.start(
                    `Uploading ${localizedStrings.length} ${languageName} translations to ${fileName}...`
                );

                await oneSkyClient.uploadTranslations(
                    localizedStrings,
                    oneSkyProjectId,
                    languageCode
                );

                spinner.succeed();
            }
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};
