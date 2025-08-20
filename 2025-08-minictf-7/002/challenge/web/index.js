const fs = require('fs');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({ extended: false }));

const indexHtml = fs.readFileSync('./index.html', 'utf8');
app.get('/', (req, res) => {
    return res.send(indexHtml);
});

app.get('/static/:file', (req, res) => {
    let file = req.params.file;
    for (const forbidden of ['dev', 'proc']) {
        if (file.includes(forbidden)) {
            return res.status(400).send({
                error: `Access to ${forbidden} directory is not allowed`,
                requestedFile: file
            });
        }
    }

    file = file.replace('..', ''); // Prevent directory traversal
    if (file.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
    } else if (file.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
    }

    if (fs.existsSync(`./static/${file}`)) {
        return res.send(fs.readFileSync(`./static/${file}`, 'utf8'));
    }
    return res.status(404).send({
        error: 'File not found',
        requestedFile: file
    });
});

app.listen(PORT, () => {
    console.log('Server is running');
});