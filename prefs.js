//gnome imports
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain(DOMAIN);
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
//js imports
const DOMAIN = Me.metadata['gettext-domain'];
const config = imports.misc.config;
const _ = Gettext.gettext;
const FUZZY = 'fuzzy-clock';
const BINARY = 'binary-clock';
const MHIN = 'mhin-clcok';
const TUNER = 'time-tuner';


function init() {
    log(`initializing ${Me.metadata.name} Preferences`);
  }


function buildPrefsWidget() {
}