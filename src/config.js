const path = require("path");

const rc = require("rc");

const PlatformKey = require("./PlatformKey");
const OneSkyProjectType = require("./OneSkyProjectType");
const WebParameterType = require("./WebParameterType");

const conf = rc("stringsgen", {
    idColumnName: "id",
    valuesColumnName: "value_en",
    allowDuplicatesColumnName: "allow_duplicates",
    descriptionColumnName: "description",
    isHtmlColumnName: "is_html",
    isFinalColumnName: "is_final",
    baseLanguage: "en",
    webParameterType: WebParameterType.value
});

const commonValuesColumnName = conf.valuesColumnName;

function validate() {
    validateRequiredFields([
        "xlsxUrl",
        "platform",
        "idColumnName",
        "keysColumnName",
        "valuesColumnName",
        "outputDir",
        "outputName"
    ]);
    validatePlatform();
}

function validateOneSkyConfiguration() {
    validateRequiredFields(["xlsxUrl", "idColumnName", "valuesColumnName"]);

    const hasOneSkyConfiguration =
        conf.oneSky && conf.oneSky.secret && conf.oneSky.apiKey;

    const hasSingleProjectConfiguration =
        hasOneSkyConfiguration && conf.oneSky.projectId;

    const hasMultiProjectConfiguration =
        hasOneSkyConfiguration && conf.oneSky.projects;

    if (
        !hasOneSkyConfiguration &&
        (!hasSingleProjectConfiguration || !hasMultiProjectConfiguration)
    ) {
        console.error(
            "🙏 Config file should define oneSky.secret, oneSky.apiKey and (oneSky.projectId or oneSky.projects)."
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

function getOneSkyProjects() {
    if (conf.oneSky.projects) {
        return conf.oneSky.projects;
    }
    return [{ type: OneSkyProjectType.all, id: conf.oneSky.projectId }];
}

function getOneSkyPluralsProjectId() {
    const projects = getOneSkyProjects();
    const pluralsProject = projects.find((project) => {
        return (
            project.type === OneSkyProjectType.all ||
            project.type === OneSkyProjectType.appSpecific
        );
    });
    return pluralsProject.id;
}

function hasPlurals() {
    return conf.inputPlurals !== undefined;
}

function getWebParameterType() {
    return conf.webParameterType;
}

function getConfigDirname() {
    return path.dirname(conf.config);
}

function getPluralsPath() {
    return path.resolve(process.cwd(), getConfigDirname(), conf.inputPlurals);
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

module.exports = {
    ...conf,
    commonValuesColumnName,
    validate,
    validateOneSkyConfiguration,
    hasPlurals,
    getPluralsPath,
    getPluralsFileName,
    getOutputDirPath,
    getOneSkyProjects,
    getOneSkyPluralsProjectId,
    getWebParameterType
};
