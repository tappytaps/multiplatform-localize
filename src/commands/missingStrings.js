const chalk = require("chalk");

const conf = require("../config");
const spinner = require("../spinner");
const ProjectSheet = require("../sheets/ProjectSheet");
const { client: weblateClient } = require("../weblate");
const unitsQuery = require("../weblate/unitsQuery");

module.exports = async function missingStrings(options) {
    try {
        conf.validate();
        const languages = options.lang ?? conf.getNonBaseLanguages();
        spinner.start("Downloading sheets file...");
        const projectSheets = await ProjectSheet.downloadSheets({
            filterSheets: options.sheet,
            validateIds: false
        });
        spinner.succeed();
        const results = [];
        for (const sheet of projectSheets) {
            spinner.start(
                `Looking for untranslated strings in ${sheet.weblateComponentSlug}`
            );
            const units = await weblateClient.getUnits(
                unitsQuery({
                    projectSlug: sheet.weblateProjectSlug,
                    componentSlug: sheet.weblateComponentSlug,
                    untranslated: true
                })
            );
            spinner.stop();
            results.push({
                sheet: sheet.name,
                component: `${sheet.weblateProjectSlug}/${sheet.weblateComponentSlug}`,
                strings: groupByString(sheet, units, languages)
            });
        }
        if (options.json) {
            console.log(JSON.stringify(results, null, 2));
        } else {
            results.forEach(print);
        }
    } catch (error) {
        spinner.fail(error.message);
        process.exitCode = 1;
    }
};

// One entry per string, with all languages it is missing in.
function groupByString(sheet, units, languages) {
    const sheetStrings = new Map(
        sheet.getStrings().map((string) => [String(string.id), string])
    );
    const strings = new Map();
    for (const unit of units) {
        if (!languages.includes(unit.language_code)) {
            continue;
        }
        if (!strings.has(unit.context)) {
            const sheetString = sheetStrings.get(unit.context);
            strings.set(unit.context, {
                id: unit.context,
                key: sheetString?.key ?? null,
                value: unit.source[0],
                inSheet: sheetString !== undefined,
                languages: []
            });
        }
        strings.get(unit.context).languages.push(unit.language_code);
    }
    return [...strings.values()]
        .map((string) => ({ ...string, languages: string.languages.sort() }))
        .sort((a, b) => Number(a.id) - Number(b.id));
}

function print(result) {
    const count = result.strings.length;
    console.log(
        chalk.bold(`${result.sheet}`) +
            chalk.gray(` → ${result.component}: `) +
            (count === 0
                ? chalk.green("nothing missing")
                : chalk.red(`${count} untranslated`))
    );
    for (const string of result.strings) {
        const key = string.inSheet
            ? string.key
            : chalk.yellow("(not in the sheet)");
        console.log(`  #${string.id} ${key}`);
        console.log(chalk.gray(`    ${string.value}`));
        console.log(`    missing: ${string.languages.join(" ")}`);
    }
    console.log();
}
