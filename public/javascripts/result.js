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

                // お店検索してダイアログ表示
                $(".mp-dialog-show").modaal({
                    before_open: function(event) {
                        var $content = $("<div class='panel panel-default'/>");

                        // 前の検索結果がダイアログに残るため一度空にする。
                        $(".mp-dialog-content").empty().append("検索中...");

                        $.ajax({
                            url: "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/",
                            dataType: "json",
                            data: {
                                "key": "176402b9d6791e87",
                                "format": "json",
                                "range": "5", // 検索範囲（5: 3000m以内）
                                "count": "20", // 検索結果の取得数
                                "lng": event.currentTarget.dataset.station_lon,
                                "lat": event.currentTarget.dataset.station_lat
                            }
                        }).done(function(res) {
                            var contentStr = "";

                            // ガード: お店のデータがない場合は以降処理しない。
                            if (!res.results.shop || res.results.shop.length === 0) {
                                $content.append("<p>近くのお店が見つかりませんでした。</p><p>(´・ω・`)</p>");
                                return;
                            }

                            contentStr += "<div class='panel-heading'>お店検索（β版）</div>";
                            contentStr += "<ul class='list-group'>";

                            res.results.shop.forEach(function(shop) {
                                contentStr += "<li class='list-group-item'>" +
                                                "<div>" + shop.name + "</div>" +
                                                "<div>（" + shop.genre.name + "）</div>" +
                                                "<a href='" + shop.urls.pc + "' target='_blank'>お店のWEBサイトを見る</a>" +
                                              "</li>";
                            });

                            contentStr += "</ul>";

                            $content.append(contentStr);
                        }).fail(function(e) {
                            $content.append("<p>申し訳ありません。想定外のエラーが発生しました。</p><p>(´・ω・`)</p>");
                        }).always(function() {
                            $(".mp-dialog-content").empty().append($content);
                        });
                    }
                });

                // ダイアログcloseのハンドラ
                $("#mp-dialog-closebutton").on("click", function() {
                    $(".mp-dialog-show").modaal("close");
                });
            }
        }
    });
});