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
        if (validator.error === null) {
            const users = await getUsersInstance();
            const result = await users.addUser(req.body.username, req.body.password);
            if (result.insertedCount > 0) // result OK and nothing is not modified
                res.send(result);
            else
                res.send(JSON.stringify({ error: `somthing bad happend, db problem` }));
        } else
            res.send(JSON.stringify({ error: `Wrong API call: ${validator.error}` }));
    } catch (err) {
        if (err.code === 11000)
            res.send(JSON.stringify({ error: `username already exist` }));
        else
            res.send(JSON.stringify({ error: err }));
    }
});

userRouter.get(`/check`, async (req, res) => {
    try {
        const users = await getUsersInstance();
        if (typeof req.query.username === `undefined`)
            throw new Error(`Wrong API call, No username parameter`);
        const result = await users.checkUser(req.query.username);
        if (result.length > 0)
            res.send(JSON.stringify({ message: `found ${result.length} for ${req.query.username}` }));
        else
            throw new Error(`No result yield for ${req.query.username}`);
    } catch (err) {
        res.send({ error: err.message });
    }
});


function checkScheme(reqBody) {
    const schema = joi.object().keys({
        username: joi.string().alphanum().min(5).required(),
        password: joi.string().min(8).required(),
        email: joi.string().email(),
    }).with(`username`, `password`).without(`username`, `email`);

    return joi.validate(reqBody, schema);
}

export { userRouter };