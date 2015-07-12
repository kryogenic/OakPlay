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
    var errmsg = "no error";
    if(!is_in_past(b)) {
        authorize_user_booking(req.user, b, function(conditions) {
            var authorized = true;
            for(var idx in conditions) {
                if(!conditions[idx]) {
                    authorized = false;
                    errmsg = omgwtfhax[idx][1];
                    break;
                }
            }
            if(authorized) {
                b.save(function(err) {
                    if(err)
                        console.log(err);
                });
                res.json({success:true});
            } else {
                res.json({success:false,message:errmsg});
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
    if(booking.day == weekdays[now.getDay()]) {
        // is today
        return false;
    } else if(weekdays.indexOf(booking.day) == (now.getDay() + 1) % 7) {
        // is tomorrow
        var hour = 8 + Math.floor(booking.timeslot / 2);
        var minute = booking.timeslot % 2 == 0 ? 0 : 30;
        return hour > now.getHours() || hour == now.getHours() && minute > now.getMinutes();
    } else {
        return true;
    }
}

var omgwtfhax = [
    [no_cooldown = function(user, booking, resolve) {
    User.findOne({_id:user._id}, function(err, user) {
        if(!err){
            resolve(user.cooldown == null || new Date() - user.cooldown > 0);
        }else{
            console.log(err);
            resolve(false);
        }
    })}, 'You are currently not allowed to create bookings'],
    [timeslot_open = function(user, booking, resolve) {
    Booking.count({day:booking.day, timeslot:booking.timeslot, facility:booking.facility}, function(err, count) {
        if(!err){
            resolve(count == 0);
        }else{
            console.log(err);
            resolve(false);
        }
    })}, 'This timeslot has been booked by another user'],
    [enforce_reservation_count = function(user, booking, resolve) {
        Booking.count({user:user, facility:booking.facility}, function(err, count) {
            if(!err){
                resolve(count < 15);
            }else{
                console.log(err);
                resolve(false);
            }
        });
    }, 'You have too many existing reservations in this facility to create any more'],
    [enforce_one_per_timeslot = function(user, booking, resolve) {
        Booking.count({user:user, day:booking.day, timeslot:booking.timeslot}, function(err, count) {
            if(!err){
                resolve(count == 0);
            }else{
                console.log(err);
                resolve(false);
            }
        });
    }, 'You have already booked this timeslot in another facility'],
    [enforce_max_booking_length = function(user, booking, resolve) {
        Booking.find({user:user, facility:booking.facility, day:booking.day}, function(err, docs) {
            var timeslots = new Array(31);
            for(var idx in docs) {
                timeslots[docs[idx].timeslot] = 1;
            }
            if(!err){
                resolve(!(
                timeslots[booking.timeslot-4] && timeslots[booking.timeslot-3] && timeslots[booking.timeslot-2] && timeslots[booking.timeslot-1] ||
                timeslots[booking.timeslot-3] && timeslots[booking.timeslot-2] && timeslots[booking.timeslot-1] && timeslots[booking.timeslot+1] ||
                timeslots[booking.timeslot-2] && timeslots[booking.timeslot-1] && timeslots[booking.timeslot+1] && timeslots[booking.timeslot+2] ||
                timeslots[booking.timeslot-1] && timeslots[booking.timeslot+1] && timeslots[booking.timeslot+2] && timeslots[booking.timeslot+3] ||
                timeslots[booking.timeslot+1] && timeslots[booking.timeslot+2] && timeslots[booking.timeslot+3] && timeslots[booking.timeslot+4]
                ));
            }else{
                console.log(err);
                resolve(false);
            }
        });
    }, 'You can not book over 2 hours in a row']
];
function authorize_user_booking(user, booking, callback) {
    var promises = [];
    for(var i in omgwtfhax) {
        promises.push(
            new Promise(function(resolve) {
                omgwtfhax[i][0](user, booking, resolve);
                }));
    }
    Promise.all(promises).then(callback);
}

module.exports = router;
