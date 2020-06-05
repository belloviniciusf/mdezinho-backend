const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const QuestionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
        },
        videoRef: {
            type: String,
        },
        weight: {
            type: Number,
        },
        last: {
            type: Boolean,
        },
        type: {
            type: Number,
        },
        options: [
            {
                type: Object,
            },
        ],
    },
    { timestamps: true }
);

QuestionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Question', QuestionSchema);
