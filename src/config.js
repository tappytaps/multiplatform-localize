const path = require("path");

const rc = require("rc");

const PlatformKey = require("./PlatformKey");

const conf = rc("stringsgen", {
    idColumnName: "id",
    valuesColumnName: "value_en",
    allowDuplicatesColumnName: "allow_duplicates",
    descriptionColumnName: "description",
    isHtmlColumnName: "is_html",
    baseLanguage: "en"
});

function validate() {
    validateRequiredFields([
        "xlsxUrl",
        "platform",
        "idColumnName",
        "keysColumnName",
        "valuesColumnName",
        "sheets",
        "outputDir",
        "outputName"
    ]);
    validatePlatform();
}

function validateOneSkyConfiguration() {
    validateRequiredFields([
        "xlsxUrl",
        "idColumnName",
        "valuesColumnName",
        "sheets"
    ]);
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

function validateRequiredFields(requiredFields) {
    const providedFields = Object.keys(conf);
    const missingFields = requiredFields.filter(
        (field) => !providedFields.includes(field)
    );
    if (missingFields.length > 0) {
        console.error(`🙏 Missing configuration: ${missingFields.join(", ")}`);
        process.exit(1);
    }
}

function validatePlatform() {
    if (!Object.values(PlatformKey).includes(conf.platform)) {
        console.error(
            `😢 Unsopported platform. Supported platforms: ${Object.values(
                PlatformKey
            )}`
        );
        process.exit(1);
    }
}

function hasPlurals() {
    return conf.inputPlurals !== undefined;
}

function getPluralsPath() {
    return path.resolve(process.cwd(), conf.inputPlurals);
}

function getPluralsFileName() {
    return path.basename(getPluralsPath());
}

function getOutputDirPath(language) {
    let outputSubDir;

    switch (conf.platform) {
        case PlatformKey.ios:
            outputSubDir = `${language}.lproj`;
            break;
        case PlatformKey.android:
            outputSubDir = `values_${language}`;
            break;
        case PlatformKey.web:
            outputSubDir = `${language}`;
            break;
        default:
            break;
    }

    return path.resolve(process.cwd(), conf.outputDir, outputSubDir);
}

module.exports = {
    ...conf,
    validate,
    validateOneSkyConfiguration,
    hasPlurals,
    getPluralsPath,
    getPluralsFileName,
    getOutputDirPath
};
