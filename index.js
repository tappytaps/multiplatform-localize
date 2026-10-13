#!/usr/bin/env node

const { program, InvalidArgumentError } = require("commander");

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

program
    .command("show <keyOrId>")
    .description(
        "Show a string from the sheets (by platform key or id) with its translations on Weblate."
    )
    .option("-l, --lang <language...>", "Show only these languages")
    .option("--json", "Print the result as JSON")
    .action(commands.showString);

program
    .command("missing")
    .description("List strings that are not translated on Weblate yet.")
    .option("-l, --lang <language...>", "Check only these languages")
    .option(
        "-s, --sheet <sheet...>",
        "Check only these sheets",
        collectSheetOption
    )
    .option("--json", "Print the result as JSON")
    .action(commands.missingStrings);

program
    .command("set <keyOrId> <language> <text>")
    .description(
        "Save a translation of a string (by platform key or id) to Weblate."
    )
    .option("--dry-run", "Only show what would be saved")
    .option(
        "--force",
        "Save even when placeholders or tags differ from the source"
    )
    .action(commands.setTranslation);

program.parse(process.argv);

function parseSheetOption(value) {
    if (defaultSheets.includes(value)) {
        return value;
    }
    throw new InvalidArgumentError(
        `Invalid sheet name "${value}". Available options: ${defaultSheets.join(", ")}`
    );
}

function collectSheetOption(value, previous = []) {
    return [...previous, parseSheetOption(value)];
}
