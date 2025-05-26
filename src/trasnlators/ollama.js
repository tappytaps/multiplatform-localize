const { Ollama } = require("ollama");

const prompts = require("./prompts");
const spinner = require("../spinner");

class OllamaTranslator {
    constructor({ host, model } = {}) {
        this.model = model;
        this.ollama = new Ollama({ host });
    }

    static async listModels(host) {
        const ollama = new Ollama({ host });
        try {
            const { models } = await ollama.list();
            return models.map((model) => ({
                name: model.name,
                model: model.model,
                service: "ollama"
            }));
        } catch {
            return [];
        }
    }

    async translate({ textToTranslate, baseLanguage, targetLanguage }) {
        try {
            const messages = [
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
            ];
            const response = await this.ollama.chat({
                model: this.model,
                messages,
                format: "json",
                options: {
                    temperature: 0.3
                    // Adjust other Ollama parameters as needed, e.g., num_predict for max tokens
                }
            });

            const translatedText = response.message.content?.trim();

            if (translatedText) {
                return JSON.parse(translatedText).text;
            } else {
                spinner.warn(
                    `Ollama Warning: No translation returned for: "${textToTranslate}" (Raw response: ${JSON.stringify(
                        response
                    )})`
                );
                return null;
            }
        } catch (error) {
            spinner.fail(
                `Ollama Error translating text "${textToTranslate}": ${error.message}`
            );
            return null;
        }
    }
}

module.exports = OllamaTranslator;
