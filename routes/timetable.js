var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Booking = require('../models/booking');
var Facility = require('../models/facility');
var User = require('../models/user');

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/users/login');
}

router.get('/facilities', isAuthenticated, function(req, res, next) {
    res.render('facilities', { message: req.flash('message') });
});

/* GET specific timetable */
router.get('/:facility/:num', isAuthenticated, function(req, res, next) {
    Facility.find({name:req.params.facility}, function(err, docs){
        if(docs == null){
            req.flash('message', "That facility doesn't exist!")
            res.redirect('/timetable/facilities');
        }else{
            var fac;
            for(var f in docs){
                if(docs[f].id == req.params.num){
                    fac = docs[f];
                    break;
                }
            }
            Booking.find({facility:fac}, function(err, fdoc){
                User.findOne({username:req.user.username}, function(err, u){
                    console.log(u);
                    Booking.find({user: u, facility: fac}, function(err, udoc){
                        res.render('timetable', {number: req.params.num, facilities: docs, message: req.flash('message'), fBookings: fdoc, uBookings: udoc});
                    })
                })
            })
        }
    });
});


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