const OpenAI = require("openai").default;

const spinner = require("../spinner");
const Translator = require("./Translator");

class OpenAITranslator extends Translator {
    constructor({ model, apiKey, baseUrl = "https://api.openai.com/v1" } = {}) {
        super();
        this.model = model;
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseUrl
        });
    }

    static listModels() {
        return [
            ...["deepseek-chat"].map((model) => ({
                name: model,
                model: model,
                service: "deepseek"
            })),
            ...["gpt-4.1-nano", "gpt-4.1-mini", "gpt-4.1"].map((model) => ({
                name: model,
                model: model,
                service: "openai"
            }))
        ];
    }

    async translate({
        textToTranslate,
        baseLanguage,
        targetLanguage,
        glossary,
        verbose
    }) {
        try {
            const messages = this.getTranslationMessages(
                textToTranslate,
                baseLanguage,
                targetLanguage,
                glossary
            );
            if (verbose) {
                this.debugPrintTranslation(textToTranslate, messages);
            }
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages,
                response_format: { type: "json_object" },
                temperature: 0.3
            });

            const translatedText =
                completion.choices[0]?.message?.content?.trim();
            if (translatedText) {
                return JSON.parse(translatedText).text;
            } else {
                spinner.warn(
                    `OpenAI Warning: No translation returned for: "${textToTranslate}"`
                );
                return null;
            }
        } catch (error) {
            spinner.fail(
                `OpenAI Error translating text "${textToTranslate}": ${error.message}`
            );
            if (error.response && error.response.data) {
                spinner.fail(
                    `OpenAI API Error Details: ${error.response.data}`
                );
            }
            return null;
        }
    }
}

module.exports = OpenAITranslator;
