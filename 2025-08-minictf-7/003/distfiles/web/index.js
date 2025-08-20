const fs = require('fs');
const cp = require('child_process');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));

const indexHtml = fs.readFileSync('./index.html', 'utf8');
app.get('/', (req, res) => {
    return res.send(indexHtml);
});

app.post('/say', (req, res) => {
    const params = req.body.params || {};
    if (typeof params.input !== 'string' || params.input.length > 100) {
        return res.status(400).json({ error: 'Message too long' });
    }

    try {
        const result = cp.execFileSync('/usr/games/cowsay', [], {
            ...params,
            encoding: 'utf8',
            timeout: 3000,

            // just to be sure we don't execute arbitrary commands
            cwd: '/app',
            shell: '/bin/sh'
        });

        return res.json({
            message: result.trim()
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to generate cowsay' });
    }
});

app.listen(PORT, () => {
    console.log('Server is running');
});