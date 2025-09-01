const { http, https } = require("follow-redirects");
const streamBuffers = require("stream-buffers");
const xlsx = require("node-xlsx").default;

module.exports = function download(url) {
    const xlsxBuffer = new streamBuffers.WritableStreamBuffer();
    const { protocol } = new URL(url);

    return new Promise((resolve, reject) => {
        (protocol === "https:" ? https : http)
            .get(url, (response) => {
                response.on("data", (data) => {
                    xlsxBuffer.write(data);
                });
                response.on("end", () => {
                    xlsxBuffer.end();
                    try {
                        const parsedXlsx = xlsx.parse(xlsxBuffer.getContents());
                        resolve(parsedXlsx);
                    } catch (error) {
                        reject(error);
                    }
                });
            })
            .on("error", (error) => {
                reject(error);
            });
    });
};
