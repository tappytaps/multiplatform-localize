module.exports = {
    ios: {
        formatSpecifiers: {},
        specialCharacters: []
    },
    android: {
        formatSpecifiers: {
            string: "s",
            integer: "d",
            double: "f"
        },
        specialCharacters: {
            "@": "\\@",
            "?": "\\?",
            "<": "\\<",
            "'": "\\'",
            "&": "&amp;"
        }
    },
    web: {
        formatSpecifiers: {},
        specialCharacters: []
    }
};
