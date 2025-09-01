const conf = require("../config");
const prepareStringValueForPlatform = require("../strings/prepareStringValueForPlatform");
const spinner = require("../spinner");
const xlsx = require("../xlsx");
const checkForDuplicates = require("../sheets/checkForDuplicates");
const weblateClient = require("../weblate/client");

class ProjectSheet {
    constructor(
        name,
        data,
        valueColumnName,
        weblateProjectSlug,
        weblateComponentSlug
    ) {
        this.name = name;
        this.data = data;
        this.valueColumnName = valueColumnName;
        this.weblateProjectSlug = weblateProjectSlug;
        this.weblateComponentSlug = weblateComponentSlug;
    }

    columnIndex(columnName) {
        if (!columnName) {
            return -1;
        }
        return this.data[0].findIndex(
            (cellContent) => cellContent === columnName
        );
    }

    getPlatformStrings() {
        return this.getStrings()
            .filter((string) => string.key)
            .map((string) => {
                return {
                    ...string,
                    value: prepareStringValueForPlatform(
                        string.value,
                        conf.platform,
                        string.isHtml
                    )
                };
            });
    }

    getFinalStrings() {
        return this.getStrings().filter((string) => string.isFinal);
    }

    async getLanguages() {
        const languages = await weblateClient.getComponentLanguages(
            this.weblateProjectSlug,
            this.weblateComponentSlug
        );
        return languages;
    }

    getStrings() {
        const idColumn = this.columnIndex(conf.columns.id);
        const keyColumn = this.columnIndex(conf.columns.key);
        const valueColumn = this.columnIndex(this.valueColumnName);
        const allowDuplicatesColumn = this.columnIndex(
            conf.columns.allowDuplicates
        );
        const descriptionsColumn = this.columnIndex(conf.columns.description);
        const isHtmlColumn = this.columnIndex(conf.columns.isHtml);
        const isFinalColumn = this.columnIndex(conf.columns.isFinal);
        const aiTranslationDescriptionColumn = this.columnIndex(
            conf.columns.aiTranslationDescription
        );

        return this.data
            .slice(1)
            .filter(
                (row) =>
                    row[valueColumn] !== undefined &&
                    row[idColumn] !== undefined
            )
            .map((row) => {
                return {
                    id: row[idColumn],
                    key: row[keyColumn],
                    value: row[valueColumn],
                    description: row[descriptionsColumn],
                    allowDuplicates: row[allowDuplicatesColumn] === true,
                    isHtml: row[isHtmlColumn] === true,
                    isFinal: row[isFinalColumn] === true,
                    aiTranslationDescription:
                        row[aiTranslationDescriptionColumn]
                };
            });
    }

    static async downloadSheets({
        filterSheets,
        validateIds = true,
        validateKeys = false,
        validateValues = false
    } = {}) {
        const xlsxFile = await xlsx.download(conf.xlsxUrl);
        let projectSheets = [];

        for (const sheet of conf.getSheets()) {
            const xlsxSheet = xlsxFile.find((s) => s.name === sheet.name);
            if (!xlsxSheet) {
                throw new Error("Sheet not found: " + sheet.name);
            }
            const { name, data } = xlsxSheet;
            const projectSheet = new ProjectSheet(
                name,
                data,
                sheet.valueColumn,
                sheet.weblateProjectSlug,
                sheet.weblateComponentSlug
            );
            projectSheets.push(projectSheet);
        }

        checkForDuplicates(projectSheets, (message) => spinner.warn(message), {
            checkIds: validateIds,
            checkKeys: validateKeys,
            checkValues: validateValues
        });

        if (filterSheets) {
            projectSheets = projectSheets.filter((projectSheet) => {
                if (typeof filterSheets === "string") {
                    return projectSheet.name === filterSheets;
                } else {
                    return filterSheets.includes(projectSheet.name);
                }
            });
        }

        return projectSheets;
    }

    static async getLanguages(projectSheets) {
        const languages = [];
        const languagesCount = {};

        for (const sheet of projectSheets) {
            const sheetLanguages = await sheet.getLanguages();
            for (const language of sheetLanguages) {
                if (languagesCount[language.code]) {
                    languagesCount[language.code] += 1;
                } else {
                    languagesCount[language.code] = 1;
                }
                if (!languages.find((l) => l.code === language.code)) {
                    languages.push(language);
                }
            }
        }
        return languages.filter((language) => {
            return languagesCount[language.code] === projectSheets.length;
        });
    }

    static async getPlatformStrings(projectSheets) {
        const platformStrings = projectSheets.reduce(
            (acc, sheet) => [...acc, ...sheet.getPlatformStrings()],
            []
        );
        return platformStrings;
    }

    static async getLocalizedStrings(projectSheets, language) {
        let strings = [];

        for (const sheet of projectSheets) {
            const translations = await weblateClient.getTranslations(
                sheet.weblateProjectSlug,
                sheet.weblateComponentSlug,
                language
            );
            if (translations) {
                const projectStrings = Object.keys(translations).map(
                    (translationId) => {
                        const id = translationId;
                        const value = translations[translationId].trim();
                        return { id, value };
                    }
                );
                strings = [...strings, ...projectStrings];
            }
        }

        return strings;
    }
}

module.exports = ProjectSheet;
