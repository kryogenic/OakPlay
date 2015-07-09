var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');
var User = require('../models/user');

router.post('/delete', User.isAuthenticated, function(req, res, next) {
    Booking.findOne({day: req.body.day, timeslot: req.body.timeslot, facility: req.body.facility, user:req.user._id}).remove().exec();
    res.json({success:true});
});

router.post('/create', User.isAuthenticated, function(req, res, next) {
    console.log(req);
    var b = new Booking({
        day: req.body.day,
        timeslot: req.body.timeslot,
        facility: req.body.facility,
        user: req.user._id,
        res_id: 1,
        duration: 1
    });
    authorize_user_booking(req.user, b, function(r) {
        console.log(r)
        if(r[0] == true && r[1] == true && r[2] == true) {
            console.log(r);
            b.save(function(err) {
                if(err)
                    console.log(err);
            });
            res.json({success:true});
        } else {
            res.json({success:false,message:"You cannot create this booking"});
        }
    });
});

router.get('/', function(req, res, next){
	Booking.find({}, function(err, docs){
		if(!err){
			res.json(docs);
		}else{
			console.log(err);
		}
	})
});

/* not used currently
var weekdays = new Array(7);
weekdays[0] = "Sunday";
weekdays[1] = "Monday";
weekdays[2] = "Tuesday";
weekdays[3] = "Wednesday";
weekdays[4] = "Thursday";
weekdays[5] = "Friday";
weekdays[6] = "Saturday";
function get_date(booking) {
    var now = Date.now();
    var day = weekdays.indexOf(booking.day);
    var hour = 8 + Math.floor(booking.timeslot / 2);
    var minute = booking.timeslot % 2 == 0 ? 0 : 30;
    return new Date(Date.parse(String.format("%d-%d-%dT%d:%d:00", now.getYear(), now.getMonth(), day, hour, minute)));
}*/
function authorize_user_booking(user, booking, callback) {
    var timeslot_open = new Promise(function(resolve) {
        Booking.count({day:booking.day, timeslot:booking.timeslot, facility:booking.facility}, function(err, count) {
            if(!err){
                resolve(count == 0);
            }else{
                console.log(err);
                resolve(false);
            }
        });
    });
    var max_weekly_reservations = 15;
    var enforce_reservation_count = new Promise(function(resolve) {
        Booking.count({user:user, facility:booking.facility}, function(err, count) {
            if(!err){
                resolve(count < max_weekly_reservations);
            }else{
                console.log(err);
                resolve(false);
            }
        });
    });
    var enforce_one_per_timeslot = new Promise(function(resolve) {
        Booking.count({user:user, day:booking.day, timeslot:booking.timeslot}, function(err, count) {
            if(!err){
                resolve(count == 0);
            }else{
                console.log(err);
                resolve(false);
            }
        });
    });
    Promise.all([timeslot_open, enforce_reservation_count, enforce_one_per_timeslot]).then(callback);
}

module.exports = router;
