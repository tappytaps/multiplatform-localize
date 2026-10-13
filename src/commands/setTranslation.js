const chalk = require("chalk");

const conf = require("../config");
const spinner = require("../spinner");
const { client: weblateClient } = require("../weblate");
const unitsQuery = require("../weblate/unitsQuery");
const findFormatMismatches = require("../strings/findFormatMismatches");
const { findStringsInSheets, unitStateName } = require("./translationLookup");

module.exports = async function setTranslation(
    keyOrId,
    language,
    text,
    options
) {
    try {
        conf.validate();
        validateLanguage(language);

        const matches = await findStringsInSheets(keyOrId);
        if (matches.length > 1) {
            const found = matches
                .map(({ sheet, string }) => `${sheet.name} #${string.id}`)
                .join(", ");
            throw new Error(
                `"${keyOrId}" matches more strings (${found}), use the string id`
            );
        }
        const { sheet, string } = matches[0];
        if (!string.isFinal) {
            throw new Error(
                `String #${string.id} is not final in the sheet, so it is not on Weblate yet`
            );
        }

        spinner.start("Downloading the translation from Weblate");
        const units = await weblateClient.getUnits(
            unitsQuery({
                projectSlug: sheet.weblateProjectSlug,
                componentSlug: sheet.weblateComponentSlug,
                language,
                context: string.id
            })
        );
        spinner.stop();
        const component = `${sheet.weblateProjectSlug}/${sheet.weblateComponentSlug}`;
        if (units.length !== 1) {
            throw new Error(
                `Expected one ${language} translation of #${string.id} in ${component}, found ${units.length}`
            );
        }
        const unit = units[0];

        console.log(
            chalk.bold(`${sheet.name} #${string.id}`) +
                chalk.gray(` → ${component}`)
        );
        console.log(`  key:     ${string.key}`);
        console.log(`  source:  ${unit.source[0]}`);
        console.log(
            `  ${language.padEnd(7)}  ${chalk.red(unit.target[0] || "(empty)")} ${chalk.gray(`(${unitStateName(unit.state)})`)}`
        );
        console.log(`  new:     ${chalk.green(text)}`);

        const problems = findFormatMismatches(unit.source[0], text);
        if (problems.length > 0) {
            if (!options.force) {
                throw new Error(
                    `Translation does not match the source: ${problems.join(", ")} (use --force to save anyway)`
                );
            }
            spinner.warn(
                `Translation does not match the source: ${problems.join(", ")}`
            );
        }

        if (options.dryRun) {
            spinner.info("Dry run, nothing saved");
            return;
        }
        spinner.start(`Saving ${language} translation`);
        const updatedUnit = await weblateClient.updateUnitTarget(unit.id, text);
        spinner.succeed(
            `Saved ${language} translation of #${string.id} (${unitStateName(updatedUnit.state)})`
        );
    } catch (error) {
        spinner.fail(error.message);
        process.exitCode = 1;
    }
};

function validateLanguage(language) {
    if (language === conf.getBaseLanguage()) {
        throw new Error(
            `${language} is the source language, change the string in the sheet and upload it with upload-strings`
        );
    }
    // Weblate can have more languages than the app downloads, a mistyped language is caught by the unit lookup
    const languages = conf.getSupportedLanguages();
    if (languages && !languages.includes(language)) {
        spinner.warn(
            `${language} is not in the configured languages (${languages.join(", ")}), the app will not download it`
        );
    }
}
