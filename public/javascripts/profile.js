$(document).ready(function(){
    // code to link each booking in table to their corresponding facility page
    $(".profile-booking").click(function(){
        var row = $(this);
        window.document.location = row.data("href");
    });

    $(".btn-danger").click(function(){
        bookingRow = $(this);
        bookingRow.parent().parent().remove();
        $.post("/bookings/delete/multiple", {
            facility: bookingRow.attr('data-facility').substring(1, bookingRow.attr('data-facility').length - 1),
            day: bookingRow.attr('data-day'),
            timeslot: bookingRow.attr('data-time'),
            duration: bookingRow.attr('data-duration')
        })
        .done(function(data){
            if(!data.success){
                alert("Cancellation failed, refresh page and try again");
            }
        })
    });
});