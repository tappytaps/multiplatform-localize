module.exports = {
    ios: {
        formatSpecifiers: "none",
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
        formatSpecifiers: "automatic",
        specialCharacters: []
    }
};
