'use strict';

const express = require(`express`);
const app = express();

const port = 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

app.get(`/`, (req, res) => {
    res.sendFile(__dirname + `/html/index.html`);
});

app.all(`*`, (req, res) => {
    res.sendStatus(404);
});

module.exports = app;