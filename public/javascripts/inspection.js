const mp = {
    inspectionControl : {
        init: function() {
            var _self = this;

            $("#mp-deletebutton").on("click", function() {
                if ($(".mp-stationform").length === _self.MINIMUM_FORM_COUNT) {
                    return;
                }

                $(".mp-stationform:last").remove();

                _self._updateDeleteButtonState();
            });
        }
    }
}