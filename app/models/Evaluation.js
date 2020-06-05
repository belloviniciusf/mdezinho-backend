const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const EvaluationSchema = new mongoose.Schema(
    {
        positiveComment: String,
        negativeComment: String,
        userId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'User',
        },
        tvShowId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'TVShow',
        },
        insufficientAnswers: {
            type: Boolean,
            default: false,
        },
        values: [
            {
                type: Object,
            },
        ],
    },
    { timestamps: true }
);

EvaluationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Evaluation', EvaluationSchema);
