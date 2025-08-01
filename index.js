#!/usr/bin/env node

const { program } = require("commander");

const commands = require("./src/commands");
const { version } = require("./package.json");
const config = require("./src/config");

//
// Program Definition
//

program
    .version(version)
    .option("-c, --config <path>", "Path to configuration file");

const defaultSheets = (config.sheets ?? []).map((sheet) => sheet.name);

program
    .command("generate")
    .alias("gen")
    .description("Download original string from sheets file.")
    .action(commands.generateStrings);

program
    .command("upload-strings")
    .alias("up-strings")
    .description("Upload strings to Weblate.")
    .option(
        "-s, --sheet <sheet...>",
        "Option to select specific sheets to upload",
        parseSheetOption,
        defaultSheets
    )
    .action(commands.uploadStrings);

program
    .command("upload-plurals")
    .alias("up-plurals")
    .description("Upload plural strings to Weblate.")
    .action(commands.uploadPlurals);

program
    .command("download")
    .alias("down")
    .description("Download translated strings from Weblate")
    .action(commands.downloadStrings);

program
    .command("check")
    .description("Compares string on Weblate with strings in xlsx table")
    .action(commands.checkStrings);

program.parse(process.argv);

function parseSheetOption(value) {
    if (defaultSheets.includes(value)) {
        return value;
    }
    throw new Error(
        `Invalid sheet name "${value}". Available options: ${defaultSheets.join(", ")}`
    );
}
