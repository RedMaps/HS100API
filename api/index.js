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
      parser = bodyParser.text();

require("../errors");

let HOST = '192.168.178.75',
    PORT = 9999;

//express usages
app.use(cors());
app.use(bodyParser.text({ type: 'text/html' }));
app.use(express.static(__dirname));

//open post server as api listener
app.post('/api', parser, function (req, res) {

    let body = JSON.parse(req.body);
    HOST = body.ip;

    switch (body.request){ //handle different api requests
        case 'get_info':
            get_info(function (result) { res.json(result); });
            break;
        case 'toggle_relay':
            toggle_relay_state(function (result) { res.json(result); });
            break;
        case 'set_relay_on':
            set_relay_state(1, function (result) { res.json(result); });
            break;
        case 'set_relay_off':
            set_relay_state(0, function (result) { res.json(result); });
            break;
        case 'get_relay_state':
            get_relay_state(function (result) { res.json(result); });
            break;
        case 'set_led_on':
            set_led_state(1, function (result) { res.json(result); });
            break;
        case 'set_led_off':
            set_led_state(0, function (result) { res.json(result); });
            break;
        case 'get_led_state':
            get_led_state(function (result) { res.json(result); });
            break;
        default:
            res.json({"err_code":REQUEST_INVALID});
    }
});

let port = process.env.PORT || 999;
app.listen(port); //start server on port 999 or environment port
console.log("Running at Port " + port);

//toggles plug on and off alternately
function toggle_relay_state(callback) {
    let client = new net.Socket().connect(PORT, HOST, function() { //start connection to device on socket
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii'); //get general system information
        client.on('data', function(data) {
            console.log(decrypt(data.toString('ascii',4)));
            let client = new net.Socket(); //create a second client
            data = toReadable(data).system.get_sysinfo;
            if(data.relay_state === 0){ //if plug is off, turn plug on
                client.connect(PORT, HOST, function() {
                    client.write(encrypt('{"system":{"set_relay_state":{"state":1}}}'), 'ascii'); //activate plug
                    client.end(); //stop socket
                    client.on('data', function() {
                        callback(jsonConcat({"ip":HOST,"relay_state":1},data)); //return data
                    })
                });
            }else { //if plug is on, shut off plug
                client.connect(PORT, HOST, function() {
                    client.write(encrypt('{"system":{"set_relay_state":{"state":0}}}'), 'ascii'); //deactivate plug
                    client.end(); //stop socket
                    client.on('data', function() {
                        callback(jsonConcat({"ip":HOST,"relay_state":0},data)); //return data
                    })
                });
            }
        }); //TODO: create error exceptions
        client.end(); //stop socket
    });
}

//set power state of plug
function set_relay_state(state, callback) {
    let client = new net.Socket().connect(PORT, HOST, function() {
        client.write(encrypt('{"system":{"set_relay_state":{"state":'+ (state | 0) +'}}}'), 'ascii'); //activate plug
        client.end();
        client.on('data', function(data) {
            callback(jsonConcat({"ip":HOST,"relay_state":(state | 0)},data)); //return data
        })
    });
}

//get power state of plug
function get_relay_state(callback) {
    let client = new net.Socket().connect(PORT, HOST, function () {
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii');
        client.end();
        client.on('data', function(data) {
            callback({"relay_state": toReadable(data).system.get_sysinfo.relay_state, "err_code":0});
        });
    });
}

//turn device led on or off
function set_led_state(state, callback){
    let client = new net.Socket().connect(PORT, HOST, function () {
        client.write(encrypt('{"system":{"set_led_off":{"off":'+ (!state | 0) +'}}}'), 'ascii');
        client.end();
        client.on('data', function() {
            callback({"led_state": (state | 0), "err_code":0});
        });
    });
}

//get state of device led
function get_led_state(callback) {
    let client = new net.Socket().connect(PORT, HOST, function () {
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii');
        client.end();
        client.on('data', function(data) {
            callback({"led_state": (!toReadable(data).system.get_sysinfo.led_off | 0), "err_code":0});
        });
    });
}

//get general information about the device
function get_info(callback){
    let client = new net.Socket().connect(PORT, HOST, function () {
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii');
        client.end();
        client.on('data', function(data) {
            callback(toReadable(data).system.get_sysinfo);
        });
    });
}

//encrypts the json message to device standards
function encrypt(str){
    let key = 171,
        result = "\0\0\0\0";
    for (let i = 0, len = str.length; i < len; i++) {
        let a = key ^ str.charAt(i).charCodeAt(0);
        key = a;
        result += String.fromCharCode(a);
    }
    return result;
}

//decrypts recieved messages
function decrypt(str){
    let key = 43,
        result = "";
    for (let i = 0, len = str.length; i < len; i++) {
        let a = key ^ str.charAt(i).charCodeAt(0);
        key = str.charAt(i).charCodeAt(0);
        result += String.fromCharCode(a);
    }
    return result;
}

//makes incoming messages readable for further use
function toReadable(data) {
    return JSON.parse(decrypt(data.toString('ascii',4)));
}

//appends a jason object to another
function jsonConcat(o1, o2) {
    for (let key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}