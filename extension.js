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

const Main = imports.ui.main;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TK = Me.imports.timekeeper;

let label, button, timeKeeper;

function _hideHello() {
    Main.uiGroup.remove_actor(label);
    label = null;
}

function _showHello(expired) {
    let labelText = "You can call it a day at " + timeKeeper.getAlarmTime();
    if (expired) {
	labelText = "You can call it a day now!";
    }

    if (!label) {
        label = new St.Label({ style_class: 'helloworld-label', text: labelText });
        Main.uiGroup.add_actor(label);
    }

    label.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    label.set_position(monitor.x + Math.floor(monitor.width / 2 - label.width / 2),
                       monitor.y + Math.floor(monitor.height / 2 - label.height / 2));

    Tweener.addTween(label,
                     { opacity: 0,
                       time: 5,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'preferences-system-time-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', function() { _showHello(false); });
}

function enable() {
    timeKeeper = new TK.TimeKeeper(TK.WORK_DAY, function() { _showHello(true); });
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
    timeKeeper = null;
}
