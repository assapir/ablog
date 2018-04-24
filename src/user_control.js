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
    collection.ensureIndex({ username: 1 }, { "unique": 1 });
    return _users = new Users(collection);
}


// for parsing POST body
userRouter.use(express.json()); // to support JSON-encoded bodies
userRouter.use(express.urlencoded()); // to support URL-encoded bodies

userRouter.post(`/add`, async function(req, res) {
    try {
        const validator = checkScheme(req.body);
        if (validator.error === null) {
            const db = await getUsersInstance();
            const dbResult = await db.addUser(req.body.username, req.body.password);
            if (dbResult.result.ok && dbResult.result.n === 1) // result OK and nothing is not modified
                res.send(dbResult);
            else if (dbResult.result.n === 0)
                res.send({ error: `username already exist` });
            else
                res.send({ error: `somthing bad happend, db problem` });
        } else
            res.send({ error: `Wrong API call: ${validator.error}` });
    } catch (error) {
        res.send({ error: error.message });
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