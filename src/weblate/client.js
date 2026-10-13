const axios = require("axios").default;
const FormData = require("form-data");
const i18nStringsFiles = require("i18n-strings-files");

const { prepareStringValueForPlatform } = require("../strings");
const PlatformKey = require("../PlatformKey");
const conf = require("../config");

module.exports = {
    postTranslations,
    getTranslations,
    postTranslationsFile,
    getTranslationsFile,
    getComponentTranslations,
    getUnits,
    updateUnitTarget
};

function getRequestConfig({ method, apiPath, headers = {}, options = {} }) {
    return {
        method,
        url: `${conf.getWeblateUrl()}/api${apiPath}`,
        headers: {
            Authorization: `Token ${conf.getWeblateApiKey()}`,
            ...headers
        },
        ...options
    };
}

async function postTranslations(
    translations,
    projectSlug,
    componentSlug,
    language
) {
    const fileContent = translations.reduce((acc, string) => {
        return (
            acc +
            `"${string.id}" = "${prepareStringValueForPlatform(string.value, PlatformKey.ios)}";\n`
        );
    }, "");

    await postTranslationsFile(
        projectSlug,
        componentSlug,
        language,
        fileContent,
        `${language}.strings`
    );
}

async function getTranslations(projectSlug, componentSlug, language) {
    const content = await getTranslationsFile(
        projectSlug,
        componentSlug,
        language,
        {
            format: "strings",
            q: "state:>=translated"
        }
    );
    return i18nStringsFiles.parse(content);
}

async function postTranslationsFile(
    projectSlug,
    componentSlug,
    language,
    fileContent,
    fileName
) {
    const formData = new FormData();

    formData.append("file", fileContent, { filename: fileName });
    formData.append("method", "replace");

    const config = getRequestConfig({
        method: "POST",
        apiPath: `/translations/${projectSlug}/${componentSlug}/${language}/file/`,
        headers: {
            ...formData.getHeaders()
        },
        options: {
            data: formData
        }
    });

    try {
        await axios(config);
    } catch (error) {
        console.error(error.response.data);
        throw error;
    }
}

async function getTranslationsFile(
    projectSlug,
    componentSlug,
    language,
    { format, q } = {}
) {
    const config = getRequestConfig({
        method: "GET",
        apiPath: `/translations/${projectSlug}/${componentSlug}/${language}/file/`,
        options: {
            params: {
                format,
                q
            }
        }
    });
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(error.response.data);
        throw error;
    }
}

async function getComponentTranslations(projectSlug, componentSlug) {
    const config = getRequestConfig({
        method: "GET",
        apiPath: `/components/${projectSlug}/${componentSlug}/translations/`
    });

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(error.response.data);
        throw error;
    }
}

/**
 * Returns all translation units matching a Weblate search query.
 * See https://docs.weblate.org/en/latest/user/search.html
 */
async function getUnits(query) {
    const config = getRequestConfig({ method: "GET", apiPath: "/units/" });
    let units = [];
    let url = config.url;
    let params = { q: query };
    while (url) {
        try {
            const response = await axios({ ...config, url, params });
            units = units.concat(response.data.results);
            // the next page URL already contains the query
            url = response.data.next;
            params = undefined;
        } catch (error) {
            console.error(error.response?.data ?? error.message);
            throw error;
        }
    }
    return units;
}

/**
 * Saves a translation of a unit and marks it as translated.
 */
async function updateUnitTarget(unitId, target) {
    const config = getRequestConfig({
        method: "PATCH",
        apiPath: `/units/${unitId}/`,
        options: {
            data: { target: [target], state: 20 }
        }
    });
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(error.response?.data ?? error.message);
        throw error;
    }
}
