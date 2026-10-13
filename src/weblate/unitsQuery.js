/**
 * Builds a Weblate search query for translation units of a component.
 * See https://docs.weblate.org/en/latest/user/search.html
 *
 * @param {object} options
 * @param {string} options.projectSlug
 * @param {string} options.componentSlug
 * @param {string} [options.language] only units of this language
 * @param {string|number} [options.context] only units of this string id (exact match)
 * @param {boolean} [options.untranslated] only units that are not translated yet (empty or needing edit)
 * @returns {string}
 */
module.exports = function unitsQuery({
    projectSlug,
    componentSlug,
    language,
    context,
    untranslated = false
}) {
    const conditions = [`project:${projectSlug}`, `component:${componentSlug}`];
    if (language) {
        conditions.push(`language:${language}`);
    }
    if (context !== undefined) {
        conditions.push(`context:=${context}`);
    }
    if (untranslated) {
        conditions.push("state:<translated");
    }
    return conditions.join(" AND ");
};
