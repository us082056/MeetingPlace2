$(function(){
    $.extend(true, mp, {
        resultControl: {
            init: function() {
                var $msg;

                if ($(".mp-notfoundmsg").length === 0) {
                    $msg = $("<p class='mp-infomsg alert alert-info'/>");
                    $msg.append("以下の集合駅候補が見つかりました。");
                } else {
                    $msg = $("<p class='mp-errormsg alert alert-danger'/>");
                    $msg.append("集合駅候補が見つかりませんでした。検索条件を見直して再検索してください。");
                }

                $("#mp-messagearea").append($msg);
            }
        }
    });
});