const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const TVShowSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        broadcaster: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        hour: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

TVShowSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('TVShow', TVShowSchema);
