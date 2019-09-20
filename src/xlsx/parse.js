const xlsx = require("node-xlsx").default;

module.exports = function parse(buffer) {
    return xlsx.parse(buffer.getContents());
};
