import express from "express";
import joi from "joi";
import { MongoClient } from "mongodb";
import { Users } from './users';

const userRouter = express.Router();

let _users; // we want to always use the same instance (sort of singleton...)
async function getUsersInstance() {
    if (typeof _users !== `undefined`)
        return _users;

    const client = await MongoClient.connect(`mongodb://localhost:27017/`);
    const db = client.db(`site`);
    const collection = db.collection(`users`);
    return _users = new Users(collection);
}


// for parsing POST body
userRouter.use(express.json()); // to support JSON-encoded bodies
userRouter.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

userRouter.post(`/add`, async (req, res) => {
    try {
        const validator = checkScheme(req.body);
        if (validator.error !== null)
            res.status(400).send(JSON.stringify({ error: `Wrong API call: ${validator.error}` }));

        const users = await getUsersInstance();
        const result = await users.addUser(req.body.username, req.body.password);
        if (result.insertedCount > 0)
            res.send(result);
        else
            res.status(500).send(JSON.stringify({ error: `somthing bad happend, db problem` }));
    } catch (err) {
        if (err.code === 11000)
            res.status(400).send(JSON.stringify({ error: `username already exist` }));
        else
            res.status(400).send(JSON.stringify({ error: err }));
    }
});

userRouter.get(`/:username`, async (req, res) => {
    try {
        if (typeof req.params.username === `undefined`)
            throw new Error(`Wrong API call, No username parameter`);

        const users = await getUsersInstance();
        const result = await users.checkUser(req.params.username);
        if (result.length > 0)
            res.status(400).send(JSON.stringify({ message: `found ${result.length} for ${req.params.username}` }));
        else
            throw new Error(`No result yield for ${req.params.username}`);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

userRouter.get(`/delete/:username`, async (req, res) => {
    try {
        if (typeof req.params.username === `undefined`)
            throw new Error(`Wrong API call, No username parameter`);
        
        const users = await getUsersInstance();
        const result = await users.deleteUser(req.params.username);
        if (result.result.n > 0)
            res.status(400).send(JSON.stringify({ message: `deleted ${result.result.n} for ${req.params.username}` }));
        else
            throw new Error(`No result yield for ${req.params.username}`);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

userRouter.post(`/password`, async (req, res) => {
    try {
        const validator = checkPassword(req.body);
        if (validator.error !== null)
            throw new Error(`New password isn't good enought`);

        const users = await getUsersInstance();
        const result = await users.changePassword(req.body.username, req.body.password);
        res.send(result);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

userRouter.post(`/username`, async (req, res) => {
    try {
        const validator = checkUsername(req.body);
        if (validator.error !== null)
            throw new Error(`New useranem isn't good enought`);

        const users = await getUsersInstance();
        const result = await users.changeUsername(req.body.oldUsername, req.body.newUsername);
        res.send(result);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

function checkUsername(reqBody) {
    const schema = joi.object().keys({
        username: joi.string().alphanum().min(5).required(),
    });

    return joi.validate(reqBody, schema, { stripUnknown: true });
}

function checkPassword(reqBody) {
    const schema = joi.object().keys({
        password: joi.string().min(8).required(),
    });

    return joi.validate(reqBody, schema, { stripUnknown: true });
}

function checkScheme(reqBody) {
    const usernameValidator = checkUsername(reqBody);
    const passwordValidator = checkPassword(reqBody);
    if (usernameValidator.error === null && passwordValidator.error === null)
        return usernameValidator; // so well get the full object to check
    else if (usernameValidator.error !== null)
        return usernameValidator;
    else if (passwordValidator.error !== null)
        return passwordValidator;
}

export { userRouter };