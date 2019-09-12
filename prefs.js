//gnome imports
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
//js imports
const DOMAIN = Me.metadata['gettext-domain'];
const Gettext = imports.gettext.domain(DOMAIN);
const config = imports.misc.config;
const _ = Gettext.gettext;
const FUZZY = 'fuzzy-clock';
const BINARY = 'binary-clock';
const MHIN = 'mhin-clock';
const TUNER = 'time-tuner';


const AlternativeClockWidget = new GObject.registerClass(
    class AlternativeClockWidget extends Gtk.Box {
    
        _init(params) {
            //reading the settings schema.
            super._init(params);
            let GioSSS = Gio.SettingsSchemaSource;
            let schema = Me.metadata['settings-schema'];
            let schemaDir = Me.dir.get_child('schemas').get_path();
            let schemaSrc = GioSSS.new_from_directory(schemaDir, GioSSS.get_default(), false);
            let schemaObj = schemaSrc.lookup(schema, true);
            this._settings = new Gio.Settings({settings_schema: schemaObj});
            //building grids.
            this._grid = new Gtk.Grid();
            this._grid.margin = 5;
            this._grid.row_spacing = 5;
            this._grid.column_spacing = 5;
            this._grid.set_column_homogenous = true;
            let btnPosition = _("Clocks");
            //writing versions.
            let shell_version = Me.metadata['shell-version'].toString();
            let version = Me.metadata['version'].toString() + shell_version;
            //defining radion buttons and grouping.
            this._fuzzyRB = new Gtk.RadioButton({label:_("Fuzzy Clock")});
            this._binaryRB = new Gtk.RadioButton({group:this._fuzzyRB, label:_("Binary Clock")});
            this._mhinRB = new Gtk.RadioButton({group:this._fuzzyRB, label:_("Binary Clock")});
            this._tunerRB = new Gtk.RadioButton({group:this._fuzzyRB, label:_("Binary Clock")});
    
            let rbGroup = new Gtk.Box({orientation:Gtk.Orientation.VERTICAL, homogeneous:false, margin_left:4, margin_top:2, margin_bottom:2, margin_right:4});
            rbGroup.add(this._fuzzyRB);
            rbGroup.add(this._binaryRB);
            rbGroup.add(this._mhinRB);
            rbGroup.add(this._tunerRB);
    
            this._fuzzyRB.connect('toggled', (b) => {
                if(b.get_active())
                    this._settings.set_boolean(FUZZY, true);
                else
                    this._settings.set_boolean(FUZZY, false);
            });
            
            this._binaryRB.connect('toggled', (b) => {
                if(b.get_active())
                    this._settings.set_boolean(BINARY, false);
                else
                    this._settings.set_boolean(BINARY, true);
            });
            this._mhinRB.connect('toggled', (b) => {
                if(b.get_active())
                    this._settings.set_boolean(MHIN, false);
                else
                    this._settings.set_boolean(MHIN, true);
              });
            this._tunerRB.connect('toggled', (b) => {
                if(b.get_active())
                    this._settings.set_boolean(TUNER, false);
                else
                    this._settings.set_boolean(TUNER, true);
            });
        
            let fuzzy = this._settings.get_boolean(FUZZY);
            let binary = this._settings.get_boolean(BINARY);
            let mhin = this._settings.get_boolean(MHIN);
            let tuner = this._settings.get_boolean(TUNER);
    
            this._fuzzyRB.set_active(fuzzy);
            this._binaryRB.set_active(binary);
            this._mhinRB.set_active(mhin);
            this._tunerRB.set_active(tuner);
    
            this._grid.attach(new Gtk.Label({ label: btnPosition, wrap: true, xalign: 0.5 }), 0,  8, 7, 1);
            this._grid.attach(rbGroup, 3, 10, 1, 3);
            this._grid.attach(new Gtk.Label({ label: version, wrap: true, xalign: 0.5 }), 0, 18, 7, 1);
            this.add(this._grid);
        }
    });


function init() {
    log(`initializing ${Me.metadata.name} Preferences`);
  }


function buildPrefsWidget() {
    let widget = new AlternativeClockWidget();
    widget.show_all();
    return widget;
}