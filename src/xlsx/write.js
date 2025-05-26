const xlsx = require("node-xlsx").default;

const fs = require("fs/promises");

module.exports = async function write(path, xlsxData) {
    const buffer = xlsx.build(xlsxData);
    await fs.writeFile(path, buffer);
};
