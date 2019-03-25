# coding=utf-8
from __future__ import absolute_import

### (Don't forget to remove me)
# This is a basic skeleton for your plugin's __init__.py. You probably want to adjust the class name of your plugin
# as well as the plugin mixins it's subclassing from. This is really just a basic skeleton to get you started,
# defining your plugin as a template plugin, settings and asset plugin. Feel free to add or remove mixins
# as necessary.
#
# Take a look at the documentation on what other plugin mixins are available.

import octoprint.plugin

import re
import flask

from octoprint_DryRun.gcode_parser import Commands, ParsedCommand, Response

DEFAULT_EXCLUDE_EXPRESSIONS = (
    "match [^G[0-1] E[+]*[0-9]+[.]*[0-9]* F[0-9]+] single extrude, feedrate at the end \n"
    "match [^G[0-1] F[0-9]+ E[+]*[0-9]+[.]*[0-9]*] single extrude, feedrate at the beginning \n"
    "match 	[^M104 ] Set extruder temp \n"
    "match 	[^M109 ] Set extruder temp and wait \n"
    "match 	[^M140 ] Set bed temp \n"
    "match 	[^M190 ] Wait for bed temp to reach target \n"
    "match 	[^M141 ] Set chamber temp \n"
    "match 	[^M191 ] Wait for chamber temp to reach target \n"
    "match 	[^M116 ] Wait \n"
    "match 	[^M106 ] Fan on \n"
    "match 	[^M107 ] Fan off \n"
    "match 	[^M101 ] Turn extruder 1 on \n"
    "match 	[^M102 ] Turn extruder 1 on reverse \n"
    "match 	[^M103 ] Turn all extruders off \n"
    "match 	[^M128 ] Extruder pressure PWM \n"
    "remove 2	[(G[0|1] .*)(E[+]*[0-9]+[.]*[0-9]*)(.*)] Remove Extrude value \n"
)


class DryrunPlugin(octoprint.plugin.SettingsPlugin,
                   octoprint.plugin.AssetPlugin,
                   octoprint.plugin.TemplatePlugin,
                   octoprint.plugin.SimpleApiPlugin):

    # var
    dryRunEnabled = False

    def on_gcode_queuing(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):

        # needed to handle non utf-8 characters
        command_string = cmd.encode('ascii', 'ignore')

        parsed_command = Commands.parse(command_string)
        if parsed_command.error is not None:
            self._logger.error(
                "An error occurred while parsing the command string.  Details: {0}".format(parsed_command.error)
            )
            # Send the original unaltered command
            return None,

        if parsed_command.cmd is not None:
            if self.dryRunEnabled == True:
                alteredCommands = Commands.alter_for_test_mode(parsed_command)
                return alteredCommands

        # Send the original unaltered command
        return None

    ## Web-UI - Stuff
    # list all callowed ommands/parameter that are valid to send from the web-ui
    def get_api_commands(self):
        # command with parameters
        return dict(checkboxState=["checkboxValue"],
                    disable=[],
                    abort=[])

    # ~~ TemplatePlugin mixin
#    def get_template_configs(self):
#        return [
#            dict(type="settings", custom_bindings=True)
#        ]


    def on_api_command(self, command, data):
        #if not user_permission.can():
        #    return make_response("Insufficient rights", 403)
        if command == "checkboxState":
            self.dryRunEnabled = bool(data["checkboxValue"])

    ## Needed for resetSettings
    def on_api_get(self, request):
        if len(request.values) != 0:
            action = request.values["action"]
            ## RESET Settings Handling
            if ("isResetSettingsEnabled" == action):
                return flask.jsonify(enabled="true")

            if ("resetSettings" == action):
                self._settings.set([], self.get_settings_defaults())
                self._settings.save()
                return flask.jsonify(self.get_settings_defaults())

    ##~~ SettingsPlugin mixin
    def get_settings_defaults(self):
        return dict(
            ## Not used at the moment
            excludeExpressions=DEFAULT_EXCLUDE_EXPRESSIONS
        )

    ##~~ AssetPlugin mixin
    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        return dict(
            js=["js/DryRun.js",
                "js/ns-autogrow.js",
                "js/autosize.js",
                "js/numberedtextarea.js",
                "js/ResetSettingsUtil.js",
                ],
            css=["css/DryRun.css",
                 "css/numberedtextarea.css"],
            less=["less/DryRun.less"]
        )

    # core UI here.

    ##~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://github.com/foosel/OctoPrint/wiki/Plugin:-Software-Update
        # for details.
        return dict(
            DryRun=dict(
                displayName="DryRun Plugin",
                displayVersion=self._plugin_version,

                # version check: github repository
                type="github_release",
                user="OllisGit",
                repo="OctoPrint-DryRun",
                current=self._plugin_version,

                # update method: pip
                pip="https://github.com/OllisGit/OctoPrint-DryRun/archive/{target_version}.zip"
            )
        )


# If you want your plugin to be registered within OctoPrint under a different name than what you defined in setup.py
# ("OctoPrint-PluginSkeleton"), you may define that here. Same goes for the other metadata derived from setup.py that
# can be overwritten via __plugin_xyz__ control properties. See the documentation for that.
__plugin_name__ = "DryRun Plugin"


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = DryrunPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.comm.protocol.gcode.queuing": (__plugin_implementation__.on_gcode_queuing, -1),
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
