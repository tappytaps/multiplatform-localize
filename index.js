#!/usr/bin/env node

const xlsx = require("node-xlsx").default;
const ora = require("ora");
const streamBuffers = require("stream-buffers");
const fs = require("fs-extra");
const { argv } = require("yargs");

const http = require("https");

const platforms = require("./platforms");

const { configPath } = argv;

if (!configPath) {
    console.error("🙏 Please define --configPath");
    process.exit(0);
}

if (!fs.existsSync(configPath)) {
    console.error("🙏 Please define existing config file");
    process.exit(0);
}

const {
    xlsxUrl,
    platform: currentPlatform,
    language,
    sheets: sheetsConfig
} = fs.readJSONSync(configPath);

if (!xlsxUrl || !currentPlatform || !language || !sheetsConfig) {
    console.error(
        "🙏 Config file should define xlsxUrl, platform, language, sheets"
    );
    process.exit(1);
}

const PlatformKey = {
    ios: "ios",
    android: "android",
    web: "web"
};

const keysColumnHeaderPrefix = "key_";
const valueColumnHeaderPrefix = "value_";

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

const xlsxBuffer = new streamBuffers.WritableStreamBuffer();
const spinner = ora("Downloading xlsx file").start();

initiateFileDownload();

function initiateFileDownload() {
    http.get(xlsxUrl, (response) => {
        response.on("data", (data) => {
            xlsxBuffer.write(data);
        });
        response.on("end", () => {
            xlsxBuffer.end();
            spinner.succeed();
            handleXlsxFile();
        });
    }).on("error", (error) => {
        spinner.fail(error.message);
    });
}

function handleXlsxFile() {
    spinner.start("Making localization files");
    try {
        const sheets = xlsx.parse(xlsxBuffer.getContents());
        sheets
            .filter(isApplicationSheet)
            .map(mergeSheetWithConfig)
            .forEach(exportStrings);
        spinner.succeed();
    } catch (error) {
        spinner.fail(error.message);
    }
}

function isApplicationSheet(sheet) {
    return (
        sheetsConfig.find((sheetConfig) => {
            return sheetConfig.name === sheet.name;
        }) !== undefined
    );
}

function mergeSheetWithConfig(sheet) {
    const config = sheetsConfig.find((sheetConfig) => {
        return sheetConfig.name === sheet.name;
    });
    return { ...sheet, config };
}

function transformSheetToLocalizations(sheet) {
    const keysColumn = keysColumnIndex(sheet, currentPlatform);
    const valuesColumn = valueColumnIndex(sheet, language);
    const allowDuplicatesColumn = columnIndexForHeader(
        sheet,
        "allow_duplicates"
    );
    const descriptionsColumn = columnIndexForHeader(sheet, "description");

    const sheetData = sheet.data
        .slice(1)
        .filter((row) => notEmptyValue(row, keysColumn))
        .filter((row) => notEmptyValue(row, valuesColumn));

    return sheetData.map((row) => {
        return {
            key: row[keysColumn],
            value: escape(replaceFormatSpecifiers(row[valuesColumn])),
            allowDuplicates: row[allowDuplicatesColumn] || false,
            description: row[descriptionsColumn]
        };
    });
}

function checkKeysDuplicatesInLocalizations(localizations) {
    const localizationKeys = localizations.map(
        (localization) => localization.key
    );
    return duplicates(localizationKeys);
}

function checkValuesDuplicatesInLocalizations(localizations) {
    const localizationValues = localizations
        .filter((localization) => !localization.allowDuplicates)
        .map((localization) => localization.value);
    return duplicates(localizationValues);
}

function exportStrings(sheet) {
    const { output } = sheet.config;
    const localizations = transformSheetToLocalizations(sheet);
    const keysDuplicates = checkKeysDuplicatesInLocalizations(localizations);
    const valuesDuplicates = checkValuesDuplicatesInLocalizations(
        localizations
    );

    if (keysDuplicates.length > 0) {
        throw new Error(
            `Found localization keys duplicates: ${keysDuplicates.join()}`
        );
    }

    if (valuesDuplicates.length > 0) {
        spinner.warn(
            `Found localization duplicates: ${valuesDuplicates.join()}`
        );
    }

    const outputFile = fs.createWriteStream(output);
    const exportInput = {
        localizations,
        outputFile
    };

    switch (currentPlatform) {
        case PlatformKey.ios:
            exportAsStringsFile(exportInput);
            break;
        case PlatformKey.android:
            exportAsXmlFile(exportInput);
            break;
        case PlatformKey.web:
            exportAsJson(exportInput);
            break;
        default:
            break;
    }
}

function replaceFormatSpecifiers(text) {
    const { formatSpecifiers } = platforms[currentPlatform];
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

function escape(text) {
    const { specialCharacters: platformSpecialCharactersMap } = platforms[
        currentPlatform
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

function notEmptyValue(row, columnIndex) {
    return row[columnIndex] !== undefined;
}

function exportAsStringsFile({ localizations, outputFile }) {
    for (const localization of localizations) {
        outputFile.write(`"${localization.key}" = "${localization.value}";\n`);
    }
}

function exportAsXmlFile({ localizations, outputFile }) {
    outputFile.write('<?xml version="1.0" encoding="UTF-8"?>\n');
    outputFile.write("<resources>\n");

    for (const localization of localizations) {
        outputFile.write(
            `\t<string name="${localization.key}">${
                localization.value
            }</string>\n`
        );
    }

    outputFile.write("</resources>");
}

function exportAsJson({ localizations, outputFile }) {
    outputFile.write("{\n");

    for (const [index, localization] of localizations.entries()) {
        if (index === localizations.length - 1) {
            outputFile.write(
                `\t"${localization.key}": "${localization.value}"\n`
            );
        } else {
            outputFile.write(
                `\t"${localization.key}": "${localization.value}",\n`
            );
        }
    }

    outputFile.write("}");
}

function keysColumnIndex(sheet, p) {
    const header = keyHeaderForPlatform(p);
    return columnIndexForHeader(sheet, header);
}

function valueColumnIndex(sheet, lang) {
    const header = valueHeaderForPlatform(lang);
    return columnIndexForHeader(sheet, header);
}

function columnIndexForHeader(sheet, header) {
    return sheet.data[0].findIndex((cellContent) => cellContent === header);
}

function keyHeaderForPlatform(p) {
    return `${keysColumnHeaderPrefix}${p}`;
}

function valueHeaderForPlatform(p) {
    return `${valueColumnHeaderPrefix}${p}`;
}

function count(values) {
    return values.reduce(
        (a, b) => Object.assign(a, { [b]: (a[b] || 0) + 1 }),
        {}
    );
}

function duplicates(values) {
    const valuesCount = count(values);
    return Object.keys(valuesCount).filter((a) => valuesCount[a] > 1);
}
