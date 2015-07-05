var Facility = require('../models/facility');
var User = require('../models/user');
var Booking = require('../models/booking');

// generate facilities
var facilities_promise = new Promise(function(resolve) {
    Facility.remove({}, function() {

        var f;
        for(var i = 1; i < 6; i++) {
            f = new Facility();
            f.name = 'Tennis';
            f.number = i;
            f.save();
        }
        f = new Facility();
        f.name = 'Pool';
        f.number = 1;
        f.save();
        for(var i = 1; i < 5; i++) {
            f = new Facility();
            f.name = 'Squash';
            f.number = i;
            f.save();
        }
        for(var i = 1; i < 4; i++) {
            f = new Facility();
            f.name = 'Workout';
            f.number = i;
            f.save();
        }
        for(var i = 1; i < 3; i++) {
            f = new Facility();
            f.name = 'Spin';
            f.number = i;
            f.save();
        }

        console.log('generated facilities');
        resolve(f._id);
    });
});

// generate users
var users_promise = new Promise(function(resolve) {
    User.remove({}, function() {

        var user = new User();
        user.username = 'user';
        user.password = '$2a$10$C.AlRthdMJsCZ06U3YE1oOyQ9wmvc3cAzV.A.hgjAZzMEMWR/NuB6';
        user.info = 'i like green eggs and ham';
        user.email = 'user@gmail.com'
        user.save();

        console.log('generated users');
        resolve(user._id);
    });
})

// generate bookings
// this code is called after the facilities_promise and users_promise are "resolved"
// then the ids of our user and one of our facilities is passed using promise_result
// we can then use these ids to build a sample booking
Promise.all([facilities_promise, users_promise]).then(function(promise_result) {
    Booking.remove({}, function() {

        var b = new Booking();
        b.day = 'monday';
        b.timeslot = [2,3,4];
        b.facility = promise_result[0];
        b.user = promise_result[1];
        b.save();

        b = new Booking();
        b.day = 'tuesday';
        b.timeslot = [2,3,4];
        b.facility = promise_result[0];
        b.user = promise_result[1];
        b.save();

        b = new Booking();
        b.day = 'wednesday';
        b.timeslot = [2,3,4];
        b.facility = promise_result[0];
        b.user = promise_result[1];
        b.save();

        console.log('generated bookings');
    });
})