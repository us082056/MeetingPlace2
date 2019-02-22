$(function(){
    $.extend(true, mp, {
        resultControl: {
            init: function() {
                var $msg, $clipboardBtn;

                if ($(".mp-notfoundmsg").length === 0) {
                    $msg = $("<p class='mp-infomsg alert alert-info'/>");
                    $msg.append("以下の集合駅候補が見つかりました。");
                } else {
                    $msg = $("<p class='mp-errormsg alert alert-danger'/>");
                    $msg.append("集合駅候補が見つかりませんでした。検索条件を見直して再検索してください。");
                }

                $("#mp-messagearea").append($msg);

                // override share URL
                $(".line-it-button").attr("data-url", encodeURI(location.href));
                $("#mp-copybutton").attr("data-clipboard-text", encodeURI(location.href));

                $clipboardBtn = new ClipboardJS("#mp-copybutton");
                $clipboardBtn.on("success", function(e) {
                    e.clearSelection();
                    alert("URLをコピーしました。");
                });

                // vefify
                // modaalの表示前スクリプトでajax通信+コンテンツ生成して、
                //     div(id="mp-dialog",style="display:none;")　の下にappendすれば実現できそう
                $(".mp-dialog-show").modaal();
            }
        }
    });
});