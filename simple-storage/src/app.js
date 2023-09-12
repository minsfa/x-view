const process = require('process');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { readdir } = require('fs/promises');
const settings = require('./settings');

const app = express();
app.use(cors());

const rootPath = process.argv[2];
if (!rootPath) {
    console.error('Root path not defined');
    return;
}

app.get('/storage/:folderName', async (request, response) => {
    const dirPath = path.join(rootPath, request.params.folderName);
    const fileNames = (await readdir(dirPath)).filter(fileName => fileName.toLowerCase().endsWith('.dcm'));
    response.json(fileNames);
    console.log(`Reading ${dirPath}`);
});

app.get('/storage/:folderName/:fileName', (request, response) => {
    const filePath = path.join(rootPath, request.params.folderName, request.params.fileName);
    response.download(filePath);
    console.log(`Downloading ${filePath}`);
});

app.listen(settings.port, () => {
    console.log(`Listening on port ${settings.port}`);
});
