var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username:     { type: String, required: true, index: { unique: true } },
    first_name:   { type: String, required: false },
    last_name:    { type: String, required: false },
    password:     { type: String, required: true, index: true },
    email:        { type: String, required: true, index: true },
    date_joined:  { type: Date, required: true, index: true },
    info:         { type: String, select: false }
});

module.exports = mongoose.model('User', UserSchema);
