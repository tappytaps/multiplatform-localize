const path = require("path");
const fs = require("fs/promises");

const inquirer = require("inquirer").default;

const xlsx = require("../xlsx");
const conf = require("../config");
const OllamaTranslator = require("../trasnlators/OllamaTranslator");
const OpenAITranslator = require("../trasnlators/OpenAITranslator");
const oneSkyClient = require("../onesky/client");
const ProjectSheet = require("../sheets/ProjectSheet");
const spinner = require("../spinner");
const languageCodes = require("../utils/language-codes");

const { OPENAI_API_KEY, DEEPSEEK_API_KEY, OLLAMA_HOST } = process.env;

module.exports = async function translateStrings(options) {
    const action = await selectAction();

    try {
        conf.validate();

        switch (action) {
            case "translateNative":
                {
                    const translator = await selectTranslator();
                    await _translateStrings(options, translator, [
                        conf.nativeLanguage
                    ]);
                }
                break;
            case "translateAll":
                {
                    const translator = await selectTranslator();
                    await _translateStrings(options, translator);
                }
                break;
            default:
                throw new Error("Unknown action");
        }
    } catch (error) {
        spinner.fail(error.message);
    }
};

async function _translateStrings(options, translator, languages) {
    spinner.start("Downloading sheets file...");

    const projectSheets = await ProjectSheet.downloadSheets({
        filterSheets: options.sheet,
        validateValues: false
    });

    spinner.succeed();

    const nativeLanguageName = conf.getNativeLanguageName();
    const baseLanguageName = conf.getBaseLanguageName();

    for (const projectSheet of projectSheets) {
        spinner.start(
            `Downloading ${nativeLanguageName} translations from OneSky for ${projectSheet.name}...`
        );

        const projectSheetStrings = projectSheet.getOneSkyStrings();
        const projectOneSkyLanguages = await projectSheet.getOneSkyLanguages();

        const nativeLanguageOneSkyStrings = await oneSkyClient.getTranslations(
            conf.nativeLanguage,
            projectSheet.oneSkyProjectId
        );

        spinner.succeed();

        const notTranslatedProjectSheetStrings = projectSheetStrings.filter(
            (string) => nativeLanguageOneSkyStrings[string.id] === undefined
        );

        if (notTranslatedProjectSheetStrings.length === 0) {
            spinner.succeed(`No strings to translate in ${projectSheet.name}`);
        } else {
            spinner.info(
                `Found ${notTranslatedProjectSheetStrings.length} strings to translate in ${projectSheet.name}`
            );

            languages ??= projectOneSkyLanguages.map((lang) => lang.code);
            languages = languages
                .filter((language) => language !== conf.baseLanguage)
                .sort((a, b) => {
                    if (a === conf.nativeLanguage) return -1; // 'a' is native language, comes first
                    if (b === conf.nativeLanguage) return 1; // 'b' is native language, comes first
                    return a.localeCompare(b); // sort alphabetically
                });

            if (languages.length === 0) {
                spinner.fail(
                    `No languages to translate in ${projectSheet.name}`
                );
                continue;
            } else {
                spinner.info(
                    `Will translate strings in ${projectSheet.name} to: ${languages
                        .map(
                            (lang) => `${languageCodes.getName(lang)} (${lang})`
                        )
                        .join(", ")}`
                );
            }

            const translatedStrings = notTranslatedProjectSheetStrings.reduce(
                (acc, string) =>
                    Object.assign(acc, {
                        [string.id]: {
                            original: string.value,
                            translations: languages.reduce(
                                (acc, langCode) =>
                                    Object.assign(acc, {
                                        [langCode]: ""
                                    }),
                                {}
                            )
                        }
                    }),
                {}
            );

            for (const languageCode of languages) {
                let translatedStringsCount = 0;

                const oneSkyLanguage = projectOneSkyLanguages.find(
                    (language) => language.code === languageCode
                );

                const languageGlossary = await oneSkyLanguage.getGlossary();

                const targetLanguageName = languageCodes.getName(languageCode);

                spinner.start(
                    `Translating strings in ${projectSheet.name} to ${targetLanguageName}... (${translatedStringsCount}/${notTranslatedProjectSheetStrings.length})`
                );

                for (const string of notTranslatedProjectSheetStrings) {
                    const translatedString = await translator.translate({
                        textToTranslate: {
                            id: string.id,
                            text: string.value,
                            description: string.aiTranslationDescription
                        },
                        baseLanguage: baseLanguageName,
                        targetLanguage: targetLanguageName,
                        glossary: languageGlossary,
                        verbose: options.verbose
                    });

                    translatedStrings[string.id].translations[languageCode] =
                        translatedString;

                    translatedStringsCount += 1;
                    spinner.start(
                        `Translating strings in ${projectSheet.name} to ${targetLanguageName}... (${translatedStringsCount}/${notTranslatedProjectSheetStrings.length})`
                    );
                }

                spinner.succeed(
                    `Translating strings in ${projectSheet.name} to ${targetLanguageName}...`
                );
            }

            const translatedXlsxData = [["id", "original", ...languages]];

            for (const stringId of Object.keys(translatedStrings)) {
                translatedXlsxData.push([
                    stringId,
                    translatedStrings[stringId].original,
                    ...languages.map(
                        (langCode) =>
                            translatedStrings[stringId].translations[langCode]
                    )
                ]);
            }

            const outputDir = conf.getTranslationsDirPath();
            await fs.mkdir(outputDir, { recursive: true });

            const xlsxPath = path.join(outputDir, `${projectSheet.name}.xlsx`);
            await xlsx.write(xlsxPath, [
                { name: "Translations", data: translatedXlsxData }
            ]);

            spinner.succeed(`📂 ${xlsxPath}`);
        }
    }
}

async function selectAction() {
    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Select action",
            choices: [
                {
                    name: `Translate strings to ${conf.getNativeLanguageName()}`,
                    value: "translateNative"
                },
                {
                    name: "Translate strings to all languages",
                    value: "translateAll"
                }
            ],
            default: "translateNative"
        }
    ]);

    return action;
}

async function selectTranslator() {
    const openaiModels = await OpenAITranslator.listModels();
    const ollamaModels = await OllamaTranslator.listModels(OLLAMA_HOST);

    const { model } = await inquirer.prompt([
        {
            type: "list",
            name: "model",
            message: "Select model",
            choices: [...openaiModels, ...ollamaModels].map((model) => ({
                name: model.name,
                value: model
            }))
        }
    ]);

    switch (model.service) {
        case "deepseek":
            if (!DEEPSEEK_API_KEY) {
                throw new Error(
                    "DEEPSEEK_API_KEY environment variable is not set"
                );
            }
            return new OpenAITranslator({
                model: model.model,
                apiKey: DEEPSEEK_API_KEY,
                baseUrl: "https://api.deepseek.com"
            });
        case "openai":
            if (!OPENAI_API_KEY) {
                throw new Error(
                    "OPENAI_API_KEY environment variable is not set"
                );
            }
            return new OpenAITranslator({
                model: model.model,
                apiKey: OPENAI_API_KEY
            });
        case "ollama":
            return new OllamaTranslator({
                model: model.model,
                host: OLLAMA_HOST
            });
        default:
            throw new Error("Unknown model");
    }
}
