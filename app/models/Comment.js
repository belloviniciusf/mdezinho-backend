const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { Schema } = mongoose;

const CommentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: 'User',
        }        
    },
    { timestamps: true }
);

CommentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Comment', CommentSchema);
