# coding=utf-8
from __future__ import absolute_import
from octoprint.server import user_permission
from octoprint.events import eventManager, Events

import octoprint.plugin
from flask import make_response

from octoprint_DryRun.gcode_parser import Commands, ParsedCommand, Response

class DryrunPlugin(octoprint.plugin.SettingsPlugin,
                   octoprint.plugin.AssetPlugin,
                   octoprint.plugin.TemplatePlugin,
                   octoprint.plugin.EventHandlerPlugin,
                   octoprint.plugin.SimpleApiPlugin):

    # var
    dryRunEnabled = False

    def on_gcode_queuing(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
        if self.dryRunEnabled == True:
            command_string = ""
            if (isinstance(cmd, str) == True):
                command_string = cmd
            else:
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
                alteredCommands = Commands.alter_for_test_mode(parsed_command)
                return alteredCommands

        # Send the original unaltered command
        return None


    def on_event(self, event, payload):
        if event == Events.CLIENT_OPENED:
            # Send initial values to the frontend
            self._plugin_manager.send_plugin_message(self._identifier,
                                                     dict(dryRunEnabled=self.dryRunEnabled)
                                                     )


    ## Web-UI - Stuff
    # list all called commands/parameter that are valid to send from the web-ui
    def get_api_commands(self):
        # command with parameters
        return dict(checkboxState=["checkboxValue"],
                    disable=[],
                    abort=[])

    def on_api_command(self, command, data):
        if not user_permission.can():
            return make_response("Insufficient rights", 403)
        if command == "checkboxState":
            self.dryRunEnabled = bool(data["checkboxValue"])

    ##~~ AssetPlugin mixin
    def get_assets(self):
        # Define your plugin's asset files to automatically include in the
        return dict(
            js=["js/DryRun.js", "js/bootstrap-checkbox.js"],
            css=["css/DryRun.css"],
            less=["less/DryRun.less"]
        )

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
                #pip="https://github.com/OllisGit/OctoPrint-DryRun/archive/{target_version}.zip"
                pip="https://github.com/OllisGit/OctoPrint-DryRun/releases/latest/download/master.zip"
            )
        )

# If you want your plugin to be registered within OctoPrint under a different name than what you defined in setup.py
# ("OctoPrint-PluginSkeleton"), you may define that here. Same goes for the other metadata derived from setup.py that
# can be overwritten via __plugin_xyz__ control properties. See the documentation for that.
__plugin_name__ = "DryRun Plugin"
__plugin_pythoncompat__ = ">=2.7,<4"

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = DryrunPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.comm.protocol.gcode.queuing": (__plugin_implementation__.on_gcode_queuing, -1),
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
