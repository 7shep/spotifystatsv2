var express = require('express');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var querystring = require('querystring');
var app = express();
var port = 5500; // You can choose any port you like
var fs = require('fs');


var index = fs.readFileSync('index.html');
var login = fs.readFileSync('loginsuccess.html');
var style = fs.readFileSync('style.css');
var final = fs.readFileSync('final.html');


app.use(bodyParser.urlencoded({ extended: true }));

// Spotify API credentials
var CLIENT_ID = 'your_client_id';
var CLIENT_SECRET = 'your_client_secret';
var REDIRECT_URI = 'http://127.0.0.1:5500/loginsuccess.html'; // Update the URL to match your actual redirect URI

// Store the access token temporarily (in-memory)
let access_token = '';

// Redirect user to Spotify login
// server.js
app.get('/loginsuccess.html', (req, res) => {
    // Redirect the user to the Spotify login URL
    var scope = 'user-read-private user-read-email'; // Define your desired scope
    var state = 'some-random-state'; // Generate a unique state
    var authorizeURL = `https://accounts.spotify.com/authorize?` +
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
  var code = req.query.code || null;

  // Make a POST request to Spotify to exchange the code for an access token
  var authOptions = {
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

  var tokenResponse = await fetch('https://accounts.spotify.com/api/token', authOptions);
  var tokenData = await tokenResponse.json();

  // Store the access token (you might want to store it securely)
  access_token = tokenData.access_token;

  res.send('Access token obtained! You can now use it for Spotify API requests.');
});

// Example route to retrieve user data (you can implement your own API endpoints)
app.get('/user-data', async (req, res) => {
  if (!access_token) {
    return res.status(401).json({ error: 'Access token not available' });
  }

  var userResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
  });

  var userData = await userResponse.json();
  res.json(userData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

