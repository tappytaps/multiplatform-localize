const ISO6391 = require("iso-639-1");

module.exports = {
    getName
};

function getName(languageCode) {
    return ISO6391.getName(languageCode.split("-")[0]);
}
