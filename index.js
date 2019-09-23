#!/usr/bin/env node

const program = require("commander");

const conf = require("./src/config");
const commands = require("./src/commands");
const { version } = require("./package.json");

//
// Program Definition
//

program.version(version);

program
    .command("generate")
    .alias("gen")
    .action(runGenerateStrings);

program
    .command("upload")
    .alias("up")
    .description("Upload strings to OneSky.")
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
async function runUploadStrings() {
    await commands.uploadStrings();
}
async function runDownloadStrings() {
    await commands.downloadStrings();
}
