var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.find({}, function (err, docs) {
        res.json(docs);
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

router.post('/login', function(req, res, next) {
    User.findOne({username:req.body.username}, function (err, docs) {
        if(docs == null)
            res.json(false);
        else
            res.json(bcrypt.compareSync(req.body.password, docs.password));
    });
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
    if(req.body.confirmPass != req.body.password) {
        res.json({success:false,error:'Passwords don\'t match'});
        return;
    }
    var u = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password),
        email: req.body.email
    });
    u.save(function(err) {
        if(err) {
            if(err.code == 11000)
                res.json({success:false,message:'A user with that name already exists'});
            else
                res.json({success:false,message:err});
        } else {
            res.json({success:true});
        }
    });
});

router.get('/:user_id', function(req, res, next) {
    User.findById(req.params.user_id, function (err, user) {
        if(err)
            res.send(err);
        res.json(user);
    });
});

module.exports = router;