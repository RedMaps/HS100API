/*
    TPLink HS100 Smartplug API
    Author: Julian Karhof
    Date: 06.01.2018
    Web: julian.karhof.net
 */

//imports
const net = require('net'),
    express = require("express"),
    app = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    parser = bodyParser.text(),
    port = 999;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.text({ type: 'text/html' }));
app.use(express.static(__dirname));

let routes = require('./routes/HS100Routes'); //importing route
routes(app); //register the route

app.listen(port);
console.log("Running at Port " + port);