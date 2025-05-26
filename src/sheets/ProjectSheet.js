const conf = require("../config");
const prepareStringValueForPlatform = require("../strings/prepareStringValueForPlatform");
const spinner = require("../spinner");
const xlsx = require("../xlsx");
const checkForDuplicates = require("../sheets/checkForDuplicates");

class ProjectSheet {
    constructor(name, data, valueColumnName, oneSkyProjectId) {
        this.name = name;
        this.data = data;
        this.valueColumnName = valueColumnName;
        this.oneSkyProjectId = oneSkyProjectId;
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

    getOneSkyStrings() {
        return this.getStrings().filter((string) => string.isFinal);
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
        validateKeys = true,
        validateValues = true
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
                sheet.oneSkyProjectId
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
}

module.exports = ProjectSheet;
