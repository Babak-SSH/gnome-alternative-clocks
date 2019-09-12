const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const Cairo = imports.cairo;
const Mainloop = imports.mainloop;
const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const panel = Main.panel;
const DATE_MENU = panel.statusArea.dateMenu.actor;

let orig_clock = null;
let box = null;
let new_clock = null;


class MhinClock {
    constructor(){
    }
  
    BuildClock() {}

    Run() {}
}


class TimeTuner {
    constructor(){
    }
  
    BuildClock() {}

    Run() {}
}


class BinaryClock {
    constructor() {
        this.rect = new St.DrawingArea();
        // Box size. Should be *even* and integer but still fit vertically.
        this.bs = Math.floor((Panel.PANEL_ICON_SIZE - 2 * MARGIN - LINE_WIDTH) / 2);
        if (this.bs % 2) {
            this.bs -= 1;
        }
        let height = 2 * this.bs + LINE_WIDTH;
        this.rect.set_width(6 * this.bs + 5 * LINE_WIDTH);
        this.rect.set_height(height);
        new_clock.add_child(this.rect);
    }
  
    BuildClock(area) {
        let now = new Date();
        let display_time = [now.getHours(), now.getMinutes()];
    }

    Run() {}
}


class FuzzyClock {
    constructor() {
        this.label = new St.Label();
        new_clock.add_child(this.label);
    }
  
    BuildClock() {
        let scale = 5
        let adverbs = ['exactly ', 'around ', 'almost ']
        let hourList = [' ONE', ' TWO', ' THREE', ' FOUR', ' FIVE', ' SIX',
                    ' SEVEN', ' EIGHT', ' NINE', ' TEN', ' ELEVEN', ' TWELVE']
        let minuteList = ['FIVE', 'TEN', 'QUARTER', 'TWENTY', 'TWENTY-FIVE', 'HALF']
        let time = 'It\'s '

        let pos = 0;
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();

        //changing to 24hr format.
        if (hours <= 12) {
        hours += 12;
        }
        
        let dmin = minutes % scale    //used to determine the right adverb.

        //pos is used in minuteList.
        if (minutes > 30) {
            pos = Math.round((60 - minutes) / scale)
        } 
        else {
            pos = Math.round(minutes / scale)
        }
        //specifing the adverb (almost, exactly, around).
        if (dmin == 0) {
            time += adverbs[0]
            pos -= 1
        } 
        else if(dmin <= scale/2){
            time += adverbs[1]
            if (minutes < 30)
                pos -= 1
        } 
        else{
            time += adverbs[2]
            if (minutes > 30)
                pos -= 1
        }
        //specifing the hour and minute words.
        if (minutes <= Math.round(scale/2)) {
            time += hourList[hours - 12 - 1]
        }    
        else if (minutes >= 60 - Math.round(scale/2)) {
            time += hourList[hours - 12 - 1]
        } 
        else {
            if (minutes > 30) {
                time += minuteList[pos] + ' to' + hourList[hours - 12]
            } 
            else {
                time += minuteList[pos] + ' past' + hourList[hours - 12 - 1]
            }
        }
        this.label.set_text(time);
        }

    Run() {
        Mainloop.timeout_add(100, Lang.bind(this, this.BuildClock));
    }
  }


function init() {}


function enable() {
    orig_clock = DATE_MENU.get_children();
    
    let GioSSS = Gio.SettingsSchemaSource;
    let schema = Me.metadata['settings-schema'];
    let schemaDir = Me.dir.get_child('schemas').get_path();
    let schemaSrc = GioSSS.new_from_directory(schemaDir, GioSSS.get_default(), false);
    let schemaObj = schemaSrc.lookup(schema, true);
    let _settings = new Gio.Settings({ settings_schema: schemaObj });

    //new_clock is the boxlayout that will be replaced with default clock.
    new_clock = new St.BoxLayout();
    //box is the selected clock.
    if (_settings.get_boolean('fuzzy-clock'))
        box = new FuzzyClock();
    else if (_settings.get_boolean('binary-clock'))
        box = new BinaryClock();
    else if (_settings.get_boolean('mhin-clcok'))
        box = new MhinClock();
    else if (_settings.get_boolean('time-tuner'))
        box = new TimeTuner();

    DATE_MENU.remove_all_children(orig_clock);
    DATE_MENU.add_child(new_clock);
    box.BuildClock();
}


function disable() {
    DATE_MENU.remove_all_children(new_clock);
    orig_clock.forEach(element => {
    DATE_MENU.add_child(element)    
    });
}