const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const clientid = '23891eeee9ee42b8aaf68a066f0d525d';
const clientsecret = '013fc4f179c849e389414f69dc73f619';

const redirecturi = 'http://127.0.0.1:5550/loginsuccess.html';

const app = express();

app.get('/loginsuccess.html', async (req, res) => {
  try {
    // Check if the request contains an authorization code
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
      res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } else {
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post', // Use 'post' method
        data: querystring.stringify({
          code: code,
          redirect_uri: redirecturi,
          grant_type: 'authorization_code'
        }),
        headers: {
          'Authorization': 'Basic ' + Buffer.from(clientid + ':' + clientsecret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const response = await axios(authOptions);

      if (response.status === 200) {
        const access_token = response.data.access_token;
        console.log(access_token);
        res.send({ 'access_token': access_token });
      } else {
        res.status(response.status).send('Error');
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }});

app.listen(5550, () => {
  console.log('ShepStatsv2 listening on port 5550');
});

app.get('/', (req, res) => {
    // Handle requests to the root path here\
    res.send('Welcome to ShepStatsv2');
  });