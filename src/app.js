import express from "express";

import { UserRouter } from "./user_control";
const app = express();

const port = 3000;

app.use(`/public`, express.static(`${__dirname}/public`));

+UserRouter(app);

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