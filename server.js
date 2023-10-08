const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const querystring = require('querystring');
const app = express();
const port = 5500; // You can choose any port you like

app.use(bodyParser.urlencoded({ extended: true }));

// Spotify API credentials
const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = 'http://127.0.0.1:5500/loginsuccess.html'; // Update the URL to match your actual redirect URI

// Store the access token temporarily (in-memory)
let access_token = '';

// Redirect user to Spotify login
// server.js
app.get('/token', (req, res) => {
    // Redirect the user to the Spotify login URL
    const scope = 'user-read-private user-read-email'; // Define your desired scope
    const state = 'some-random-state'; // Generate a unique state
    const authorizeURL = `https://accounts.spotify.com/authorize?` +
      querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
      });
    res.redirect(authorizeURL);
  });
  

// Callback route to handle the response from Spotify
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  // Make a POST request to Spotify to exchange the code for an access token
  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  };

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', authOptions);
  const tokenData = await tokenResponse.json();

  // Store the access token (you might want to store it securely)
  access_token = tokenData.access_token;

  res.send('Access token obtained! You can now use it for Spotify API requests.');
});

// Example route to retrieve user data (you can implement your own API endpoints)
app.get('/user-data', async (req, res) => {
  if (!access_token) {
    return res.status(401).json({ error: 'Access token not available' });
  }

  const userResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
  });

  const userData = await userResponse.json();
  res.json(userData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
