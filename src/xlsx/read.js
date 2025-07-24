const xlsx = require("node-xlsx").default;

const fs = require("fs/promises");

module.exports = async function read(path) {
    const buffer = await fs.readFile(path);
    return xlsx.parse(buffer);
};
