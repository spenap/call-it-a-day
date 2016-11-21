#!/usr/bin/env gjs

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const DEFAULT_TIMEOUT = 25000;

const ScreenSaverInterface = '<node> \
    <interface name="org.gnome.ScreenSaver">\
        <method name="Lock" />\
        <method name="GetActive">\
            <arg name="active" direction="out" type="b" />\
        </method>\
        <method name="SetActive">\
            <arg name="value" direction="in" type="b" />\
        </method>\
        <method name="GetActiveTime">\
            <arg name="value" direction="out" type="u" />\
        </method>\
        <signal name="ActiveChanged">\
            <arg name="new_value" type="b" />\
        </signal>\
    </interface>\
</node>';

// Declare the proxy class based on the interface
const ScreenSaverProxy = Gio.DBusProxy.makeProxyWrapper(ScreenSaverInterface);

const TimeKeeper = new Lang.Class({
    Name: 'TimeKeeper',
    _init: function() {
	log("Ctor");
	this._mainLoop = new GLib.MainLoop(null, false);
	this._alarmId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 
					 DEFAULT_TIMEOUT,
					 Lang.bind(this, this._timeout_cb));
	this._screenSaverProxy = new ScreenSaverProxy(
	    Gio.DBus.session,
	    "org.gnome.ScreenSaver",
	    "/org/gnome/ScreenSaver"
	);
	this._screenSaverProxy.connectSignal("ActiveChanged",
					     Lang.bind(this, this._activechanged_cb));
    },
    _timeout_cb: function() {
	log("Timeout callback. Exiting");
	this._mainLoop.quit();
    },
    _activechanged_cb: function(proxy) {
	log("Screen active state changed.");
	let active = proxy.GetActiveSync();
	if (active == "true") {
	    log("The screen is locked");
	} else {
	    log("The screen is unlocked");
	}
    },
    run: function() { 
	this._mainLoop.run(); 
    },
});

let tk = new TimeKeeper();
tk.run();
