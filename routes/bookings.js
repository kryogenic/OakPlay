var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');
var User = require('../models/user');

router.post('/:booking_id/delete', function(req, res, next) {
    Booking.remove({_id:req.body.booking_id});
});

router.post('/create', User.isAuthenticated, function(req, res, next) {
    console.log(req.user);
    var b = new Booking({
        day: req.body.day,
        timeslot: req.body.timeslot,
        facility: req.body.facility,
        user: req.user._id,
        res_id: 1,
        duration: 1
    });
    can_book(b, function(r) {
        if(r[0] == r[1] == r[2] == true) {
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

function can_book(booking, callback) {
    return authorize_user_booking(booking, function(res) {
        callback(res)
    });
}
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
function authorize_user_booking(booking, callback) {
    var timeslot_open = new Promise(function(resolve) {
        Booking.findOne({day:booking.day, timeslot:booking.timeslot, facility:booking.facility}, function(err, docs) {
            if(!err){
                resolve(docs == null);
            }else{
                console.log("error timeslot");
                console.log(err);
                resolve(false);
            }
        });
    });
    var max_weekly_reservations = 3;
    var enforce_reservation_count = new Promise(function(resolve) {
        Booking.count({user:user, facility:booking.facility}, function(err, count) {
            if(!err){
                resolve(count < max_weekly_reservations);
            }else{
                console.log("error count");
                console.log(err);
                resolve(false);
            }
        });
    });
    var enforce_one_per_timeslot = new Promise(function(resolve) {
        Booking.findOne({user:user, facility:booking.facility, timeslot:booking.timeslot}, function(err, docs) {
            if(!err){
                resolve(docs == null);
            }else{
                console.log("error one per");
                console.log(err);
                resolve(false);
            }
        });
    });
    Promise.all([timeslot_open, enforce_reservation_count, enforce_one_per_timeslot]).then(callback);
}

module.exports = router;
