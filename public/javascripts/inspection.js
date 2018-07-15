$(function(){
    $.extend(true, mp, {
        inspectionControl: {
            init: function() {
                var $msg = $("<p class='mp-infomsg alert alert-info'/>");

                $msg.append("下記の駅は複数の候補があります、検索に使用する駅を選択してください。");
                $("#mp-messagearea").append($msg);

                $("#mp-searchbutton").on("click", function() {
                    var url = "search?",
                        $input = $(".mp-stationform").find("input, select");

                    $input.each(function(idx, elm) {
                        url += "station" + (idx + 1) + "=" + $(elm).val();

                        if (idx !== ($input.length - 1)) {
                            url += "&";
                        }
                    });

                    // navigate next page
                    location.href = url;
                });
            }
        }
    });
});