let devices = document.getElementById("devices");

function loadDevices(callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
            let doc = JSON.parse(this.response);
            for (let i = 0; i < doc.devices.length; i++) {
                let data = doc.devices[i];
                devices.innerHTML += `
                <!--"${data.description}" with name "${data.name}" in room "${data.room}" with ip ${data.ip}-->
                <div class="col s12 l3">
                    <div class="card-panel">
                        <h6><i class="material-icons small ico">lightbulb_outline</i> &nbsp;&nbsp;&nbsp; ${data.name}
                            <div class="switch"><label>Off<input class="toggle" disabled id="${data.name}" ip="${data.ip}" type="checkbox"><span class="lever"></span>On</label></div>
                        </h6>
                    </div>
                </div>`
            }
            callback();
        }
    };
    xhttp.open("GET", "devices.json", true);
    xhttp.send();
}

loadDevices(function () {
    let toggles = $('.toggle');

    function refresh() {
        toggles.each(function () {
            let ip = this.attributes.ip.value,
                toggle = this,
                xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE) {
                    console.log(this.response);
                    toggle.checked = JSON.parse(this.response).relay_state;
                    toggle.disabled = false;
                }
            };
            xhttp.open("POST", "http://localhost:999/api", true);
            xhttp.send('{"request":"get_relay_state","ip":"'+ip+'"}');
        });
    }

    function toggle(ip) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE) {
                console.log("Data recieved: " + this.response);
            }
        };
        xhttp.open("POST", "http://localhost:999/api", true);
        xhttp.send('{"request":"toggle_relay","ip":"'+ip+'"}');
    }

    toggles.on('change', function() {
        console.log(this.attributes.id.value + " " + this.attributes.ip.value);
        toggle(this.attributes.ip.value);
    });

    refresh();
    //setInterval(refresh, 1000);
});