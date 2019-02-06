    const httpProxy = require('http-proxy');
    const app = require('express')();
    const hosts = process.env.HOSTS.split(',');
    let counter = 1;
    const PORT = process.env.PORT || 9000;


    app.use((req,res)=> {
        const proxyServer = httpProxy.createProxyServer({ target: hosts[counter % hosts.length] });
        counter++;
        proxyServer.proxyRequest(req, res, {});
    })

    app.listen(PORT, (err) => {
        if (err) console.log(err);
        else console.log(`Listening on ${PORT}`);
    });

    app.on('error', (err) => console.log(err.message));
