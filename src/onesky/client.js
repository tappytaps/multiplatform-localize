const onesky = require("@brainly/onesky-utils");

const conf = require("../config");

module.exports = {
    uploadTranslations,
    uploadStringsdict,
    uploadAndroidXml,
    uploadHierarchicalJson,
    getLanguages,
    getTranslationsFile,
    getFile
};

const commonOptions = conf.oneSky || {};

async function uploadTranslations(translations) {
    const options = {
        ...commonOptions,
        language: conf.baseLanguage,
        fileName: "translations.json",
        format: "HIERARCHICAL_JSON",
        content: JSON.stringify(translations),
        keepStrings: true
    };
    await onesky.postFile(options);
}

async function uploadStringsdict(content, fileName) {
    const options = {
        ...commonOptions,
        language: conf.baseLanguage,
        format: "IOS_STRINGSDICT_XML",
        content,
        fileName,
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function uploadAndroidXml(content, fileName) {
    const options = {
        ...commonOptions,
        language: conf.baseLanguage,
        format: "ANDROID_XML",
        content,
        fileName,
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function uploadHierarchicalJson(content, fileName) {
    const options = {
        ...commonOptions,
        language: conf.baseLanguage,
        format: "I18NEXT_HIERARCHICAL_JSON",
        content,
        fileName,
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function getLanguages() {
    const options = {
        ...commonOptions
    };
    const response = await onesky.getLanguages(options);
    const { data } = JSON.parse(response);
    const codes = data.map((language) => language.code);

    return codes;
}

async function getTranslationsFile(language) {
    const translations = await getFile(language, "translations.json");
    if (translations) {
        return JSON.parse(translations);
    }
    return null;
}

async function getFile(language, fileName) {
    const options = {
        ...commonOptions,
        fileName,
        language
    };
    try {
        const file = await onesky.getFile(options);
        return file;
    } catch (error) {
        throw new Error(JSON.stringify(error));
    }
}
