#!/usr/bin/env node

const program = require("commander");

const commands = require("./src/commands");
const { version } = require("./package.json");

//
// Program Definition
//

program.version(version);
program.option("-c, --config", "Path to configuration file");

program.command("generate").alias("gen").action(runGenerateStrings);

program
    .command("upload")
    .alias("up")
    .description("Upload strings to OneSky.")
    .option(
        "-a, --app-specific-only",
        "Option to upload only app specific strings",
        false
    )
    .action(runUploadStrings);

program
    .command("download")
    .alias("down")
    .description("Download translated strings from OneSky")
    .action(runDownloadStrings);

program.parse(process.argv);

//
// Commands
//

async function runGenerateStrings() {
    await commands.generateStrings();
}
async function runUploadStrings(config) {
    const options = config.opts();
    await commands.uploadStrings({ appSpecificOnly: options.appSpecificOnly });
}
async function runDownloadStrings() {
    await commands.downloadStrings();
}
