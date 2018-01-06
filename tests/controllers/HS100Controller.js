const net = require("net");
let PORT = 9999;

exports.get_info = function (req, res) {
    console.log(req.body);
    let client = new net.Socket().connect(PORT, req.body.ip, function () {
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii');
        client.end();
        client.on('data', function(data) {
            res.json(toReadable(data).system.get_sysinfo);
        });
    });
};

exports.get_relay_state = function (req, res) {
    let client = new net.Socket().connect(PORT, req.body.ip, function () {
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii');
        client.end();
        client.on('data', function(data) {
            res.json({"relay_state": toReadable(data).system.get_sysinfo.relay_state, "err_code":0});
        });
    });
};

exports.get_led_state = function (req, res) {
    let client = new net.Socket().connect(PORT, req.body.ip, function () {
        client.write(encrypt('{"system":{"get_sysinfo":{}}}'), 'ascii');
        client.end();
        client.on('data', function(data) {
            res.json({"led_state": (!toReadable(data).system.get_sysinfo.led_off | 0), "err_code":0});
        });
    });
};

exports.toggle_relay_state = function(req, res) {
    console.log(req.body);
    let HOST = req.body.ip;
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
                        res.json(jsonConcat({"ip":HOST,"relay_state":1},data)); //return data
                    })
                });
            }else { //if plug is on, shut off plug
                client.connect(PORT, HOST, function() {
                    client.write(encrypt('{"system":{"set_relay_state":{"state":0}}}'), 'ascii'); //deactivate plug
                    client.end(); //stop socket
                    client.on('data', function() {
                        res.json(jsonConcat({"ip":HOST,"relay_state":0},data)); //return data
                    })
                });
            }
        }); //TODO: create error exceptions
        client.end(); //stop socket
    });
};

exports.set_relay_on = function (req, res) {
    set_relay_state(req, 1, function (data) {
        res.json(data);
    })
};

exports.set_relay_off = function (req, res) {
    set_relay_state(req, 0, function (data) {
        res.json(data);
    })
};

exports.set_led_on = function (req, res) {
    set_led_state(req, 1, function () {
        res.json(data);
    })
};

exports.set_led_off = function (req, res) {
    set_led_state(req, 0, function () {
        res.json(data);
    })
};

//turn plug on or off
function set_relay_state(req, state, callback) {
    let client = new net.Socket().connect(PORT, req.body.ip, function() {
        client.write(encrypt('{"system":{"set_relay_state":{"state":'+ (state | 0) +'}}}'), 'ascii'); //activate plug
        client.end();
        client.on('data', function(data) {
            callback(jsonConcat({"ip":HOST,"relay_state":(state | 0)},data)); //return data
        })
    });
}

//turn device led on or off
function set_led_state(req, state, callback){
    let client = new net.Socket().connect(PORT, req.body.ip, function () {
        client.write(encrypt('{"system":{"set_led_off":{"off":'+ (!state | 0) +'}}}'), 'ascii');
        client.end();
        client.on('data', function() {
            callback({"led_state": (state | 0), "err_code":0});
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