const express = require('express');
const helmet = require('helmet');

const FLAG = process.env.FLAG || 'flag{DUMMY}';
const IMPORTANT_HEADER_KEY = 'content-security-policy';

if (process.argv.length < 3) {
    console.error('no arg provided');
    process.exit(1);
}

// pollute Object.prototype with user-provided object
const payload = process.argv[2]; // you can control this string
for (const [k, v] of Object.entries(JSON.parse(payload))) {
    Object.prototype[k] = v;
}

/////////////////////////////////////////////////////////////////////////////

// okay, let's deploy the server
const app = express();
app.use(helmet()); // this will strengthen this app!
app.get('/', (req, res) => {
    res.send('ok');
});

app.listen(3000, () => {
    // send request to the server itself to check if the header is polluted
    fetch('http://localhost:3000').then(r => {
        if (!r.headers.has(IMPORTANT_HEADER_KEY)) {
            console.log(`nope: ${IMPORTANT_HEADER_KEY} not found`);
            process.exit(0);
        }

        // if you control the Content-Security-Policy header, I will give you the flag
        const headerValue = r.headers.get(IMPORTANT_HEADER_KEY);
        const isHeaderPolluted = headerValue.includes('give me flag!');
        console.log(isHeaderPolluted ? `Congratulations! The flag is: ${FLAG}` : 'nope: header not polluted');
        process.exit(0);
    });
});
