import express from "express";
const app = express();

const port = 3000;

app.use(`/public`, express.static(`${__dirname}/public`));

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

app.get(`/`, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.all(`*`, (req, res) => {
    res.sendStatus(404);
});

module.exports = app;