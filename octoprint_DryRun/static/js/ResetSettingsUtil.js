/**
 *
 */
function ResetSettingsUtil(){

    var RESET_BUTTON_ID = "resetSettingsButton"
    var RESET_BUTTON_HTML = "<button id='"+RESET_BUTTON_ID+"' class='btn btn-warning' style='margin-right:3%'>Reset Settings</button>"


    this.assignResetSettingsFeature = function(PLUGIN_ID_string, mapSettingsToViewModel_function){
        var resetSettingsButtonFunction = function(){
            var resetButton = $("#" + RESET_BUTTON_ID).hide();
        }
        // hide reset button when hidding settings. needed because of next dialog-shown event
        var settingsDialog = $("#settings_dialog");
        var settingsDialogDOMElement = settingsDialog.get(0);

        var eventObject = $._data(settingsDialogDOMElement, 'events');
        if (eventObject != undefined && eventObject.hide != undefined){
            // already there, is it my function
            if (eventObject.hide[0].handler.name != "resetSettingsButtonFunction"){
                settingsDialog.on('hide', resetSettingsButtonFunction);
            }
        } else {
            settingsDialog.on('hide', resetSettingsButtonFunction);
        }

        // add click hook for own plugin the check if resetSettings is available
        var pluginSettingsLink = $("ul[id=settingsTabs] > li[id^=settings_plugin_"+PLUGIN_ID_string+"] > a[href^=\\#settings_plugin_"+PLUGIN_ID_string+"]:not([hooked="+PLUGIN_ID_string+"])");
        pluginSettingsLink.attr("hooked", PLUGIN_ID_string);
        pluginSettingsLink.click(function() {
            // call backend, is resetSettingsButtonEnabled
            // hide reset settings button
            $.ajax({
                url: API_BASEURL + "plugin/"+PLUGIN_ID_string+"?action=isResetSettingsEnabled",
                type: "GET"
            }).done(function( data ){
                var resetButton = $("#" + RESET_BUTTON_ID);
                if (data.enabled == "true"){
                    if (resetButton.length == 0){
                        // add button to page
                        $(".modal-footer > .aboutlink").after(RESET_BUTTON_HTML);
                        resetButton = $("#" + RESET_BUTTON_ID);
                        // add click action
                        resetButton.click(function() {
                            $.ajax({
                                url: API_BASEURL + "plugin/"+PLUGIN_ID_string+"?action=resetSettings",
                                type: "GET"
                            }).done(function( data ){
                                new PNotify({
                                    title: "Default settings saved!",
                                    text: "The settings were now reseted to default values",
                                    type: "info",
                                    hide: true
                                });

                                mapSettingsToViewModel_function(data);
                            });
                        });
                    }
                    resetButton.show();
                } else {
                    if (resetButton.length != 0){
                        resetButton.hide();
                    }
                }
            });
        });

        // default behaviour -> hide reset button --> if not already assigned
        var otherSettingsLink = $("ul[id=settingsTabs] > li[id^=settings_] > a[href^=\\#settings_]:not([hooked])");
        if (otherSettingsLink.length != 0){
            otherSettingsLink.attr("hooked", "otherSettings");
            otherSettingsLink.click(resetSettingsButtonFunction);
        }
    }

}
