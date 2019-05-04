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
            var dryRunCheckBoxHTML = ""+
                "<div id='dryRunCheckboxDiv' >"+
                    "<label class='checkbox'>"+
                        "<input id='dryRunCheckBox' type='checkbox'> print without heating/extrusion"+
                    "</label>"+
                "</div>";
            var lastJobButton = $('#job_print').parent().children().last();
            lastJobButton.after(dryRunCheckBoxHTML);

            var dryRunNavBar = $("#dryrun_plugin_navbar");
            var dryRunCheckBox = $("#dryRunCheckBox");
            dryRunCheckBox.bind("click", function() {
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
/*
                        new PNotify({
                            title: 'Something was goiing wrong:',
                            text: "Unknown error occured. PLease reload the page..maybe that fix the problem",
                            type: "popup",
                            hide: false
						});
*/
                    }).always(function(){
//                        self.requestInProgress(false);
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
