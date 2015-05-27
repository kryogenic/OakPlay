var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');

router.get('/', function(req, res, next) {
    Booking.findOne({}, function(err, booking) {
        req.params.facility_id = booking.facility;
        next();
    });
}, printBookings);

router.get('/:facility_id', printBookings);

function printBookings(req, res) {
    Booking.find({ facility: req.params.facility_id }, function (err, bookings) {
        if(err)
            res.send(err);
        res.json(bookings);
    });
}

module.exports = router;