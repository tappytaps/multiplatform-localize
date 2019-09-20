const onesky = require("@brainly/onesky-utils");

const conf = require("../config");

module.exports = {
    uploadFile,
    getLanguages,
    getFile
};

const commonOptions = {
    secret: conf.oneSky.secret,
    apiKey: conf.oneSky.apiKey,
    projectId: conf.oneSky.projectId
};

async function uploadFile(translations) {
    const options = {
        ...commonOptions,
        language: "en-US",
        fileName: "translations.json",
        format: "HIERARCHICAL_JSON",
        content: JSON.stringify(translations),
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

async function getFile(language) {
    const options = {
        ...commonOptions,
        fileName: "translations.json",
        language
    };
    const response = await onesky.getFile(options);
    if (response) {
        return JSON.parse(response);
    }
    return {};
}
