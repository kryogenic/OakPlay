var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('profile', { title: 'Express' });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.find({}, function (err, docs) {
        res.json(docs);
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

module.exports = router;
