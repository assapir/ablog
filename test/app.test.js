'use strict';

const request = require(`supertest`);
const expect = require(`chai`).expect;
const app = require(`../lib/app`).app;

describe(`Routing tests`, function () {
    describe(`GET`, function () {
        it(`Will return 200 on /`, function (done) {
            request(app)
                .get(`/`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    done();
                });
        });

        it(`Will return 404 on not found`, function (done) {
            request(app)
                .get(`/blabla`)
                .end((err, res) => {
                    expect(res.status).to.be.equal(404);
                    done();
                });
        });
    });

    describe(`POST`, function () {
        it(`Will always return 404`, function (done) {
            request(app)
                .post(`/`)
                .end((err, res) => {
                    expect(res.status).to.be.equal(404);
                    done();
                });
        });
    });
});