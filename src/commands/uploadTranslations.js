const ISO6391 = require("iso-639-1");

const fs = require("fs/promises");

const conf = require("../config");
const xlsx = require("../xlsx");
const path = require("path");
const { client: oneSkyClient } = require("../onesky");
const spinner = require("../spinner");

module.exports = async function uploadTranslations() {
    try {
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
                const languageName = sheet.name;
                const languageCode = ISO6391.getCode(languageName);

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
