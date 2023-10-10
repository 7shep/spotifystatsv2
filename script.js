//Imports
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var fetch = require('fetch');


//Spotify API Shananigans
var client_id = '23891eeee9ee42b8aaf68a066f0d525d'; // Your client id
var client_secret = '013fc4f179c849e389414f69dc73f619'; // Your secret
var redirect_uri = 'http://127.0.0.1:5500/callback'; // Your redirect uri

//Server sending my website files
var index = fs.readFileSync('index.html');
var style = fs.readFileSync('style.css');
var login = fs.readFileSync('loginsuccess.html');
var final = fs.readFileSync('final.html');
var finalcss = fs.readFileSync('final.css');
var topsongs = fs.readFileSync('topsongs.html');
var playlists = fs.readFileSync('playlists.html');

var app = express();
app.use(cookieParser());

let accessToken = '';


//Sends index.html to the user.
app.get('/', (req, res) => {

    res.set('Content-Type', 'text/html');
    res.send(index);

});
//Sends index.html to the user.
app.get('/index.html', (req, res) => {

    res.set('Content-Type', 'text/html');
    res.send(index);

});

//Function for my access token.
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

var stateKey = 'spotify_auth_state';

//After the user clicks "Login to Spotify", sends user to spotify
app.get('/loginsuccess.html', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

//Downloads style.css for the user so the website looks better.
app.get('/style.css', (req, res) => {

  res.set('Content-Type', 'text/css');
  res.send(style);

})

//After the user logs into Spotify, this post request is sent. I will explain this better during my presentation
app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
        refresh_token = body.refresh_token;


        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
          console.log('test');
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/final.html?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
        
      }
    });
  }
  
});

//Sends the user final.html
app.get('/final.html', (req, res) => {

    res.set('Content-Type', 'text/html');
    res.send(final);

    accessToken = req.query.access_token;
    console.log(accessToken);


    
});


//Sends the user final.css
app.get('/final.css', (req, res) => {

  res.set('Content-Type', 'text/css');
  res.send(finalcss);





})


app.get('/playlists.html', (req, res) => {

  res.set('Content-Type', 'text/html');
  res.send(playlists);
  console.log(accessToken);


  const playlistResponse = createPlaylist(accessToken, 'SHEPSTATSv2 PLAYLIST');

    if (playlistResponse.status === 201) {
        const playlistData = playlistResponse.json();
        const playlistId = playlistData.id;

        // Add 20 songs to the playlist
        const trackUris = ['spotify:track:track_id_1', 'spotify:track:track_id_2', /* Add more track URIs here */];

        addTracksToPlaylist(accessToken, playlistId, trackUris);

        // Send a success response
        res.status(200).json({ message: 'Playlist created and tracks added successfully!' });
    } else {
        res.status(500).json({ message: 'Failed to create the playlist.' });
    }

})

async function createPlaylist(accessToken, playlistName) {
  const url = 'https://api.spotify.com/v1/me/playlists';
  const bodyData = {
      name: playlistName,
      public: false, // You can change the privacy settings as needed
  };

  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
  });

  return response;
}

async function addTracksToPlaylist(accessToken, playlistId, trackUris) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const bodyData = {
      uris: trackUris,
  };

  await fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
  });
}


//Express listens to port 5500 
console.log('Listening')
app.listen(5500);