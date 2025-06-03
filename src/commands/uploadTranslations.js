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

            for (const sheet of xlsxFile) {
                const languageCode = sheet.name;
                const languageName = languageCodes.getName(languageCode);

                const localizedStrings = sheet.data
                    .slice(1)
                    .map((row) => ({ id: row[0], value: row[2] }));

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
