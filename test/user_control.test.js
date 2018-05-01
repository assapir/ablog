'use strict';

const supertest = require(`supertest`);
const expect = require(`chai`).expect;
const express = require(`express`);
const mongo = require(`mongo-mock`);
const MongoClient = mongo.MongoClient;

mongo.max_delay = 0; // not pretend async delay

async function CleanDB(client) {
    const db = client.db(`site`);
    const collection = db.collection(`users`);
    await collection.remove({});
}

async function GetUserFromDB(client, user) {
    const db = client.db(`site`);
    const collection = db.collection(`users`);
    const res = await collection.find({ username: user });
    return res.toArray();
}

describe(`/User API tests`, async function () {
    let app, request, client;

    beforeEach(async function () {
        app = express();

        const router = require(`../lib/user_control.js`);
        client = await MongoClient.connect(`mongodb://localhost:27017/`);
        await CleanDB(client);

        router.UserRouter(app, client);
        request = supertest(app);
    });

    describe(`/add POST`, function () {
        it(`Will add user`, async function () {
            const username = `SomeUsername`;
            const password = `SomePassword`;

            const res = await request.post(`/user/add`)
                .send({ username: username, password: password }).expect(200);
            expect(res.body.result).to.deep.equal({
                ok: 1,
                n: 1,
            });
            const dbRes = await GetUserFromDB(client, username);
            expect(dbRes).to.have.a.lengthOf(1);
            expect(dbRes[0].username).to.be.equal(username);
        });

        it(`Will return error json in short username`, async function () {
            const shortUsername = `s`;
            const password = `SomePassword`;

            const res = await request.post(`/user/add`)
                .send({ username: shortUsername, password: password })
                .expect(400);
            expect(res.text).to.contain(`\\"username\\" length must be at least 5 characters long`);
        });

        it(`Will return error json in short password`, async function () {
            const username = `SomeUsername`;
            const shortPassword = `pass`;

            const res = await request.post(`/user/add`)
                .send({ username: username, password: shortPassword }).expect(400);
            expect(res.text).to.contain(`\\"password\\" length must be at least 8 characters long`);
        });

        it(`Will return error on double entrence`, async function () {
            const username = `SomeUsername`;
            const password = `somePassword`;

            await request.post(`/user/add`)
                .send({ username: username, password: `someOtherPassword` }).expect(200);

            const res = await request.post(`/user/add`)
                .send({ username: username, password: password }).expect(400);
            expect(res.text).to.contain(`username already exist`);
        });
    });

    describe(`/:username GET`, async function () {
        it(`Will return found for found user`, async function () {
            const username = `SomeUsername`;
            const password = `somePassword`;

            await request.post(`/user/add`)
                .send({ username: username, password: password }).expect(200);

            const res = await request.get(`/user/${username}`).expect(200);
            expect(res.text).to.contain(`found 1 for ${username}`);
        });

        it(`Will return 404 when not found`, async function () {
            const username = `NoSuchUsername`;

            const res = await request.get(`/user/${username}`).expect(404);
            expect(res.text).to.contain(`No result yield for ${username}`);
        });
    });

    describe(`/delete/:username GET`, async function () {
        it(`Will delete user`, async function () {
            const username = `SomeUsername`;
            const password = `somePassword`;

            await request.post(`/user/add`)
                .send({ username: username, password: password }).expect(200);

            const res = await request.get(`/user/delete/${username}`).expect(200);
            expect(res.text).to.contain(`deleted 1 for ${username}`);
            const dbRes = await GetUserFromDB(client, username);
            expect(dbRes).to.have.a.lengthOf(0);
        });

        it(`Will return 404 when not such user`, async function () {
            const username = `NoSuchUsername`;

            const res = await request.get(`/user/delete/${username}`).expect(404);
            expect(res.text).to.contain(`No result yield for ${username}`);
        });
    });

    describe(`/password POST`, async function () {
        it(`Will change user password`, async function () {
            const username = `SomeUsername`;
            const password = `somePassword`;
            const newPassword = `someNewPassword`;

            await request.post(`/user/add`)
                .send({ username: username, password: password }).expect(200);

            const res = await request.post(`/user/password`)
                .send({ username: username, password: newPassword }).expect(200);
            expect(res.body.n).to.be.equal(1);
            const dbRes = await GetUserFromDB(client, username);
            expect(dbRes).to.have.a.lengthOf(1);
            expect(dbRes[0].password).to.be.equal(newPassword);
        });

        it(`Will fail if new password isn't passing validation`, async function () {
            const username = `SomeUsername`;
            const password = `somePassword`;
            const newPassword = `s`;

            await request.post(`/user/add`)
                .send({ username: username, password: password }).expect(200);

            const res = await request.post(`/user/password`)
                .send({ username: username, password: newPassword }).expect(404);
            expect(res.text).to.contain(`New password isn't good enought`);

            const dbRes = await GetUserFromDB(client, username);
            expect(dbRes).to.have.a.lengthOf(1);
            expect(dbRes[0].password).to.be.equal(password);
        });
    });

    describe(`/username POST`, async function () {
        it(`Will change user username`, async function () {
            const oldUsername = `SomeUsername`;
            const username = `someNewUsername`;
            const password = `somePassword`;

            await request.post(`/user/add`)
                .send({ username: oldUsername, password: password }).expect(200);

            const res = await request.post(`/user/username`)
                .send({ oldUsername: oldUsername, username: username }).expect(200);
            expect(res.body.n).to.be.equal(1);

            let dbRes = await GetUserFromDB(client, oldUsername);
            expect(dbRes).to.have.a.lengthOf(0);

            dbRes = await GetUserFromDB(client, username);
            expect(dbRes).to.have.a.lengthOf(1);
            expect(dbRes[0].username).to.be.equal(username);
        });

        it(`Will fail if new username isn't passing validation`, async function () {
            const oldUsername = `SomeUsername`;
            const username = `user`;
            const password = `somePassword`;

            await request.post(`/user/add`)
                .send({ username: oldUsername, password: password }).expect(200);

            const res = await request.post(`/user/username`)
                .send({ oldUsername: oldUsername, username: username }).expect(404);
            expect(res.text).to.contain(`New username isn't good enought`);

            let dbRes = await GetUserFromDB(client, oldUsername);
            expect(dbRes).to.have.a.lengthOf(1);
            expect(dbRes[0].username).to.be.equal(oldUsername);

            dbRes = await GetUserFromDB(client, username);
            expect(dbRes).to.have.a.lengthOf(0);
        });
    });
});