const OpenAI = require("openai").default;

const prompts = require("./prompts");
const spinner = require("../spinner");

class OpenAITranslator {
    constructor({ model, apiKey, baseUrl = "https://api.openai.com/v1" } = {}) {
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

    async translate({ textToTranslate, baseLanguage, targetLanguage }) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: prompts.systemTranslationPrompt(
                            baseLanguage,
                            targetLanguage
                        )
                    },
                    {
                        role: "user",
                        content: prompts.userTranslationPrompt(textToTranslate)
                    }
                ],
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
