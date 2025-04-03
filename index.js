const express = require('express');       // load express module
const nedb = require("nedb-promises");    // load nedb module

const app = express();                    // init app
const db = nedb.create('users.jsonl');    // init db

app.use(express.static('public'));        // enable static routing to "./public" folder

// automatically decode all requests from JSON and encode all responses into JSON
app.use(express.json());

// create route to get all user records (GET /users)
// use db.find to get the records, then send them
// use .catch(error=>res.send({error})) to catch and send errors
app.get('/users', (req, res) => {
    db.find({})
        .then(records => res.json(records))
        .catch(error => res.send({ error }));
});

// create route to get user record (GET /users/:username)
app.get('/users/:username', (req, res) => {
    const username = req.params.username;
    db.findOne({ username })
        .then(record => {
            if (record) {
                res.json(record);
            } else {
                res.send({ error: 'Username not found.' });
            }
        })
        .catch(error => res.send({ error }));
});

// create route to register user (POST /users)
app.post('/users', (req, res) => {
    const { username, password, email, name } = req.body;
    if (!username || !password || !email || !name) {
        return res.send({ error: 'Missing fields.' });
    }
    db.findOne({ username })
        .then(existingUser => {
            if (existingUser) {
                res.send({ error: 'Username already exists.' });
            } else {
                db.insert({ username, password, email, name })
                    .then(newUser => res.json(newUser))
                    .catch(error => res.send({ error }));
            }
        })
        .catch(error => res.send({ error }));
});

// create route to update user doc (PATCH /users/:username)
app.patch('/users/:username', (req, res) => {
    const username = req.params.username;
    const updates = req.body;
    db.update({ username }, { $set: updates }, { returnUpdatedDocs: true })
        .then(numUpdated => {
            if (numUpdated === 0) {
                res.send({ error: 'Something went wrong.' });
            } else {
                res.send({ ok: true });
            }
        })
        .catch(error => res.send({ error }));
});

// create route to delete user doc (DELETE /users/:username)
app.delete('/users/:username', (req, res) => {
    const username = req.params.username;
    db.remove({ username }, {})
        .then(numRemoved => {
            if (numRemoved === 0) {
                res.send({ error: 'Something went wrong.' });
            } else {
                res.send({ ok: true });
            }
        })
        .catch(error => res.send({ error }));
});


// default route
// app.all('*',(req,res)=>{res.status(404).send('Invalid URL.')});

// start server
app.listen(3000,()=>console.log("Server started on http://localhost:3000"));
