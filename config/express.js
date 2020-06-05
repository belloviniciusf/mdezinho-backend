const express = require('express');
const morgan = require('morgan');
const load = require('express-load');
const bodyParser = require('body-parser');
require('./database')();
const cors = require('cors');

module.exports = () => {
    const app = express();
    const port = process.env.PORT || 3000;
    app.set('port', port);

    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );

    app.use(cors({}));

    app.get('/', (req, res) => res.redirect('https://google.com.br'));

    load('schemas', { cwd: 'app', verbose: true })
        .then('controllers')
        .then('routes')
        .into(app, (err) => {
            if (err) throw err.name;
        });

    app.use((err, req, res, next) => {
        if (!err) return next();

        console.error(err.stack);
        return res.status(500).json({
            error: err.name,
        });
    });

    app.use((req, res) => {
        res.status(404).json({
            url: req.originalUrl,
            error: 'Not Found',
        });
    });

    return app;
};
