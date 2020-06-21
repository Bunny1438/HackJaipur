require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');

mongoose.Promise = global.Promise;

const {
    DATABASE_URL,
    PORT
} = require('./config');
const {
    Reflection
} = require('./models');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());

app.get("/", (request, response) => {
    response.sendFile(__dirname + '/public/index.html');
});

// CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
        return res.send(204);
    }
    next();
});

//retrieve all reflections from the database
app.get('/reflections', (req, res) => {
    Reflection
        .find()
        .then(reflections => {
            res.json(reflections);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went wrong'
            });
        })
});

//retrieve reflection by id
app.get('/reflections/:id', (req, res) => {
    Reflection
        .findById(req.params.id)
        .then(reflections => res.json(reflections))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went wrong'
            });
        });
});

//post a new reflection

app.post('/reflections/new', (req, res) => {
    console.log(req.body);
    const requiredFields = ['date', 'location', 'mood', 'text'];
    for (let i = 0; i < requiredFields.lenth; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Reflection
        .create({
            location: req.body.location,
            mood: req.body.mood,
            text: req.body.text,
            date: req.body.date,
        })
        .then(reflection => res.status(201).json(reflection))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong'
            });
        });
});

//update a reflection

app.put('/reflections/:id', jsonParser, (req, res) => {

    const updated = {};
    const updateableFields = ['date', 'location', 'mood', 'text'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    Reflection
        .findByIdAndUpdate(req.params.id, {
            $set: updated
        }, {
            new: true
        })
        .then(updatedReflection => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Something went wrong'
        }));
});

//delete a reflection

app.delete('/reflections/:id', (req, res) => {
    Reflection
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({
                message: 'success'
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong'
            });
        });
})

app.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});


let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {
    runServer,
    app,
    closeServer
};
