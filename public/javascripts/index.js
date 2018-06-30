const mp = {
    indexControl : {
        MINIMUM_FORM_COUNT: 2,

        FORM_TEMPLATE: "<div class='mp-stationform form-group'>" +
                            "<label/>" +
                            "<input type='text' class='form-control' placeholder='駅名'>" +
                        "</div>",

        init: function() {
            var _self = this;

            console.log(this.MINIMUM_FORM_COUNT);

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

                _self._updateDeleteButtonState();
            });
        },

        _updateDeleteButtonState: function() {
            $("#mp-deletebutton").prop("disabled", $(".mp-stationform").length === this.MINIMUM_FORM_COUNT);
        }
    }
}