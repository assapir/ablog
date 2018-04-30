import express from "express";
import { MongoClient } from "mongodb";
import { UserRouter } from "./user_control";
const app = express();

const port = 3000;
const dbPath = `mongodb://localhost:27017/`;

app.use(`/public`, express.static(`${__dirname}/public`));

app.client = async () => await MongoClient.connect(dbPath);
UserRouter(app, app.client);

app.get(`/`, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.all(`*`, (req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

export { app };