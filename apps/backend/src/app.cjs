const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRouter = require('./features');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'EcoCollect API' }));
app.use('/api', apiRouter);

module.exports = app;
