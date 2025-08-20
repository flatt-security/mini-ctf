const express = require('express');
const cookieParser = require('cookie-parser');

const FLAG = process.env.FLAG || 'flag{DUMMY}';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cookieParser());

const users = {
    // guest user. This user has no admin permissions.
    guest: {
        isAdmin: false
    },

    // admin user. This user has admin permissions.
    // However, the ID is randomly generated, so it is not known in advance.
    [crypto.randomUUID()]: {
        isAdmin: true,
    }
};

app.get('/', (req, res) => {
    const username = req.cookies.username || 'stranger';
    return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Form</title>
</head>
<body>
    <h1>Login Form</h1>
    <p>Hello, ${username}!</p>
    <p><a href="/login-as-guest">Click here to login as <code>guest</code></a>.</p>
    <p>If you are sure you are admin, then access <a href="/admin"><code>/admin</code></a> to get the flag.</p>
</body>
</html>
`.trim());
});

app.get('/login-as-guest', (req, res) => {
    res.cookie('username', 'guest');
    return res.redirect('/');
});

app.get('/admin', (req, res) => {
    const username = req.cookies.username;
    if (username === 'admin') {
        return res.send('What are you trying to do?');
    }

    const user = users[username];
    try {
        if (!username || !user.isAdmin) {
            return res.send(`You don't have enough permissions to access this page.`);
        }
    } catch {
        console.error('something wrong');
    }
    return res.send(`Hello, admin! The flag is: ${FLAG}`);
});

app.listen(PORT, () => { console.log('running'); });
