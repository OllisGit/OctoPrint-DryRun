/*
 * View model for DryRun
 *
 * Author: OllisGit
 * License: AGPLv3
 */
$(function() {
    function DryrunViewModel(parameters) {

        var PLUGIN_ID = "DryRun";

        var self = this;

        // assign the injected parameters, e.g.:
        // self.loginStateViewModel = parameters[0];
        self.settingsViewModel = parameters[1];

        // add checkbox AFTER everything is loaded
        $(function() {
            /* start checkbox - stuff */
            var dryRunCheckBoxHTML = "<input id='dryRunCheckBox' type='checkbox' data-off-active-cls='btn-success' data-on-active-cls='btn-danger'/>";
            var offIconHTML = "<span class='fa-stack'><i class='fa fa-thermometer-half fa-stack-1x'></i></span>";
            var onIconHTML = "<span class='fa-stack'><i class='fa fa-ban fa-stack-1x'></i></span>";
            var onIconHTMLMobile = "<span class='fa-stack'><i class='fa fa-thermometer-half fa-stack-1x'></i><i class='fa fa-ban fa-stack-1x' style='color: tomato; font-size: 2.6em;'></i></span>";

            var lastJobButton = $('#job_print').parent().children().last();
            lastJobButton.after(dryRunCheckBoxHTML);

            var dryRunNavBar = $("#dryrun_plugin_navbar");
            var dryRunCheckBox = $("#dryRunCheckBox");

            var dryRunCheckBoxPicker;
            if ($('html').is('#touch')) {
                dryRunCheckBoxPicker = dryRunCheckBox.checkboxpicker({
                  html: true,
                  offLabel: offIconHTML,
                  onLabel: onIconHTMLMobile
                });
                $('#job_print').parent().find('button').toggleClass('span4 span3');
                $('#job_print').parent().find('.btn-group').toggleClass('span3');
            } else {
                $("#dryRunCheckBox").wrap("<div class='span12 checkbox-wrapper'/>");
                dryRunCheckBoxPicker = dryRunCheckBox.checkboxpicker({
                  html: true,
                  offLabel: offIconHTML + "DryRun OFF",
                  onLabel: onIconHTML + "DryRun ON"
                });
             }

            dryRunCheckBoxPicker.on('change', function() {
                    var checkValue = dryRunCheckBox.is(':checked');
                    // Show/Hide Banner
                    if (checkValue == true){
                        dryRunNavBar.show();
                    } else {
                        dryRunNavBar.hide();
                    }
                    // Send current vactivation state to backend
                    $.ajax({
                        url: API_BASEURL + "plugin/"+PLUGIN_ID,
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify({
                            command: "checkboxState",
                            checkboxValue: checkValue
                        }),
                        contentType: "application/json; charset=UTF-8"
                    }).done(function(data){

                    }).always(function(){

                    }) ;
            });


        // receive data from backend
        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != PLUGIN_ID) {
                return;
            }
            alert("Data from backend!!!" +JSON.stringify(data));
            if (data.dryRunEnabled != undefined){
                dryRunCheckBox.attr('checked', data.dryRunEnabled);
            }
        }

        });
        // TODO not needed any more -> cleanup
        //$("#excludeExpressionsTextArea").numberedtextarea();
        //$("#excludeExpressions").autogrow({vertical: false, horizontal: false});
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: DryrunViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: ["loginStateViewModel", "settingsViewModel"],
        // Elements to bind to, e.g. #settings_plugin_DryRun, #tab_plugin_DryRun, ...
        elements: [
            document.getElementById("dryRun_plugin_settings"),
            document.getElementById("dryrun_plugin_navbar")
        ]
    });
});
