const fs = require('fs');

fs.readFile('./dist/signature.min.js', 'utf8', (minReadErr, minFileData) => {
    if (minReadErr) {
        throw minReadErr;
    }
    fs.readFile('./src/index.html', 'utf8', (htmlReadErr, htmlFileData) => {
        if (htmlReadErr) {
            throw htmlReadErr;
        }
        const data = htmlFileData.replace("[MIN-FILE-HERE]", minFileData);
        fs.writeFile('./dist/ingex.html', data, 'utf8', (writeErr) => {
            if (writeErr) {
                throw writeErr;
            }
        });
    });
});