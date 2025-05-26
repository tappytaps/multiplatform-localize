const onesky = require("@brainly/onesky-utils");
var StringsFile = require("strings-file");

const conf = require("../config");

module.exports = {
    uploadTranslations,
    getTranslations,
    uploadStringsdict,
    uploadAndroidXml,
    uploadHierarchicalJson,
    getLanguages,
    getFile
};

function getOptions(options) {
    return {
        secret: conf.getOneSkyApiSecret(),
        apiKey: conf.getOneSkyApiKey(),
        ...options
    };
}

async function uploadTranslations(translations, projectId, language) {
    const content = translations.reduce((acc, string) => {
        return acc + `"${string.id}" = "${string.value}";\n`;
    }, "");
    const options = getOptions({
        projectId,
        language,
        fileName: `translations.strings`,
        format: "IOS_STRINGS",
        content,
        keepStrings: true
    });
    await onesky.postFile(options);
}

async function getTranslations(language, projectId) {
    const translations = await getFile(
        language,
        "translations.strings",
        projectId
    );
    if (translations) {
        return StringsFile.parse(translations);
    }
    return {};
}

async function uploadStringsdict(content, fileName, projectId) {
    const options = getOptions({
        projectId,
        language: conf.baseLanguage,
        format: "IOS_STRINGSDICT_XML",
        content,
        fileName,
        keepStrings: false
    });
    await onesky.postFile(options);
}

async function uploadAndroidXml(content, fileName, projectId) {
    const options = getOptions({
        projectId,
        language: conf.baseLanguage,
        format: "ANDROID_XML",
        content,
        fileName,
        keepStrings: false
    });
    await onesky.postFile(options);
}

async function uploadHierarchicalJson(content, fileName, projectId) {
    const options = getOptions({
        projectId,
        language: conf.baseLanguage,
        format: "I18NEXT_HIERARCHICAL_JSON",
        content,
        fileName,
        keepStrings: false
    });
    await onesky.postFile(options);
}

async function getLanguages(projectId) {
    const options = getOptions({
        projectId
    });
    const response = await onesky.getLanguages(options);
    const { data } = JSON.parse(response);
    const codes = data.map((language) => language.code);

    return codes;
}

async function getFile(language, fileName, projectId) {
    const options = getOptions({
        projectId,
        fileName,
        language
    });
    try {
        const file = await onesky.getFile(options);
        return file;
    } catch (error) {
        throw new Error(JSON.stringify(error));
    }
}
