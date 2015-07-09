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

$(".available-time").click(function(e){
    var timeslotDiv = $(this);
    $.post("/bookings/create", {
        day: timeslotDiv.attr('data-day'),
        timeslot: timeslotDiv.attr('data-time'),
        facility:facility_id})
        .done(function(data) {
            if(data.success) {
                timeslotDiv.removeClass("available-time");
                timeslotDiv.addClass("userbooked-time");
            } else {
                alert(data.message);
            }
        });
});