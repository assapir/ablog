'use strict';

const expect = require(`chai`).expect;
const sinon = require(`sinon`);
const MongoClient = require(`mongo-mock`).MongoClient;
const Users = require(`../lib/users`).Users;

let collectionMock;
beforeEach(async function() {
    const client = await MongoClient.connect(`mongodb://localhost:27017/`);
    const db = client.db(`site`);
    collectionMock = db.collection(`users`);
});

describe(`Users class`, function() {
    describe(`addUser`, function() {
        it(`Will call db insert`, async function() {
            const username = `thisIsUserName`;
            const password = `ThisIsPassword`;

            sinon.spy(collectionMock, `insert`);
            
            const users = new Users(collectionMock);
            await users.addUser(username, password);
            expect(collectionMock.insert.calledWithExactly({ username: username, password: password }));
            collectionMock.insert.restore(); // Unwraps the spy
        });
    });
});
