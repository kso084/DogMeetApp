const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    age: {
        type: Number,
        required: true,
        min: 18,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 30
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    },
});

UserSchema.pre('save', function (next) {
    bcrypt.hash(this.password, 10, (err, hashedPwd) => {
        if (err) { return next(err) };
        this.password = hashedPwd;
        next();
    });
});

UserSchema.methods.comparePwds = function (pwd, cb) {
    bcrypt.compare(pwd, this.password, (err, isMatch) => {
        if (err) { return cb(err) }
        else if (!isMatch) { return cb(null, isMatch, { message: 'Incorrect password.' }) }
        else { return cb(null, this) };
    });
};

UserSchema.methods.comparePwdsForChangingPwd = function (pwd, cb) {
    bcrypt.compare(pwd, this.password, (err, isMatch) => {
        if (err) { cb(err) }
        else { cb(null, isMatch) };
    });
};



module.exports = mongoose.model("User", UserSchema);