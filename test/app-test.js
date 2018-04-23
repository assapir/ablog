'use strict';

const request = require(`chai`).request,
    expect = require(`chai`).expect,
    app = require(`../lib/app`);

describe(`Routing tests`, function() {
    describe(`GET`, function() {
        it(`Will return 200 on /`, function(done){
            request(`localhost:3000`)
            .get(`/`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });

        it(`Will retun 404 on not found`, function(done){
            request(app)
            .get(`/blabla`)
            .end((err, res) => {
                expect(res.status).to.be.equal(404);
                done();
            });
        });
    });
    
    describe(`POST`, function(){
        it(`Will always return 404`, function(done){
            request(app)
            .post(`/`)
            .end((err, res) => {
                expect(res.status).to.be.equal(404);
                done();
            });
        });
    });
});