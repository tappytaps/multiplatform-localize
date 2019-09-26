const PlatformConfig = require("../PlatformConfig");
const PlatformKey = require("../PlatformKey");
const conf = require("../config");

const commonSpecialCharacters = [
    {
        expression: /\\(?!n|r|\s)/,
        replace: "\\\\"
    },
    {
        expression: /"/,
        replace: '\\"'
    }
];

module.exports = function prepareStringValueForPlatform(
    value,
    platform,
    isHtml = false
) {
    if (platform === PlatformKey.android && isHtml) {
        return replaceFormatSpecifiers(`<![CDATA[${value}]]>`, platform);
    }
    return escape(replaceFormatSpecifiers(value, platform), platform);
};

function replaceFormatSpecifiers(text, platform) {
    const { formatSpecifiers } = PlatformConfig[platform];
    if (formatSpecifiers === "none") {
        return text;
    }
    if (formatSpecifiers === "automatic") {
        let index = 0;
        let updatedText = text;
        const formatSpecifiersExpression = /(%(\d\$)?@|%(\d\$)?d|%(\d\$)?f)/;
        while (updatedText.match(formatSpecifiersExpression)) {
            updatedText = updatedText.replace(
                formatSpecifiersExpression,
                `{{value${index}}}`
            );
            index += 1;
        }
        return updatedText;
    }
    return text
        .replace(/(%)(\d\$)?@/g, `$1$2${formatSpecifiers.string}`)
        .replace(/(%)(\d\$)?d/g, `$1$2${formatSpecifiers.integer}`)
        .replace(/(%)(\d\$)?f/g, `$1$2${formatSpecifiers.double}`);
}

function escape(text, platform) {
    const { specialCharacters: platformSpecialCharactersMap } = PlatformConfig[
        platform
    ];
    const platformSpecialCharacters = Object.keys(
        platformSpecialCharactersMap
    ).map((key) => {
        return {
            expression: new RegExp(`\\${key}`),
            replace: platformSpecialCharactersMap[key]
        };
    });
    const allSpecialCharacters = commonSpecialCharacters.concat(
        platformSpecialCharacters
    );

    let updatedText = text;
    for (const character of allSpecialCharacters) {
        updatedText = updatedText.replace(
            new RegExp(character.expression, "g"),
            character.replace
        );
    }
    return updatedText;
}
