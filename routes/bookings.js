var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');

router.post('/:booking_id/delete', function(req, res, next) {
    Booking.remove({_id:req.body.booking_id});
});

router.post('/create', function(req, res, next) {
    // todo validate day/timeslot/facility, get the current user, and handle errors when saving
    var b = new Booking({
        day: req.body.day,
        timeslot: req.body.timeslot,
        facility: req.body.facility,
        user: null
    });
    b.save();
});

router.get('/', function(req, res, next){
	Booking.find({}, function(err, docs){
		if(!err){
			res.json(docs);
		}else{
			console.log(err);
		}
	})
})

module.exports = router;
