
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const WORK_DAY = 7.25 * 60 * 60 * 1000;

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
        this._mainLoop = null;
        this._alarmId = GLib.timeout_add(GLib.PRIORITY_DEFAULT,
                                         WORK_DAY,
                                         Lang.bind(this, this._timeout_cb));
        this._initialTime = new Date();
        this._targetTime = new Date(this._initialTime.getTime() + WORK_DAY);
        log("The alarm is set for " + this._formatTime(this._targetTime));
        this._init_dbus();
    },
    _timeout_cb: function() {
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
