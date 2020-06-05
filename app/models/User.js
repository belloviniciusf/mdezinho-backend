const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['surdo', 'da', 'ouvinte'],
        },
        language: {
            type: String,
            required: true,
            enum: ['portugues', 'libras'],
            default: 'libras',
        },
        blocked: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
        },
        token: {
            type: String,
        },
    },
    { timestamps: true }
);

UserSchema.pre('save', function (next) {
    const user = this;

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next(err);

        user.password = hash;
        return next(null);
    });
});

UserSchema.methods.comparePassword = function (passw) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(passw, this.password, (err, isMatch) => {
            if (err) return reject(err);

            return resolve(isMatch);
        });
    });
};

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
