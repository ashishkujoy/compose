const app = require('express')();
const request = require('request');
const bodyParser = require('body-parser');
const PORT = process.env.PORT;
const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/postgres";
const { Client } = require('pg');
const client = new Client(connectionString);
const SECRET_MESSAGE = process.env.SECRET_MESSAGE;
const delayTime = process.env.DELAY_TIME;
const MY_HOST_ADDRESS = process.env.MY_HOST_ADDRESS;
const LOAD_BALANCER_URL = process.env.LOAD_BALANCER_URL;

app.use(bodyParser());

app.get('/number', (req, res) => {
    client.query('SELECT numbers from numbers', null, (err, result) => {
        if (err) {
            res.status(500);
            res.send(err.message);
            return;
        }
        res.json({ "numbers": result.rows });
    });

});

app.post('/number', (req, res) => {
    let number = req.body.number;
    client.query(`insert into numbers values('${number}')`, null, (err, number) => {
        if (err) {
            res.status(500);
            res.end();
        } else {
            res.status(201);
            res.end();
        }

    });
});

app.get('/health', (req, res) => {
    res.end();
});

app.get('/sleep', (req, res) => {
    let startTime = Date.now();
    while ((Date.now() - startTime) < delayTime) { }
    res.end();
});

app.get('/', (req, res) => {
    console.log('Recieve a request');
    res.send(`<h1>${SECRET_MESSAGE}</h1>`);
});

client.connect()
    .then(function () {
        client.query('CREATE TABLE IF NOT EXISTS numbers(numbers integer);', (err, result) => {
            if (err) {
                console.log(`Error occur while creating table ${err.message}`);
            } else {
                app.listen(PORT, () => {
                    console.log(`App listening on ${PORT}`);
                    request.post(`${LOAD_BALANCER_URL}/join`, { form: { hostAddress: MY_HOST_ADDRESS } }, (err, res) => {
                        if (err) console.error(err);
                    })
                });
            }
        });

    })
    .catch(function (err) {
        console.log(err);
    })

