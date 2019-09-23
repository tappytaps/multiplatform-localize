const fs = require("fs-extra");
const path = require("path");

const conf = require("../config");

module.exports = function exportFile(content, fileName, language) {
    const outputFilePath = path.join(conf.getOutputDirPath(language), fileName);
    fs.writeFileSync(outputFilePath, content);
};
