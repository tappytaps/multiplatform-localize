const PlatformConfig = require("../PlatformConfig");
const PlatformKey = require("../PlatformKey");

const commonSpecialCharacters = [
    {
        expression: /\\(?!n|r|\s)/,
        replacement: "\\\\"
    },
    {
        expression: /"/,
        replacement: '\\"'
    }
];

const cdataSpecialCharacters = [
    {
        expression: /'/,
        replacement: "\\'"
    }
];

module.exports = function prepareStringValueForPlatform(
    value,
    platform,
    isHtml = false
) {
    if (platform === PlatformKey.android && isHtml) {
        return replaceFormatSpecifiers(
            `<![CDATA[${excapeForCdata(value)}]]>`,
            platform
        );
    }
    return escapeForPlatform(
        replaceFormatSpecifiers(value, platform),
        platform
    );
};

function replaceFormatSpecifiers(text, platform) {
    const { formatSpecifiers } = PlatformConfig[platform];
    if (formatSpecifiers === "none") {
        return text;
    }
    if (formatSpecifiers === "automatic") {
        let updatedText = text;
        const formatSpecifiersExpression = /(%@|%d|%f)/;
        const formatSpecifiersExpressionPositional = /(%((\d)\$)?@|%((\d)\$)?d|%((\d)\$)?f)/;
        if (formatSpecifiersExpression.test(updatedText)) {
            let index = 0;
            while (updatedText.match(formatSpecifiersExpressionPositional)) {
                updatedText = updatedText.replace(
                    formatSpecifiersExpressionPositional,
                    `{{value${index}}}`
                );
                index += 1;
            }
        } else {
            updatedText = updatedText.replace(
                new RegExp(formatSpecifiersExpressionPositional, "g"),
                (substring, group1, group2, group3) => { 
                    return `{{value${Number(group3) - 1}}}`
                 }
            );
        }
        return updatedText;
    }
    return text
        .replace(/(%)(\d\$)?@/g, `$1$2${formatSpecifiers.string}`)
        .replace(/(%)(\d\$)?d/g, `$1$2${formatSpecifiers.integer}`)
        .replace(/(%)(\d\$)?f/g, `$1$2${formatSpecifiers.double}`);
}

function escapeForPlatform(text, platform) {
    const { specialCharacters: platformSpecialCharactersMap } = PlatformConfig[
        platform
    ];
    const platformSpecialCharacters = Object.keys(
        platformSpecialCharactersMap
    ).map((key) => {
        return {
            expression: new RegExp(`\\${key}`),
            replacement: platformSpecialCharactersMap[key]
        };
    });
    const allSpecialCharacters = commonSpecialCharacters.concat(
        platformSpecialCharacters
    );
    return escape(text, allSpecialCharacters);
}

function excapeForCdata(text) {
    return escape(text, cdataSpecialCharacters);
}

function escape(text, characters) {
    let updatedText = text;
    for (const character of characters) {
        updatedText = updatedText.replace(
            new RegExp(character.expression, "g"),
            character.replacement
        );
    }
    return updatedText;
}
