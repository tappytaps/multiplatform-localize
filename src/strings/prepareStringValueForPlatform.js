const PlatformConfig = require("../PlatformConfig");
const PlatformKey = require("../PlatformKey");
const WebParameterType = require("../WebParameterType");
const config = require("../config");

const commonSpecialCharacters = [
    {
        expression: /\\(?!n|r|\s)/,
        replacement: "\\\\"
    },
    {
        expression: /"/,
        replacement: '\\"'
    },
    { expression: /\n+/, replacement: "\\n" }
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
    switch (platform) {
        case PlatformKey.ios:
            return text;
        case PlatformKey.android: {
            const { formatSpecifiers } = PlatformConfig.android;
            return text
                .replace(/(%)(\d\$)?@/g, `$1$2${formatSpecifiers.string}`)
                .replace(/(%)(\d\$)?d/g, `$1$2${formatSpecifiers.integer}`)
                .replace(/(%)(\d\$)?f/g, `$1$2${formatSpecifiers.double}`);
        }

        case PlatformKey.web: {
            let updatedText = text;

            const formatSpecifiersExpression = /(%@|%d|%f)/;
            const formatSpecifiersExpressionPositional =
                /(%((\d)\$)?@|%((\d)\$)?d|%((\d)\$)?f)/;

            if (formatSpecifiersExpression.test(updatedText)) {
                let index = 0;
                while (
                    updatedText.match(formatSpecifiersExpressionPositional)
                ) {
                    updatedText = updatedText.replace(
                        formatSpecifiersExpressionPositional,
                        webParameterValue(index)
                    );
                    index += 1;
                }
            } else {
                updatedText = updatedText.replace(
                    new RegExp(formatSpecifiersExpressionPositional, "g"),
                    (substring, group1, group2, group3) => {
                        return webParameterValue(Number(group3) - 1);
                    }
                );
            }

            return updatedText;
        }
        default:
            throw new Error("Unknown platform");
    }
}

function webParameterValue(index) {
    switch (config.getWebParameterType()) {
        case WebParameterType.tag:
            return `<${index + 1}/>`;

        case WebParameterType.value:
            return `{{value${index}}}`;
        default:
            throw new Error("Unknown parameter type");
    }
}

function escapeForPlatform(text, platform) {
    const { specialCharacters: platformSpecialCharactersMap } =
        PlatformConfig[platform];
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
