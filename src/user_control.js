import express from "express";
import joi from "joi";
import { MongoClient } from "mongodb";
import { Users } from './users';

let _client;
let _users; // we want to always use the same instance (sort of singleton...)
async function getUsersInstance() {
    if (typeof _users !== `undefined`)
        return _users;

    if (typeof _client === `undefined`) {
        const dbPath = `mongodb://localhost:27017/`;
        _client = await MongoClient.connect(dbPath);
    }

    const db = _client.db(`site`);
    const collection = db.collection(`users`);
    return _users = new Users(collection);
}

export function UserRouter(app, client) {
    _client = client; // this allow to inject db mock for tests
    const router = express.Router();
    app.use(`/user`, router);

    // middlewares for parsing POST body
    router.use(express.json()); // to support JSON-encoded bodies
    router.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

    router.post(`/add`, async (req, res, next) => {
        try {
            const validator = checkScheme(req.body);
            if (validator.error !== null) {
                let err = new Error(`Wrong API call: ${validator.error}`);
                err.statusCode = 400;
                throw err;
            }

            const users = await getUsersInstance();
            const result = await users.addUser(req.body.username, req.body.password);
            if (result.insertedCount > 0)
                res.status(200).json(result);
        } catch (err) {
            if (err.code === 11000) {
                let error = new Error(`username already exist`);
                error.statusCode = 400;
                next(error);
            }
            else
                next(err);
        }
    });

    router.get(`/:username`, async (req, res, next) => {
        try {
            const users = await getUsersInstance();
            const result = await users.checkUser(req.params.username);
            if (result.length > 0)
                res.status(200).json({ message: `found ${result.length} for ${req.params.username}` });
            else {
                let err = new Error(`No result yield for ${req.params.username}`);
                err.statusCode = 404;
                throw err;
            }
        } catch (err) {
            next(err);
        }
    });

    router.get(`/delete/:username`, async (req, res, next) => {
        try {
            const users = await getUsersInstance();
            const result = await users.deleteUser(req.params.username);
            if (result.result.n > 0)
                res.status(200).json({ message: `deleted ${result.result.n} for ${req.params.username}` });
            else {
                let err = new Error(`No result yield for ${req.params.username}`);
                err.statusCode = 404;
                throw err;
            }
        } catch (err) {
            next(err);
        }
    });

    router.post(`/password`, async (req, res, next) => {
        try {
            const validator = checkPassword(req.body);
            if (validator.error !== null) {
                const err = new Error(`New password isn't good enought`);
                err.statusCode = 404;
                throw err;
            }

            const users = await getUsersInstance();
            const result = await users.changePassword(req.body.username, req.body.password);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    router.post(`/username`, async (req, res, next) => {
        try {
            const validator = checkUsername(req.body);
            if (validator.error !== null) {
                const err = new Error(`New username isn't good enought`);
                err.statusCode = 404;
                throw err;
            }

            const users = await getUsersInstance();
            const result = await users.changeUsername(req.body.oldUsername, req.body.username);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    });

    // router error handler
    router.use((err, req, res, next) => {
        res.status(typeof err.statusCode === `undefined` ? 500 : err.statusCode).json({ error: err.message });
        next();
    });
}



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