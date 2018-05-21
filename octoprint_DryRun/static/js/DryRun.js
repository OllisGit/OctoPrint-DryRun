/*
 * View model for DryRun
 *
 * Author: OllisGit
 * License: AGPLv3
 */
$(function() {
    function DryrunViewModel(parameters) {

        var PLUGIN_ID = "DryRun";

        // enable support of resetSettings
        new ResetSettingsUtil().assignResetSettingsFeature(PLUGIN_ID, function(data){
                                // assign new settings-values // TODO find a more generic way
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.showOnNavBar(data.showOnNavBar);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.showOnPrinterDisplay(data.showOnPrinterDisplay);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.showAllPrinterMessages(data.showAllPrinterMessages);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.navBarMessagePattern(data.navBarMessagePattern);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.printerDisplayMessagePattern(data.printerDisplayMessagePattern);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.addTrailingChar(data.addTrailingChar);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.layerExpressions(data.layerExpressions);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.showLayerInStatusBar(data.showLayerInStatusBar);
                                self.settingsViewModel.settings.plugins.DisplayLayerProgress.showHeightInStatusBar(data.showHeightInStatusBar);
        });


        var self = this;

        // assign the injected parameters, e.g.:
        // self.loginStateViewModel = parameters[0];
        // self.settingsViewModel = parameters[1];

        // add checkbox AFTER everything is loaded
        $(function() {
            var dryRunCheckBoxHTML = ""+
                "<div style='padding-top:40px'>"+
                    "<input id='dryRunCheckBox' type='checkbox' data-bind='checked: true'>print without heating/extrusion"+
                "</div>"
            var lastJobButton = $('#job_print').parent().children().last();
            lastJobButton.after(dryRunCheckBoxHTML);

            var dryRunCeckBox = $("#dryRunCheckBox");
            dryRunCeckBox.bind("click", function() {
                    var checkValue = dryRunCeckBox.is(':checked');
                    alert ("dryrun click: " + checkValue);

                    $.ajax({
                        url: API_BASEURL + "plugin/"+PLUGIN_ID,
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            dryRunEnabled: checkValue,
                        }),
                        contentType: "application/json; charset=UTF-8"
                    }).done(function(data){

                        alert("back from server");

                        new PNotify({
                            title: 'Old files were deleted:',
                            text: "All files were now deleted",
                            type: "popup",
                            hide: false
						});

                    }).always(function(){
//                        self.requestInProgress(false);
                    }) ;
                });

/*
                        // set-number
        // jquery-autosize (optional)
        $("#myeditor").autosize({
          callback: function(textarea) {
            $(textarea).scroll();
          }
        });


        $("#myeditor").focus();

*/
        });

        $("#excludeExpressionsTextArea").numberedtextarea();
        //$("#excludeExpressions").autogrow({vertical: false, horizontal: false});

    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: DryrunViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ /* "loginStateViewModel", "settingsViewModel" */ ],
        // Elements to bind to, e.g. #settings_plugin_DryRun, #tab_plugin_DryRun, ...
        elements: [
            document.getElementById("dryRun_plugin_settings")
        ]
    });
});
