var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');
var User = require('../models/user');

router.post('/delete', User.isAuthenticated, function(req, res, next) {
    if(req.user.admin) {
        Booking.remove({day: req.body.day, timeslot: req.body.timeslot, facility: req.body.facility}, function(err) {
            if(!err) {
                res.json({success:true});
            } else {
                console.log(err);
                res.json({success:false});
            }
        });
    } else {
        Booking.findOne({day: req.body.day, timeslot: req.body.timeslot, facility: req.body.facility, user:req.user._id}, function(err, docs) {
            if(docs) {
                if(!is_24h_away(docs)) {
                    var now = new Date();
                    req.user.cooldown = now.setDate(now.getDate() + 2);
                    req.user.save();
                }
                Booking.remove({_id:docs._id}, function(err) {
                    if(!err) {
                        res.json({success:true});
                    } else {
                        console.log(err);
                        res.json({success:false});
                    }
                });
            } else {
                res.json({success:false});
            }
        });
    }
});

router.post('/create', User.isAuthenticated, function(req, res, next) {
    var b = new Booking({
        day: req.body.day,
        timeslot: req.body.timeslot,
        facility: req.body.facility,
        user: req.user._id,
        res_id: 1,
        duration: 1
    });
    if(!is_in_past(b)) {
        authorize_user_booking(req.user, b, function(conditions) {
            var authorized = true;
            for(var idx in conditions) {
                if(!conditions[idx])
                    authorized = false;
            }
            if(authorized) {
                b.save(function(err) {
                    if(err)
                        console.log(err);
                });
                res.json({success:true});
            } else {
                res.json({success:false,message:"You cannot create this booking"});
            }
        });
    } else {
        res.json({success:false,message:"This time is unavailable"});
    }
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

var weekdays = new Array(7);
weekdays[0] = 'Sun';
weekdays[1] = 'Mon';
weekdays[2] = 'Tues';
weekdays[3] = 'Wed';
weekdays[4] = 'Thurs';
weekdays[5] = 'Fri';
weekdays[6] = 'Sat';

var weekday_short = new Array(7);
weekday_short['Sun'] = 'Sunday';
weekday_short['Mon'] = 'Monday';
weekday_short['Tues'] = 'Tuesday';
weekday_short['Wed'] = 'Wednesday';
weekday_short['Thurs'] = 'Thursday';
weekday_short['Fri'] = 'Friday';
weekday_short['Sat'] = 'Saturday';

function is_in_past(booking) {
    var now = new Date();
    if(weekday_short[booking.day] == weekday_short[weekdays[now.getDay()]]) {
        // is today
        var hour = 8 + Math.floor(booking.timeslot / 2);
        var minute = booking.timeslot % 2 == 0 ? 0 : 30;
        return hour < now.getHours() || hour == now.getHours() && minute < now.getMinutes();
    }
}
function is_24h_away(booking) {
    var now = new Date();
    if(weekday_short[booking.day] == weekday_short[weekdays[now.getDay()]]) {
        // is today
        return false;
    } else if(weekday_short[weekdays[weekdays.indexOf(booking.day)+1]] == now.getDay()) {
        // is tomorrow
        var hour = 8 + Math.floor(booking.timeslot / 2);
        var minute = booking.timeslot % 2 == 0 ? 0 : 30;
        return hour > now.getHours() || hour == now.getHours() && minute > now.getMinutes();
    } else {
        return true;
    }
}
function authorize_user_booking(user, booking, callback) {
    var no_cooldown = new Promise(function(resolve) {
        User.findOne({_id:user._id}, function(err, user) {
            if(!err){
                resolve(user.cooldown == null || new Date() - user.cooldown > 0);
            }else{
                console.log(err);
                resolve(false);
            }
        });
    });
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
    var enforce_max_booking_length = new Promise(function(resolve) {
        Booking.find({user:user, facility:booking.facility, day:booking.day}, function(err, docs) {
            var timeslots = new Array(31);
            for(var idx in docs) {
                timeslots[docs[idx].timeslot] = 1;
            }
            if(!err){
                resolve(!(
                    timeslots[booking.timeslot-3] && timeslots[booking.timeslot-2] && timeslots[booking.timeslot-1] ||
                    timeslots[booking.timeslot-2] && timeslots[booking.timeslot-1] && timeslots[booking.timeslot+1] ||
                    timeslots[booking.timeslot-1] && timeslots[booking.timeslot+1] && timeslots[booking.timeslot+2] ||
                    timeslots[booking.timeslot+1] && timeslots[booking.timeslot+2] && timeslots[booking.timeslot+3]
                ));
            }else{
                console.log(err);
                resolve(false);
            }
        });
    });
    Promise.all([
        no_cooldown,
        timeslot_open,
        enforce_reservation_count,
        enforce_one_per_timeslot,
        enforce_max_booking_length]).then(callback);
}

module.exports = router;
