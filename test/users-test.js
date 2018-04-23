'use strict';

const expect = require(`chai`).expect;
const mongo = require(`mongodb`);
const sinon = require(`sinon`);
const Users = require(`../lib/users`).Users;

describe(`Users class`, function() {
    describe(`Init function`, function() {
        it(`Will connect to db`, async function() {
            const dbMock = sinon.mock(mongo.Db, `collection`);
            const clientMock = sinon.mock(new mongo.MongoClient(), `db`);
            clientMock.expects(`db`).once().returns(dbMock);
            const mongoMock = sinon.mock(mongo.MongoClient, `connect`);
            mongoMock.expects(`connect`)
            .once()
            .withExactArgs(`mongodb://localhost:27017/`)
            .resolves(clientMock);
            
            const users = new Users();
            await users.init();
            clientMock.verify();
            mongoMock.verify();
            expect(users.isInit).to.equals(true);
        });

        it(`Will throw on faliure`, async function() {
            const dbMock = sinon.mock(mongo.MongoClient, `connect`);
            dbMock.expects(`connect`).once().rejects(Error);
            const users = new Users();
            try {
                await users.init();
            } catch (Error) {
                expect();
            }
            dbMock.verify();
        });
    });
});
