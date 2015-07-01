var mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
    day:      { type: String, required: true, index: true },
    res_id:   { type: Number, required: true, index: { unique: true } },
    timeslot: { type: Number, required: true, index: true },
    duration: { type: Number, required: true, index: true },
    facility: { type: mongoose.Schema.ObjectId, ref: 'Facility', required: true, index: true },
    user:     { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true }
});

module.exports = mongoose.model('Booking', BookingSchema);
