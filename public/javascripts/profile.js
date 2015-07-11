$(document).ready(function(){
    // remove booking from profile page
    // tasks:
    //      find the booking in database for particular user
    //      delete booking
    //      remove from list
    $(".glyphicon-remove").click(function(){
        var b = $(this);
        console.log("deleting"); 
        $.post("/bookings/delete", {
             //?
        })
        .done(function(data) {
            if(data.success) {
                console.log("success!")
                b.closest('tr').remove();
            } else {
                alert(data.message);
            }   
        }); 
    });

    // code to link each booking in table to their corresponding facility page
    $(".profile-booking").click(function(){
        var row = $(this);
        window.document.location = row.data("href");
    });
});
