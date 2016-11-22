/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Simon Pena <spenap@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const WORK_DAY = 7.25 * 60 * 60 * 1000;
const TEST_TIME = 3 * 1000;

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
    _init: function(targetTime, cb) {
        log("Ctor");
        this._mainLoop = null;
	if (!cb) {
	    cb = Lang.bind(this, this._default_timeout_cb);
	}
        this._alarmId = GLib.timeout_add(GLib.PRIORITY_DEFAULT,
                                         targetTime,
                                         cb);
        this._initialTime = new Date();
        this._targetTime = new Date(this._initialTime.getTime() + targetTime);
        log("The alarm is set for " + this._formatTime(this._targetTime));
        this._init_dbus();
    },
    _default_timeout_cb: function() {
        log("Timeout callback");
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
    _init_dbus: function() {
        this._screenSaverProxy = new ScreenSaverProxy(
            Gio.DBus.session,
            "org.gnome.ScreenSaver",
            "/org/gnome/ScreenSaver"
        );
        this._screenSaverProxy.connectSignal("ActiveChanged",
                                             Lang.bind(this, this._activechanged_cb));
    },
    _paddedPair: function(n) {
        return ('00'+n).slice(-2);
    },
    _formatTime: function(date) {
        return [this._paddedPair(date.getHours()),
                this._paddedPair(date.getMinutes())].join(":");
    },
    getAlarmTime: function() {
        return this._formatTime(this._targetTime);
    },
    run: function() {
        if (!this._mainLoop) {
            this._mainLoop = new GLib.MainLoop(null, false);
        }
        this._mainLoop.run();
    },
});
