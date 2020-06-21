const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();


const {
    Reflection
} = require('../models');
const {
    app,
    runServer,
    closeServer
} = require('../server');
const {
    TEST_DATABASE_URL
} = require('../config');

chai.use(chaiHttp);


function seedReflectionData() {
    console.info('seeding reflection data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateReflectionData());
    }
    // this will return a promise
    return Reflection.insertMany(seedData);
}

function generateReflectionData() {
    return {
        date: faker.date(),
        location: faker.address(),
        mood: faker.Lorem.words(),
        text: faker.Lorem.paragraph()
    }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Reflections API resource', function () {

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedReflectionData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    })
});

describe('index page', function () {
    it('exists', function (done) {
        chai.request(app)
            .get('/')
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.html;
                done();
            });
    });
});


describe('GET endpoint', function () {
    it('should retrieve all reflections', function () {
        let res;
        return chai.request(app)
            .get('/reflections')
            .then(function (_res) {
                res = _res;
                res.should.have.status(200);
                res.body.reflections.should.have.length.of.at.least(1);
                return Reflection.count();
            })
            .then(function (count) {
                res.body.reflections.should.have.length.of(count);
            });
    });

    it('should retrieve reflection by id', function () {
        return Reflection
            .findOne()
            .then(function (reflection) {
                reflectionID = reflection.id;

                return chai.request(app)
                    .get('/restaurants/reflectionID')
                    .then(function (res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.reflections.should.have.length.of.at.least(1);
                    });
            });
    });
});

describe('POST endpoint', function () {
    it('should post a new reflection', function () {
        const newReflection = generateReflectionData();

        return chai.request(app)
            .post('restaurants/new')
            .send(newReflection)
            .then(function (res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'date', 'location', 'mood', 'text');
                res.body.date.should.equal(newReflection.date);
                res.body.id.should.not.be.null;
                res.body.location.should.equal(newReflection.location);
                res.body.mood.should.equal(newReflection.mood);
                res.body.text.should.equal(newReflection.text);
                return Reflection.findById(res.body.id);
            })
            .then(function (reflection) {
                reflection.date.should.equal(newReflection.date);
                reflection.location.should.equal(newReflection.location);
                reflection.mood.should.equal(newReflection.mood);
                reflection.text.should.equal(newReflection.text);
            });
    });
});

describe('PUT endpoint', function () {
    it('should update reflection', function () {
        const updateData = {
            date: '09 / 25 / 2017',
            mood: 'sad'
        };

        return Reflection
            .findOne()
            .then(function (reflection) {
                updateData.id = reflection.id;

                return chai.request(app)
                    .put(`/reflections/${reflection.id}`)
                    .send(updateData)
            })
            .then(function (res) {
                res.should.have.status(204);

                return Reflection.findById(updateData.id);
            })
            .then(function (reflection) {
                reflection.date.should.equal(updateData.date);
                reflection.mood.should.equal(updateData.date);
            });
    });
});

describe('DELETE endpoint', function () {
    it('should delete a reflection by id', function () {
        let reflection;

        return Reflection
            .findOne()
            .then(function (_reflection) {
                reflection = _reflection;
                return chai.request(app)
                    .delete(`/reflections/${reflection.id}`);
            })
            .then(function (res) {
                res.should.have.status(204);
                return Reflection.findById(reflection.id);
            })
            .then(function (_reflection) {
                should.not.exist(_reflection);
            });
    });
});
