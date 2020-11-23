const express = require('express');
const dummyRouter = require('./routes/dummyRoute');

const app = express();

app.use(express.json());

app.use('/api/v1/dummy', dummyRouter);

module.exports = app;
