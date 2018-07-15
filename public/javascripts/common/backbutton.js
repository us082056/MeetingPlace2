$(function(){
    $.extend(true, mp, {
        backbuttonControl: {
            init: function() {
                $("#mp-backbutton").on("click", function() {
                    location.href = "index";
                });
            }
        }
    });
});