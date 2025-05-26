const path = require("path");

const rc = require("rc");
const ISO6391 = require("iso-639-1");

const PlatformKey = require("./PlatformKey");
const WebParameterType = require("./WebParameterType");

const conf = rc("stringsgen", {
    columns: {
        id: "id",
        key: "key",
        allowDuplicates: "allow_duplicates",
        description: "description",
        isHtml: "is_html",
        isFinal: "is_final",
        aiTranslationDescription: "ai_translation_description"
    },
    baseLanguage: "en",
    nativeLanguage: "cs",
    webParameterType: WebParameterType.value
});

function validate() {
    validateRequiredFields(["xlsxUrl", "platform", "outputDir", "outputName"]);
    validatePlatform();
    validateOneSkyConfiguration();
}

function validateOneSkyConfiguration() {
    validateRequiredFields(["xlsxUrl"]);

    const apiKey = getOneSkyApiKey();
    const apiSecret = getOneSkyApiSecret();

    if (!apiKey || !apiSecret) {
        console.error(
            "😢 Missing OneSky API key or secret. Please set ONESKY_API_KEY and ONESKY_API_SECRET environment variables."
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
            `😢 Unsupported platform. Supported values: ${Object.values(
                PlatformKey
            )}`
        );
        process.exit(1);
    }
    if (!Object.values(WebParameterType).includes(conf.webParameterType)) {
        console.error(
            `😢 Unsopported webParameterType. Supported values: ${Object.values(
                WebParameterType
            )}`
        );
        process.exit(1);
    }
}

function getOneSkyApiKey() {
    return process.env.ONESKY_API_KEY;
}

function getOneSkyApiSecret() {
    return process.env.ONESKY_API_SECRET;
}

function getSheets() {
    return conf.sheets;
}

function getPluralsOneSkyProjectId() {
    return conf.plurals.oneSkyProjectId;
}

function getPluralsFilePath() {
    return path.resolve(
        process.cwd(),
        getConfigDirname(),
        conf.plurals.inputFile
    );
}

function getPluralsFileName() {
    return path.basename(getPluralsFilePath());
}

function hasPlurals() {
    return conf.plurals !== undefined;
}

function getWebParameterType() {
    return conf.webParameterType;
}

function getConfigDirname() {
    return path.dirname(conf.config);
}

function getSupportedLanguages() {
    return conf.languages;
}

function getNonBaseLanguages() {
    return conf.languages.filter((language) => language !== conf.baseLanguage);
}

function getOneSkyProjectIdForSheet(sheetName) {
    return conf.sheets.find((sheet) => sheet.name === sheetName)
        ?.oneSkyProjectId;
}

function getTranslationsDirPath() {
    return path.resolve(
        process.cwd(),
        getConfigDirname(),
        conf.outputDir,
        "translations"
    );
}

function getOutputDirPath(language) {
    let outputSubDir;

    switch (conf.platform) {
        case PlatformKey.ios:
            outputSubDir = `${language}.lproj`;
            break;
        case PlatformKey.android:
            if (language === conf.baseLanguage) {
                outputSubDir = "values";
            } else {
                outputSubDir = `values-${language}`;
            }
            break;
        case PlatformKey.web:
            outputSubDir = `${language}`;
            break;
        default:
            break;
    }

    return path.resolve(
        process.cwd(),
        getConfigDirname(),
        conf.outputDir,
        outputSubDir
    );
}

function getNativeLanguage() {
    return conf.nativeLanguage;
}

function getNativeLanguageName() {
    return ISO6391.getName(conf.nativeLanguage);
}

function getBaseLanguage() {
    return conf.baseLanguage;
}

function getBaseLanguageName() {
    return ISO6391.getName(conf.baseLanguage);
}

module.exports = {
    ...conf,
    validate,
    validateOneSkyConfiguration,
    getSheets,
    hasPlurals,
    getPluralsOneSkyProjectId,
    getPluralsFilePath,
    getPluralsFileName,
    getTranslationsDirPath,
    getOutputDirPath,
    getWebParameterType,
    getSupportedLanguages,
    getNonBaseLanguages,
    getOneSkyProjectIdForSheet,
    getOneSkyApiKey,
    getOneSkyApiSecret,
    getNativeLanguage,
    getNativeLanguageName,
    getBaseLanguage,
    getBaseLanguageName
};
