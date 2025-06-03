const path = require("path");
const fs = require("fs/promises");

const inquirer = require("inquirer").default;

const xlsx = require("../xlsx");
const conf = require("../config");
const OllamaTranslator = require("../trasnlators/ollama");
const OpenAITranslator = require("../trasnlators/openai");
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
                    await _translateStrings(
                        options,
                        translator,
                        conf.getNonBaseLanguages()
                    );
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

        const oneSkyStrings = await oneSkyClient.getTranslations(
            conf.nativeLanguage,
            projectSheet.oneSkyProjectId
        );

        spinner.succeed();

        const notTranslatedProjectSheetStrings = projectSheetStrings.filter(
            (string) => oneSkyStrings[string.id] === undefined
        );

        if (notTranslatedProjectSheetStrings.length === 0) {
            spinner.succeed(`No strings to translate in ${projectSheet.name}`);
        } else {
            spinner.info(
                `Found ${notTranslatedProjectSheetStrings.length} strings to translate in ${projectSheet.name}`
            );

            const translatedXlsxData = [];

            for (const languageCode of languages) {
                let translatedStringsCount = 0;

                const targetLanguageName = languageCodes.getName(languageCode);
                const targetLanguageStringsData = [
                    ["id", "original", "translated"]
                ];

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
                        targetLanguage: targetLanguageName
                    });
                    targetLanguageStringsData.push([
                        string.id,
                        string.value,
                        translatedString
                    ]);

                    translatedStringsCount += 1;
                    spinner.start(
                        `Translating strings in ${projectSheet.name} to ${targetLanguageName}... (${translatedStringsCount}/${notTranslatedProjectSheetStrings.length})`
                    );
                }

                translatedXlsxData.push({
                    name: languageCode,
                    data: targetLanguageStringsData
                });

                spinner.succeed(
                    `Translating strings in ${projectSheet.name} to ${targetLanguageName}...`
                );
            }

            const outputDir = conf.getTranslationsDirPath();
            await fs.mkdir(outputDir, { recursive: true });

            const xlsxPath = path.join(outputDir, `${projectSheet.name}.xlsx`);
            await xlsx.write(xlsxPath, translatedXlsxData);

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
