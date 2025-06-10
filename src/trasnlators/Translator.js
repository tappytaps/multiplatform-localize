const chalk = require("chalk");

const prompts = require("./prompts");
const spinner = require("../spinner");

module.exports = class Translator {
    getTranslationMessages(
        textToTranslate,
        baseLanguage,
        targetLanguage,
        glossary
    ) {
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
                content: prompts.userTranslationPrompt(
                    textToTranslate,
                    glossary
                )
            }
        ];
        return messages;
    }

    debugPrintTranslation(textToTranslate, messages) {
        const debugInfo = messages
            .map(
                (msg, idx) =>
                    `[${msg.role.toUpperCase()} #${idx}]:\n${msg.content}`
            )
            .join("\n");
        spinner.info(
            `Translating ${chalk.greenBright(textToTranslate.text)}:\n${chalk.gray(debugInfo)}`
        );
    }
};
