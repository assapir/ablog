'use strict';

const supertest = require(`supertest`);
const sinon = require(`sinon`);
const expect = require(`chai`).expect;
const express = require(`express`);
const mongo = require(`mongo-mock`);
const MongoClient = mongo.MongoClient;

describe(`/User API tests`, function () {
    let app, request;

    beforeEach(async function () {
        app = express();

        const router = require(`../lib/user_control.js`);
        const client = await MongoClient.connect(`mongodb://localhost:27017/`);
        router.UserRouter(app, client);
        request = supertest(app);
    });

    describe(`/add POST`, function () {
        it(`Will add user`, function (done) {
            const username = `SomeUserName`;
            const password = `SomePassword`;

            request.post(`/user/add`)
                .send({ username: username, password: password })
                .expect(200)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.body.result).to.deep.equal({
                        ok: 1,
                        n: 1,
                    });
                    done();
                });
        });

        it(`Will return error json in short username`, function (done) {
            const shortUsername = `s`;
            const password = `SomePassword`;

            request.post(`/user/add`)
                .send({ username: shortUsername, password: password })
                .expect(400)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.text).to.contain(`\\"username\\" length must be at least 5 characters long`);
                    done();
                });
        });

        it(`Will return error json in short password`, function (done) {
            const username = `someUsername`;
            const shortPassword = `pass`;

            request.post(`/user/add`)
                .send({ username: username, password: shortPassword })
                .expect(400)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.text).to.contain(`\\"password\\" length must be at least 8 characters long`);
                    done();
                });
        });

        it(`Will return error json already exist`, function (done) {
            const username = `someUsername`;
            const password = `somePassword`;

            const err = new Error(`error`);
            err.code = 11000;
            request.post(`/user/add`)
                .send({ username: username, password: password })
                .expect(400)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res.text).to.contain(`username already exist`);
                    done();
                });
        });
    });
});