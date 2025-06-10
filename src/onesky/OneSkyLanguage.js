const glossary = require("../utils/glossary");

module.exports = class OneSkyLanguage {
    constructor(data) {
        this.code = data.code;
        this.englishName = data.english_name;
        this.localName = data.local_name;
        this.locale = data.locale;
        this.region = data.region;
        this.isBaseLanguage = data.is_base_language;
        this.isReadyToPublish = data.is_ready_to_publish;
        this.translationProgress = data.translation_progress;
        this.lastUpdatedAt = data.last_updated_at;
        this.lastUpdatedAtTimestamp = data.last_updated_at_timestamp;
    }

    async getGlossary() {
        if (glossary.isAvailable()) {
            return await glossary.getGlossaryForLanguage(this);
        }
        return null;
    }
};
