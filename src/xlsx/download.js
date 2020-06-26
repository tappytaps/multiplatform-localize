const { https } = require("follow-redirects");
const streamBuffers = require("stream-buffers");

module.exports = function download(url) {
    const xlsxBuffer = new streamBuffers.WritableStreamBuffer();

    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                response.on("data", (data) => {
                    xlsxBuffer.write(data);
                });
                response.on("end", () => {
                    xlsxBuffer.end();
                    resolve(xlsxBuffer);
                });
            })
            .on("error", (error) => {
                reject(error);
            });
    });
};
