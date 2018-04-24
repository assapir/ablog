'use strict';

const expect = require(`chai`).expect;
const sinon = require(`sinon`);
const MongoClient = require(`mongo-mock`).MongoClient;
const Users = require(`../lib/users`).Users;

describe(`Users class`, function() {
    describe(`addUser`, function() {
        it(`Will call db insert`, async function() {
            const username = `username`;
            const password = `password`;

            const client = await MongoClient.connect(`mongodb://localhost:27017/`);
            const db = client.db(`site`);
            const collection = db.collection(`users`);

            const collectionMock = sinon.mock(collection, `insert`);
            collectionMock.expects(`insert`)
                .once()
                .withExactArgs({ username: username, password: password })
                .resolves({ success: true });

            const users = new Users(collectionMock);
            const result = await users.addUser(username, password);
            collectionMock.verify();
            expect(result.sucess).to.equals(true);
        });
    });
});
