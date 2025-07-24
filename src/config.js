const path = require("path");

const rc = require("rc");
const languageCodes = require("./utils/language-codes");

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
    validateWeblateConfiguration();
}

function validateWeblateConfiguration() {
    validateRequiredFields(["xlsxUrl"]);

    const apiKey = getWeblateApiKey();

    if (!apiKey) {
        console.error(
            "😢 Missing Weblate API key. Please set WEBLATE_API_KEY environment variable."
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

function getWeblateApiKey() {
    return process.env.WEBLATE_API_KEY;
}

function getWeblateUrl() {
    return conf.weblateUrl;
}

function getSheets() {
    return conf.sheets;
}

function getPluralsFilePath() {
    return path.resolve(
        process.cwd(),
        getConfigDirname(),
        conf.plurals.sourceFile
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

function getWeblateProjectComponentForSheet(sheetName) {
    const sheet = conf.sheets.find((sheet) => sheet.name === sheetName);
    if (sheet) {
        return {
            projectSlug: sheet.weblateProjectSlug,
            componentSlug: sheet.weblateComponentSlug
        };
    }
    return null;
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
    return languageCodes.getName(conf.nativeLanguage);
}

function getBaseLanguage() {
    return conf.baseLanguage;
}

function getBaseLanguageName() {
    return languageCodes.getName(conf.baseLanguage);
}

module.exports = {
    ...conf,
    validate,
    validateWeblateConfiguration,
    getSheets,
    hasPlurals,
    getPluralsFilePath,
    getPluralsFileName,
    getTranslationsDirPath,
    getOutputDirPath,
    getWebParameterType,
    getSupportedLanguages,
    getNonBaseLanguages,
    getWeblateProjectComponentForSheet,
    getWeblateApiKey,
    getWeblateUrl,
    getNativeLanguage,
    getNativeLanguageName,
    getBaseLanguage,
    getBaseLanguageName
};
