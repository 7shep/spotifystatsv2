// BACKEND!!!!
const express = require('express');
const data = express();
const axios = require('axios');
const clientid = '177ec6dd56f4484896594269907bae25';
const clientsecret = '1571efa9f6934cf29b900affd56f38ba';
const redirecturi = 'https://127.0.0.1:5500/login.html/';



var server = data.listen(5500, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Shep Stats V2 LIstening at http://%s:%s", host, port);
})


