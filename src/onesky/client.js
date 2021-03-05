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

const commonOptions = {
    secret: conf.oneSky.secret,
    apiKey: conf.oneSky.apiKey
};

async function uploadTranslations(translations, projectId) {
    const options = {
        ...commonOptions,
        projectId,
        language: conf.baseLanguage,
        fileName: "translations.json",
        format: "HIERARCHICAL_JSON",
        content: JSON.stringify(translations),
        keepStrings: true
    };
    await onesky.postFile(options);
}

async function uploadStringsdict(content, fileName, projectId) {
    const options = {
        ...commonOptions,
        projectId,
        language: conf.baseLanguage,
        format: "IOS_STRINGSDICT_XML",
        content,
        fileName,
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function uploadAndroidXml(content, fileName, projectId) {
    const options = {
        ...commonOptions,
        projectId,
        language: conf.baseLanguage,
        format: "ANDROID_XML",
        content,
        fileName,
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function uploadHierarchicalJson(content, fileName, projectId) {
    const options = {
        ...commonOptions,
        projectId,
        language: conf.baseLanguage,
        format: "I18NEXT_HIERARCHICAL_JSON",
        content,
        fileName,
        keepStrings: false
    };
    await onesky.postFile(options);
}

async function getLanguages(projectId) {
    const options = {
        ...commonOptions,
        projectId
    };
    const response = await onesky.getLanguages(options);
    const { data } = JSON.parse(response);
    const codes = data.map((language) => language.code);

    return codes;
}

async function getTranslationsFile(language, projectId) {
    const translations = await getFile(
        language,
        "translations.json",
        projectId
    );

    if (translations) {
        const json = JSON.parse(translations);
        Object.keys(json).forEach((key) => {
            json[key] = json[key].replace(/\n/i, "\\n")
        });
        return json;
    }
    return null;
}

async function getFile(language, fileName, projectId) {
    const options = {
        ...commonOptions,
        projectId,
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
