import express from "express";
import { userRouter } from "./user_control";
const app = express();

const port = 3000;

app.use(`/public`, express.static(`${__dirname}/public`));

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

app.use(`/user`, userRouter);

app.get(`/`, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.all(`*`, (req, res) => {
    res.sendStatus(404);
});

export { app };