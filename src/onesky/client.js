const onesky = require("@brainly/onesky-utils");

const conf = require("../config");

module.exports = {
    uploadTranslations,
    uploadStringsdict,
    uploadAndroidXml,
    getLanguages,
    getTranslationsFile,
    getFile
};

const commonOptions = {
    secret: conf.oneSky.secret,
    apiKey: conf.oneSky.apiKey,
    projectId: conf.oneSky.projectId
};

async function uploadTranslations(translations) {
    const options = {
        ...commonOptions,
        language: conf.developmentLanguage,
        fileName: "translations.json",
        format: "HIERARCHICAL_JSON",
        content: JSON.stringify(translations),
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function uploadStringsdict(content, fileName) {
    const options = {
        ...commonOptions,
        language: conf.developmentLanguage,
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
        language: conf.developmentLanguage,
        format: "ANDROID_XML",
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
    return JSON.parse(translations);
}

async function getFile(language, fileName) {
    const options = {
        ...commonOptions,
        fileName,
        language
    };
    return onesky.getFile(options);
}
