const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();


date_menu = Main.panel.statusArea.dateMenu.actor;

var orig_clock = null;
var box = null;
var new_clock = null;


function init() {}


function enable() {
    orig_clock = date_menu.get_children();

    box = new FuzzyClock();

    date_menu.remove_all_children(orig_clock);
    date_menu.add_child(new_clock);
    signalID = date_menu.connect("notify::text", box.FuzzyTime);
    last = box.label.get_text();
    box.FuzzyTime();
}


function disable() {
    date_menu.disconnect(signalID);
    date_menu.remove_all_children(new_clock);
    orig_clock.forEach(element => {
        e_menu.add_child(element)    
    });
}