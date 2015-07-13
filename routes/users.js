var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');
var Booking = require("../models/booking");
var Facility = require("../models/facility");
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var generatePassword = require('password-generator');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'oakplayrec@gmail.com',
        pass: 'seng.299'
    }
});

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/users/login');
}

module.exports = function(passport){

    /*GET login page. */
    router.get('/login', function(req, res, next) {
        if (req.isAuthenticated()){
            res.redirect('/users/profile');
        }else{
            res.render('login', { message: req.flash('message'), nav: true });
        }
    });

    /*Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: 'profile',
        failureRedirect: 'login',
        failureFlash: true
    }));

    /*Get profile_edit page */
    router.get('/profile_edit', isAuthenticated, function(req, res, next) {
      res.render('profile_edit', { message: req.flash('message'), 
                                   nav: true,
                                   username: req.user.username,
                                   first_name: req.user.first_name,
                                   last_name: req.user.last_name,
                                   email: req.user.email,
                                   date_joined: req.user.date_joined.toDateString(),
      });
    });

    /*Handle profile edit POST */
    router.post('/profile_edit', function(req, res, next) {
      User.update({username: req.user.username}, {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
    //  info: req.body.info
      }, function(err, affected, resp){
        console.log(resp);
        res.redirect('/users/profile');
      });
    });

    /*GET profile page. */
    router.get('/profile', isAuthenticated, function(req, res, next) {
      Booking.find({user:req.user}, 'facility timeslot duration day')
             .populate('facility')
             .sort({ facility: 'asc', day:'asc', timeslot: 'asc' })
             .exec(function(err, docs){

        //compares adjacent bookings to display bookings properly
        //sets the other durations to 0 so they aren't also displayed            
        for(var i = 0; i < docs.length-1;){
            var j = 1;
            while(docs[i].timeslot + j == docs[i + j].timeslot && docs[i].facility == docs[i + j].facility && docs[i].day == docs[i + j].day){
                docs[i].duration++;
                docs[i + j].duration = 0;
                j++;
            }
            i += j;
        }
        
        function convert(cday){
            days = {
                "Sun": 0,
                "Mon": 1,
                "Tues": 2,
                "Wed": 3,
                "Thurs": 4,
                "Fri": 5,
                "Sat": 6
            }
            return (days[cday] - (new Date).getDay() + 7) % 7
        }
        docs.sort(function(a, b){
            if(convert(a.day) > convert(b.day)){
                return 1;
            }
            if(convert(a.day) < convert(b.day)){
                return -1;
            }
            if(a.timeslot > b.timeslot){
                return 1;
            }
            if(a.timeslot < b.timeslot){
                return -1;
            }
            return 0;
        });

        console.log(req.user);

        res.render('profile', { message: req.flash('message'),
                                username: req.user.username,
                                first_name: req.user.first_name,
                                last_name: req.user.last_name,
                                date_joined: req.user.date_joined.toDateString(),
                                user_bookings: docs,
                                cooldown: req.user.cooldown
        });
      });
    });

    /*GET Registration Page */
    router.get('/register', function(req, res, next) {
        if (req.isAuthenticated()){
            res.redirect('/users/profile');
        }else{
            res.render('register', { message: req.flash('message'), nav: true });
        }
    });

    /* Handle Registration POST */
    router.post('/register', passport.authenticate('signup', {
        successRedirect: 'profile',
        failureRedirect: 'register',
        failureFlash : true  
    }));

    /* GET Forgot Username */
    router.get('/username', function(req, res, next) {
        res.render('forgotusername', {message: req.flash('message'), nav: true });
    });

    /* Handle Forgotten Username */
    router.post('/username', function(req, res, next){
        User.findOne({email:req.body.email}, function(err, docs){
            if(docs == null){
                req.flash('message', 'There is no user with that email address.')
                res.redirect('username');
            }else{
                var mailOptions = {
                    from: 'Oak Play <oakplayrec@gmail.com>',
                    to: docs.email,
                    subject: 'Oak Play Username',
                    text: 'The username registered to this email address is: ' + docs.username
                };
                transporter.sendMail(mailOptions, function(err, info){
                    if(err){
                        req.flash('message', 'There was an error and email was not sent, please try again.')
                        res.redirect('username');
                    }else{
                        req.flash('message', 'Your username has been sent to your registered email address.')
                        res.redirect('login')
                    }
                });
            }
        })
    })

    /* GET Password Reset */
    router.get('/passwordreset', function(req, res, next) {
        res.render('passwordreset', {message: req.flash('message'), nav: true });
    });

    /* Handle Password Reset */
    router.post('/passwordreset', function(req, res, next) {
        User.findOne({username:req.body.username}, function (err, docs) {
            if(docs == null){
                req.flash('message', 'There is no user by that name.')
                res.redirect('passwordreset');
            }else{
                var password = generatePassword(10, false);
                docs.password = bcrypt.hashSync(password);
                docs.save();
                var mailOptions = {
                    from: 'Oak Play <oakplayrec@gmail.com>',
                    to: docs.email,
                    subject: 'Oak Play Password Reset',
                    text: 'Your password has been successfully reset to: ' + password
                };
                transporter.sendMail(mailOptions, function(err, info){
                    if(err){
                        req.flash('message', 'There was an error and email was not sent, please try again.')
                        res.redirect('passwordreset');
                    }else{
                        req.flash('message', 'Password reset email has been sent to your registered email address.')
                        res.redirect('login')
                    }
                });
            }
        });
    });

    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('login');
    });

    /* GET users listing. */
    router.get('/', isAuthenticated, function(req, res, next) {
        User.find({}, function (err, docs) {
            res.json(docs);
        });
    });

    /* GET specific user info */
    router.get('/:user_id', function(req, res, next) {
        User.findById(req.params.user_id, function (err, user) {
            if(err)
                res.send(err);
            res.json(user);
        });
    });

    return router;
}
