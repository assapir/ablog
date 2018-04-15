'use strict';

const request = require(`supertest`),
    expect = require(`chai`).expect,
    app = require(`../lib/app`);

describe(`Routing tests`, function() {
    describe(`GET`, function() {
        it(`Will return 200 on /`, function(done){
            request(app)
            .get(`/`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it(`Will retun 404 on not found`, function(done){
            request(app)
            .get(`/blabla`)
            .expect(200)
            .end((err, res) => {
                expect(res.status).to.equal(404);
                done();
            });
        });
    });
});