'use strict';

const expect = require(`chai`).expect;
const MongoClient = require(`mongodb`).MongoClient;
const sinon = require(`sinon`);
const Users = require(`../lib/users`).Users;

describe(`Users class`, function() {
    it(`Will connect to db from init`, async function() {
        const dbMock = sinon.mock(MongoClient, `connect`);
        const rsvObj = { resolve: true };
        dbMock.expects(`connect`).once().withExactArgs(`mongodb://localhost:27017/users`).resolves(rsvObj);
        const users = new Users();
        await users.init(`users`);
        dbMock.verify();
        expect(users.db).to.equals(rsvObj);
    });
    it(`init will throw on faliure`, async function() {
        const dbMock = sinon.mock(MongoClient, `connect`);
        dbMock.expects(`connect`).once().rejects(Error);
        const users = new Users();
        try {
            await users.init(`users`);
        } catch (Error) {
            expect();
        }
        dbMock.verify();
    });
});
