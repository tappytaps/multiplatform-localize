const fs = require("fs-extra");
const path = require("path");

const PlatformKey = require("../PlatformKey");
const conf = require("../config");
const ensureDirectoryExistence = require("./ensureDirectoryExistence");

module.exports = function exportStrings(localizations, language) {
    const outputFilePath = path.join(
        conf.getOutputDirPath(language),
        conf.outputName
    );

    ensureDirectoryExistence(outputFilePath);

    const outputFile = fs.createWriteStream(outputFilePath);
    const exportInput = {
        localizations,
        outputFile
    };

    switch (conf.platform) {
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
};

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
            `\t<string name="${localization.key}">${localization.value}</string>\n`
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
