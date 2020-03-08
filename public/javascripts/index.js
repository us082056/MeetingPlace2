$(function(){
    $.extend(true, mp, {
        indexControl: {
            MINIMUM_FORM_COUNT: 2,

            FORM_TEMPLATE: "<div class='mp-stationform form-group'>" +
                                "<label/>" +
                                "<input type='text' class='form-control font-16px' placeholder='駅名'>" +
                            "</div>",

            ERROR_MSG_TEMPLATE: "<p class='mp-errormsg alert alert-danger'/>",

            init: function() {
                var _self = this;

                // popup for additional homescreen
                addToHomescreen({
                    lifespan: 0,
                    displayPace: 10080,
                    message: {
                        ios: "集合駅検索をホーム画面に追加するとアプリのように使えます。<br>ここをタップして<strong>ホーム画面に追加</strong>を選択して下さい。",
                        android: "集合駅検索をホーム画面に追加するとアプリのように使えます。<br>ブラウザのオプションメニューから<strong>ホーム画面に追加</strong>を選択して下さい。"
                    }
                });

                this._setAutocomplete($(".mp-stationform").find("input"));

                $("#mp-deletebutton").on("click", function() {
                    if ($(".mp-stationform").length === _self.MINIMUM_FORM_COUNT) {
                        return;
                    }

                    $(".mp-stationform:last").remove();

                    _self._updateDeleteButtonState();
                });

                $("#mp-addbutton").on("click", function() {
                    var newForm = $(_self.FORM_TEMPLATE),
                        newIdx = $(".mp-stationform").length + 1;

                    newForm.find("label").text("出発駅" + newIdx);

                    $("#mp-inputgroup").append(newForm);
                    _self._setAutocomplete(newForm.find("input"));

                    _self._updateDeleteButtonState();
                });

                $("#mp-searchbutton").on("click", function() {
                    var $d ,reqParam = {},
                        $notEmptyInput = $(".mp-stationform").find("input").filter(function() {

                        // filter for not empty
                        return $(this).val();
                    });

                    // single item check
                    // check: count of items
                    if ($notEmptyInput.length < 2) {
                        _self._showErrorMsg("2つ以上の出発駅を入力してください。");
                        return;
                    }

                    // create request parameter
                    $notEmptyInput.each(function(idx, elm) {
                        reqParam["station" + (idx + 1)] = $(elm).val();
                    });

                    $d = $.Deferred();

                    // correlation check
                    // check: is exist
                    $.ajax({
                        type: "GET",
                        url: "check/exist",
                        data: reqParam
                    }).then(function(res) {
                        var errorMsg = "";

                        if (res.notFoundStations.length !== 0) {
                            res.notFoundStations.forEach(function(notFoundStation, idx){
                                if (idx !== 0) {
                                    errorMsg += "<br>";
                                }
                                errorMsg += notFoundStation + "が見つかりません、駅名が正しいか確認してください。";
                            });

                            _self._showErrorMsg(errorMsg);
                            $d.reject();
                        } else {
                            $d.resolve();
                        }
                    });

                    $d.then(function() {
                        var url = "inspection?";

                        Object.keys(reqParam).forEach(function (key, idx, array) {
                            url += key + "=" + encodeURIComponent(reqParam[key]);

                            if (idx !== (array.length - 1)) {
                                url += "&";
                            }
                        });

                        // navigate next page
                        location.href = url;

                        return;
                    }).fail(function() {

                        // do nothing
                        return;
                    });
                });
            },

            _setAutocomplete: function($target) {
                $target.autocomplete({
                    source: function(req, res) {
                        $.ajax({
                            url: "check/autocomplist?keyword=" + req.term,
                            dataType: "json",
                            success: function(data) {
                                res(data.autocomplist);
                            }
                        });
                    },

                    // Countermeasure select with one tap on smartphone
                    open: function(event, ui) {
                        $(".ui-autocomplete").off("menufocus hover mouseover mouseenter");
                    }
                });
            },

            _showErrorMsg: function(errorMsg) {
                var $msg = $(this.ERROR_MSG_TEMPLATE);

                $msg.append(errorMsg);

                // assuming that the message is already displayed,
                // first empty message area
                $("#mp-messagearea").empty().append($msg);
                $("html, body").animate({scrollTop:$("#mp-messagearea").offset().top});
            },

            _updateDeleteButtonState: function() {
                $("#mp-deletebutton").prop("disabled", $(".mp-stationform").length === this.MINIMUM_FORM_COUNT);
            }
        }
    });
});