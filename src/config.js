const rc = require("rc");

const PlatformKey = require("./PlatformKey");

const conf = rc("stringsgen", {
    idColumnName: "id",
    valuesColumnName: "value_en",
    allowDuplicatesColumnName: "allow_duplicates",
    descriptionColumnName: "description",
    isHtmlColumnName: "is_html",
    developmentLanguage: "en"
});

function validate() {
    if (
        !conf.xlsxUrl ||
        !conf.platform ||
        !conf.keysColumnName ||
        !conf.valuesColumnName ||
        !conf.sheets ||
        !conf.outputDir ||
        !conf.outputName
    ) {
        console.error(
            "🙏 Config file should define xlsxUrl, platform, keysColumnName, valuesColumnName, sheets, outputDir, outputName."
        );
        process.exit(1);
    }

    if (!Object.values(PlatformKey).includes(conf.platform)) {
        console.error(
            `😢 Unsopported platform. Supported platforms: ${Object.values(
                PlatformKey
            )}`
        );
        process.exit(1);
    }
}

function validateOneSkyConfiguration() {
    if (
        !conf.oneSky ||
        !conf.oneSky.secret ||
        !conf.oneSky.projectId ||
        !conf.oneSky.apiKey
    ) {
        console.error(
            "🙏 Config file should define oneSky.secret, oneSky.projectId and oneSky.apiKey."
        );
        process.exit(1);
    }
}

module.exports = {
    ...conf,
    validate,
    validateOneSkyConfiguration
};
