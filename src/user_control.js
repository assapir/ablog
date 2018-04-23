import express from "express";
import { Users } from './users';

const userRouter = express.Router();

userRouter.get(`/add/`, async function(req, res) {
    try {
        const users = new Users();
        const query = req.query;
        if (typeof query.userName !== `undefined` && typeof query.password !== `undefined`)
            res.send(await users.addUser(query.userName, query.password));
        else
            res.send( {error: `Wrong API call`});
    } catch (error) {
        res.send({ error: error.message });
    }
});

export { userRouter };