'use strict';

const chai = require(`chai`);
const expect = chai.expect;
const chaiAsPromised = require(`chai-as-promised`);
const sinon = require(`sinon`);
const mongo = require(`mongo-mock`);
const MongoClient = mongo.MongoClient;
const Users = require(`../lib/users`).Users;

chai.use(chaiAsPromised);
mongo.max_delay = 0; // not pretend async delay

let collectionMock;
beforeEach(async function () {
    const client = await MongoClient.connect(`mongodb://localhost:27017/`);
    const db = client.db(`site`);
    collectionMock = db.collection(`users`);
});

describe(`Users class`, function () {
    describe(`addUser`, function () {
        it(`Will call db insert`, async function () {
            const username = `thisIsUsername`;
            const password = `ThisIsPassword`;

            sinon.spy(collectionMock, `insert`);

            const users = new Users(collectionMock);
            await users.addUser(username, password);
            expect(collectionMock.insert.calledWithExactly({ username: username, password: password })).to.be.true;
            collectionMock.insert.restore(); // Unwraps the spy
        });

        it(`Will will throw with error code`, async function () {
            const username = `thisIsUsername`;
            const password = `ThisIsPassword`;

            const err = new Error(`error`);
            err.code = 12;
            sinon.stub(collectionMock, `insert`).rejects(err);
            
            const users = new Users(collectionMock);
            expect(users.addUser(username, password))
            .to.eventually.be.rejectedWith(`Unable to add ${username} - ${err.message}`)
            .and.be.an.instanceOf(Error)
            .and.have.property(`code`, err.code);

            collectionMock.insert.restore(); // Unwraps the spy
        });
    });

    describe(`checkUser`, function () {
        it(`Will call db find`, async function () {
            const username = `thisIsUsername`;

            sinon.spy(collectionMock, `find`);

            const users = new Users(collectionMock);
            await users.checkUser(username);
            expect(collectionMock.find.calledWith({ username: username })).to.be.true;
            collectionMock.find.restore(); // Unwraps the spy
        });

        it(`Will get username triming`, async function () {
            const username = `thisIsUsername       `;

            sinon.spy(collectionMock, `find`);

            const users = new Users(collectionMock);
            await users.checkUser(username);
            expect(collectionMock.find.calledWith({ username: username.trim() })).to.be.true;
            collectionMock.find.restore(); // Unwraps the spy
        });
    });

    describe(`changeUsername`, function () {
        it(`Will call db update`, async function () {
            const username = `thisIsUsername`;
            const oldUsername = `oldUsername`;

            sinon.spy(collectionMock, `update`);

            const users = new Users(collectionMock);
            await users.changeUsername(oldUsername, username);
            expect(collectionMock.update.calledWith({ username: oldUsername },
                { $set: { username: username } },
                { "upsert": false })).to.be.true;
            collectionMock.update.restore(); // Unwraps the spy
        });
    });

    describe(`changePassword`, function () {
        it(`Will call db update`, async function () {
            const username = `thisIsUsername`;
            const password = `ThisIsPassword`;

            sinon.spy(collectionMock, `update`);

            const users = new Users(collectionMock);
            await users.changePassword(username, password);
            expect(collectionMock.update.calledWith({ username: username },
                { $set: { password: password } },
                { "upsert": false })).to.be.true;
            collectionMock.update.restore(); // Unwraps the spy
        });
    });
    
    describe(`deleteUser`, function () {
        it(`Will call db remove`, async function () {
            const username = `thisIsUsername`;

            sinon.spy(collectionMock, `remove`);

            const users = new Users(collectionMock);
            await users.deleteUser(username);
            expect(collectionMock.remove.calledWithExactly({ username: username })).to.be.true;
            collectionMock.remove.restore(); // Unwraps the spy
        });
    });
});
