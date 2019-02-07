const httpProxy = require('http-proxy');
const app = require('express')();
const bodyParser = require('body-parser');
const request = require('request');
const allHosts = [];
const TIME_OUT = 500;
let activeHost = [];
let counter = 1;
const PORT = process.env.PORT || 9000;

app.use(bodyParser());

const filterUnhealthyHosts = function () {
    activeHost = new Array();
    allHosts.forEach(host => {
        let shouldAdd = true;
        request(`${host}/health`, (err, res) => {
            if (res.statusCode === 200 && shouldAdd) {
                activeHost.push(host);
            }
        });
        setTimeout(() => shouldAdd = false, TIME_OUT);
    });
};

setInterval(filterUnhealthyHosts, 200);

app.post('/join',(req,res) => {
    let hostAddress = req.body.hostAddress;
    console.log(hostAddress);
    allHosts.push(hostAddress);
    res.end();
});

app.get('/activeHosts', (req, res) => {
    res.json({ activeHosts: activeHost });
});

app.use((req, res) => {
    const proxyServer = httpProxy.createProxyServer({ target: activeHost[counter % activeHost.length] });
    proxyServer.on('error', () => res.end());
    counter++;
    proxyServer.proxyRequest(req, res);
})

app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`Listening on ${PORT}`);
});

app.on('error', (err) => console.log(err.message));
