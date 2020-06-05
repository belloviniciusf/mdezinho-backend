const mongoose = require('mongoose');

module.exports = () => {
    function connect() {
        mongoose.connect(process.env.NODE_ENV == 'development'?
            process.env.MONGO_URL: process.env.MONGO_URL_PROD, {
            useNewUrlParser: true,
            useFindAndModify: true,
        });
    }

    connect();
};
