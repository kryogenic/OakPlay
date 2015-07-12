$(document).ready(function(){
    // code to link each booking in table to their corresponding facility page
    $(".profile-booking").click(function(){
        var row = $(this);
        alert("DURR");
        window.document.location = row.data("href");
    });

    $(".btn-danger").click(function(){
        bookingRow = $(this);
        $.post("/bookings/delete/multiple", {
            facility: bookingRow.attr('data-facility').substring(1, bookingRow.attr('data-facility').length - 1),
            day: bookingRow.attr('data-day'),
            timeslot: bookingRow.attr('data-time'),
            duration: bookingRow.attr('data-duration')
        })
        .done(function(data){
            if(data.success){
                bookingRow.parent().parent().remove();
            }else{
                alert("Cancellation failed, try again.");
            }
        })
    });
});