'use strict';
module.exports = function(app) {
    let HS100 = require('../controllers/HS100Controller');

    // todoList Routes
    app.route('/info')
        .get(HS100.get_info)
        .get(HS100.get_relay_state)
        .get(HS100.get_led_state)
        .post(HS100.toggle_relay_state)
        .post(HS100.set_relay_on)
        .post(HS100.set_relay_off)
        .post(HS100.set_led_on)
        .post(HS100.set_led_off);
};