const chalk = require("chalk");

const conf = require("../config");
const spinner = require("../spinner");
const { client: weblateClient } = require("../weblate");
const unitsQuery = require("../weblate/unitsQuery");
const isSourceChanged = require("../strings/isSourceChanged");
const { findStringsInSheets, unitStateName } = require("./translationLookup");

module.exports = async function showString(keyOrId, options) {
    try {
        conf.validate();
        const matches = await findStringsInSheets(keyOrId);
        const results = [];
        for (const { sheet, string } of matches) {
            spinner.start(
                `Downloading translations of ${string.id} from ${sheet.weblateComponentSlug}`
            );
            const units = await weblateClient.getUnits(
                unitsQuery({
                    projectSlug: sheet.weblateProjectSlug,
                    componentSlug: sheet.weblateComponentSlug,
                    context: string.id
                })
            );
            spinner.stop();
            results.push(describe(sheet, string, units, options.lang));
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

function describe(sheet, string, units, languages) {
    const weblateSource = units[0]?.source[0];
    return {
        sheet: sheet.name,
        component: `${sheet.weblateProjectSlug}/${sheet.weblateComponentSlug}`,
        id: string.id,
        key: string.key,
        value: string.value,
        description: string.description,
        aiTranslationDescription: string.aiTranslationDescription,
        isFinal: string.isFinal,
        onWeblate: units.length > 0,
        weblateSource,
        sourceDiffers:
            weblateSource !== undefined &&
            isSourceChanged(string.value, weblateSource),
        translations: units
            .filter(
                (unit) =>
                    unit.language_code !== conf.getBaseLanguage() &&
                    (!languages || languages.includes(unit.language_code))
            )
            .sort((a, b) => a.language_code.localeCompare(b.language_code))
            .map((unit) => ({
                language: unit.language_code,
                state: unitStateName(unit.state),
                target: unit.target[0],
                unitId: unit.id
            }))
    };
}

function print(result) {
    console.log(
        chalk.bold(`${result.sheet} #${result.id}`) +
            chalk.gray(` → ${result.component}`)
    );
    printField("key:", result.key);
    printField(`${conf.getBaseLanguage()} (sheet):`, result.value);
    if (result.description) {
        printField("description:", result.description);
    }
    if (result.aiTranslationDescription) {
        printField("AI context:", result.aiTranslationDescription);
    }
    if (!result.isFinal) {
        console.log(
            chalk.yellow("  ⚠ not final in the sheet, not uploaded to Weblate")
        );
    }
    if (!result.onWeblate) {
        console.log(chalk.yellow("  ⚠ not found on Weblate"));
    }
    if (result.sourceDiffers) {
        console.log(
            chalk.yellow(
                `  ⚠ source on Weblate differs from the sheet: ${result.weblateSource}`
            )
        );
    }
    for (const translation of result.translations) {
        const state =
            translation.state === "translated" ||
            translation.state === "approved"
                ? chalk.green(translation.state.padEnd(14))
                : chalk.red(translation.state.padEnd(14));
        console.log(
            `  ${translation.language.padEnd(6)} ${state} ${translation.target}`
        );
    }
    console.log();
}

function printField(label, value) {
    console.log(`  ${label.padEnd(13)} ${value}`);
}
