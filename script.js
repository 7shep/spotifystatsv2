const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const clientid = '23891eeee9ee42b8aaf68a066f0d525d';
const clientsecret = '013fc4f179c849e389414f69dc73f619';

const redirecturi = 'http://127.0.0.1:5550/loginsuccess.html';

const app = express();

app.get('/loginsuccess.html', (req, res) => {
    // Check if the request contains an authorization code
    const code = req.query.code;

    if (!code) {
        res.status(400).send('Authorization code not found');
        return;
    }

    // Exchange the authorization code for an access token and refresh token
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirecturi,
        }),
        headers: {
            'Authorization': 'Basic ' + Buffer.from(clientid + ':' + clientsecret).toString('base64'),

            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
    .then(response => {
        // Access token and refresh token are in the response data
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        // Use the access token to make Spotify API requests or store it for future use
        // You can also store the refresh token for refreshing the access token
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        res.redirect('http://127.0.0.1:5550/loginsuccess.html');
    })
    .catch(error => {
        console.error('Error exchanging authorization code for access token:', error);
        res.status(500).send('Error exchanging authorization code for access token');
    });
});

app.listen(5550, () => {
    console.log('ShepStatsv2 listening on port 5550');
});
