function systemTranslationPrompt(baseLanguage, targetLanguage) {
    return `You are a helpful assistant that translates ${baseLanguage} text to ${targetLanguage}.
    - The input is a JSON object with id, text, and description."
    - The id is a unique identifier for the text.
    - The text is the phrase to be translated.
    - The description is meant for translation context and should not be translated.
    - The desctiption is optional.
    - The output should be a JSON object with the same id and the translated text.
    - Do not remove any parameters from the translated text.`;
}

function userTranslationPrompt(textToTranslate, glossary) {
    let prompt = `Translate the following JSON: ${JSON.stringify(textToTranslate)}.`;
    if (glossary) {
        const translationGlossary = Object.fromEntries(
            Object.entries(glossary).filter(([key]) => {
                return textToTranslate.text.includes(key);
            })
        );
        if (Object.keys(translationGlossary).length > 0) {
            prompt += `\nFor the translation use the following glossary JSON: ${JSON.stringify(translationGlossary)}
            - The glossary is an JSON object where the key is the phrase that should be replaced with the value during the translation.`;
        }
    }
    return prompt;
}

module.exports = {
    systemTranslationPrompt,
    userTranslationPrompt
};
