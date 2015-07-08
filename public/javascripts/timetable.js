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
