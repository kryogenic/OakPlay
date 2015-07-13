var Facility = require('../models/facility');
var User = require('../models/user');
var Booking = require('../models/booking');

// generate facilities
function generateFacilities() {
    Facility.remove({}, function() {

        var f;
        for(var i = 1; i < 6; i++) {
            f = new Facility();
            f.name = 'Tennis';
            f.description = "Tennis court #" + i + " is one of the five world class tennis courts available at Oak Bay."
            f.id = i;
            f.save();
        }
        f = new Facility();
        f.name = 'Pool';
        f.description = "A place to kick back and relax! Fully equipped with hot tubs, saunas, and a water slide!"
        f.id = 1;
        f.save();
        for(var i = 1; i < 5; i++) {
            f = new Facility();
            f.name = 'Squash';
            f.description = "All of the indoor courts at Oak Bay are second to none.. Squash court #" + i + " included!"
            f.id = i;
            f.save();
        }
        for(var i = 1; i < 4; i++) {
            f = new Facility();
            f.name = 'Workout';
            f.description = "Workout Room #" + i + " has a large variety of equipment to meet all of your needs!"
            f.id = i;
            f.save();
        }
        for(var i = 1; i < 3; i++) {
            f = new Facility();
            f.name = 'Spin';
            f.description = "All of the spin rooms at Oak Bay have top of the line bikes with instructors to match! Spin room #" + i +" has it all!"
            f.id = i;
            f.save();
        }

        console.log('generated facilities');
    });
}

// generate users
function generateUsers() {
    User.remove({}, function() {

        var user = new User();
        user.username = 'user';
        user.password = '$2a$10$C.AlRthdMJsCZ06U3YE1oOyQ9wmvc3cAzV.A.hgjAZzMEMWR/NuB6';
        user.first_name = 'fizzurzt';
        user.last_name = 'lastylast';
        user.info = 'i like green eggs and ham';
        user.email = 'user@gmail.com';
        user.save();

        var admin = new User();
        admin.username = 'admin';
        admin.password = '$2a$10$C.AlRthdMJsCZ06U3YE1oOyQ9wmvc3cAzV.A.hgjAZzMEMWR/NuB6';
        admin.first_name = '1337';
        admin.last_name = 'h4x0r';
        admin.info = 'there is no spoon';
        admin.email = 'admin@gmail.com';
        admin.admin = true;
        admin.save();

        console.log('generated users');
    });
}

generateUsers();
generateFacilities();

//deletes bookings 
Booking.remove({}, function() {
    console.log('deleted old bookings');
})