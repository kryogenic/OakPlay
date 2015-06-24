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

router.get('/:user_id', function(req, res, next) {
    User.findById(req.params.user_id, function (err, user) {
        if(err)
            res.send(err);
        res.json(user);
    });
});

router.post('/login', function(req, res, next) {
    User.findOne({username:req.body.username}, function (err, docs) {
        res.json(bcrypt.compareSync(req.body.password, docs.password));
    });
});

router.post('/register', function(req, res, next) {
    var u = new User();
    u.name = req.body.name;
    u.username = req.body.username;
    u.password = req.body.password;
    u.save(function(err) {
        if(err) {
            if(err.code == 11000)
                return res.json( {success: false, message: "A user with that name already exists"});
            else
                return res.send(err);
        }
    });

    User.find({}, function (err, docs) {
        res.json(docs);
    });
});

module.exports = router;