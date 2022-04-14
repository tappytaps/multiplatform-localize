const fs = require("fs-extra");
const path = require("path");

const conf = require("../config");
const ensureDirectoryExistence = require("./ensureDirectoryExistence");

module.exports = function exportFile(content, fileName, language) {
    const outputFilePath = path.join(conf.getOutputDirPath(language), fileName);

    ensureDirectoryExistence(outputFilePath);

    fs.writeFileSync(outputFilePath, content);
};
