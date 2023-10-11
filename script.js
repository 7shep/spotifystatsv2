//Imports
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var fs = require('fs');


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
//var playlists = fs.readFileSync('playlists.html');



var app = express();
app.use(cookieParser());

let accessToken = '';
let userid = '';
let playlistlink = '';
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

  if (state == null || state !== storedState) {
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
      if (!error && response.statusCode == 200) {

        var access_token = body.access_token,
        refresh_token = body.refresh_token;


        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
          //userid = body.id;
          console.log(body.id);
          userid = body.id;
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
  console.log(accessToken);
  console.log(userid);

  // Define the playlist data you want to create
  const playlistData = {
    name: 'Shep Stats v2', // Name of the new playlist
    description: 'SHEPSTATSV2 RECOMMENDED PLAYLIST', // Description of playlist
    public: false, // Set to true if you want the playlist to be public
  };

 // Create the POST request options
 const requestOptions = {
  url: `https://api.spotify.com/v1/users/${userid}/playlists`,
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  json: playlistData,
};

// Make the POST request to create the playlist
request.post(requestOptions, function (error, response, body) {
  if (!error && response.statusCode == 201) {
    // Playlist creation was successful
    console.log('Playlist created:', body);
    const trackUris = [
      'spotify:track:0zLClc0emc6qUeV1p5nc99', 'spotify:track:1udwFobQ1JoOdWPQrp2b6u', 'spotify:track:5wG3HvLhF6Y5KTGlK0IW3J', 'spotify:track:4SCnCPOUOUXUmCX2uHb3r7', 'spotify:track:7vgTNTaEz3CsBZ1N4YQalM', 'spotify:track:3MWlVSkoLS1e66nlZ2tuWJ', 'spotify:track:1vHzUmqpA2tgO1OGtBuItX', 'spotify:track:4uu7gKd1PffC7QEMcMk0Ro', 'spotify:track:1oOEkBNp4zWnkD7nWjJdog', 'spotify:track:4S4QJfBGGrC8jRIjJHf1Ka'
    ];

    // Create the POST request options to add tracks to the playlist
    const addTracksOptions = {
      url: `https://api.spotify.com/v1/playlists/${body.id}/tracks`, // Use body.id to get the playlist ID
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      json: {
        uris: trackUris,
      },
    };

    // Make the POST request to add tracks to the playlist
    request.post(addTracksOptions, (addError, addResponse, addBody) => {
      if (!addError && addResponse.statusCode == 201) {
        // Tracks added successfully
        console.log('Tracks added to the playlist:', addBody);
        //console.log(body.external_urls.spotify);
        playlistlink = body.external_urls.spotify;
        console.log(playlistlink);
        //res.send(playlistlink);
        res.redirect(playlistlink);
        

      } else {
        // Failed to add tracks
        console.error('Error adding tracks to the playlist:', addError);
        
      }
    });
  } else {
    // Playlist creation failed
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Failed to create the playlist.' });
  }
  });



});

app.get('/topsongs.html', (req, res) => {

  res.set('Content-Type', 'text/html');
  
  var time = 'medium_term';
  const requestOptions = {
    url: `https://api.spotify.com/v1/me/top/tracks?time_range=${time}&limit=10`, // Include the time_range and limit parameters
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
  
  

  request.get(requestOptions, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      var responsesongs = JSON.parse(body);

      console.log(responsesongs);
      res.send(topsongs);
    } else {
      console.error("Error: ", error);
    }
  })

})


//Express listens to port 5500 
console.log('Listening')
app.listen(5500);