var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username:     { type: String, required: true, index: { unique: true } },
    first_name:   { type: String, required: false },
    last_name:    { type: String, required: false },
    password:     { type: String, required: true, index: true },
    email:        { type: String, required: true, index: true },
    date_joined:  { type: Date, required: true, index: true, default: Date.now },
    info:         { type: String, select: false },
    admin:        { type: Boolean, required: true, index: true, default: false}
});

var model = mongoose.model('User', UserSchema);
model.isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/users/login');
}

module.exports = model;
