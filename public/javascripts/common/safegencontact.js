$(function(){
    $.extend(true, mp, {
        safegencontact: {
            apply: function($elm) {
                var def = {
                    username: "shibata.firm.info",
                    domain: "gmail.com"
                };

                $elm.on("click", function(e) {
                    var $tmp = $("<a/>");

                    e.preventDefault();

                    $tmp.attr("href", "mailto:" + [def.username, def.domain].join("@"))
                    $tmp.appendTo("body");
                    $tmp[0].click();

                    $tmp.remove();
                });
            }
        }
    });
});