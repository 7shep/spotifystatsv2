const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const clientid = '23891eeee9ee42b8aaf68a066f0d525d';
const clientsecret = '013fc4f179c849e389414f69dc73f619';
const redirecturi = 'http://127.0.0.1:5550/loginsuccess.html';

const app = express();

let accessToken = ''; // Variable to store the access token

app.get('/loginsuccess.html', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        res.status(400).send('Authorization code not found');
        return;
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirecturi,
        }), {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(clientid + ':' + clientsecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        accessToken = response.data.access_token; // Store the access token in the variable

        const refreshToken = response.data.refresh_token;
        const expires = response.data.expires_in;

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('Expires In:', expires);

        res.redirect('http://127.0.0.1:5550/loginsuccess.html');
    } catch (error) {
        console.error('Error exchanging authorization code for access token:', error);
        res.status(500).send('Error exchanging authorization code for access token');
    }
});

// Add an endpoint to retrieve the access token
app.get('/getAccessToken', (req, res) => {
    res.json({ accessToken });
});

app.listen(5550, (host, port) => {
    console.log('ShepStatsv2 listening on port http://%s%s', host, port);
});
