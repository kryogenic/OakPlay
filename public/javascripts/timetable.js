$(document).ready(function(){
    $(".navbar-fixed-top").hide();

    $(function () {
        $(window).scroll(function () {
            // set distance user needs to scroll before we fadeIn navbar
            if ($(this).scrollTop() > 215) {
                $('.navbar-fixed-top').fadeIn();
            } else {
                $('.navbar-fixed-top').fadeOut();
            }
        });
    });
});

$(".timeslot").click(function(e){
    var timeslotDiv = $(this);
    if(timeslotDiv.hasClass('available-time')) {
        $.post("/bookings/create", {
            day: timeslotDiv.attr('data-day'),
            timeslot: timeslotDiv.attr('data-time'),
            facility:facility_id})
        .done(function(data) {
            if(data.success) {
                timeslotDiv.removeClass('available-time');
                timeslotDiv.addClass('userbooked-time');
            } else {
                alert(data.message);
            }
        });
    } else if(timeslotDiv.hasClass('userbooked-time') || timeslotDiv.hasClass('unavailable-time')) {
        $.post("/bookings/delete", {
            day: timeslotDiv.attr('data-day'),
            timeslot: timeslotDiv.attr('data-time'),
            facility:facility_id})
        .done(function(data) {
            if(data.success) {
                timeslotDiv.removeClass('userbooked-time');
                timeslotDiv.removeClass('unavailable-time');
                timeslotDiv.addClass('available-time');
            } else {
                alert(data.message);
            }
        });
    }
});