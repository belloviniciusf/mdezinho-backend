const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const AnswerSchema = new mongoose.Schema(
    {
        questionId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'Question',
        },
        value: Number,
        notAnswered: {
            type: Boolean,
            default: false,
        },
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
    },
    { timestamps: true }
);

AnswerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Answer', AnswerSchema);
