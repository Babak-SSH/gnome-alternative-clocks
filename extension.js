const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();


date_menu = Main.panel.statusArea.dateMenu.actor;

let orig_clock = null;
let box = null;
let new_clock = null;


class MhinClock {
    constructor(){
    }
  
    BuildTime() {}
}


class TimeTuner {
    constructor(){
    }
  
    BuildTime() {}
}


class BinaryClock {
    constructor(){
    }
  
    BuildTime() {}
}


class FuzzyClock {
    constructor(){
        this.label = new St.Label();
        new_clock.add_child(this.label);
    }
  
    BuildTime() {
        var scale = 5
        var adverbs = ['exactly ', 'around ', 'almost ']
        var hourList = [' ONE', ' TWO', ' THREE', ' FOUR', ' FIVE', ' SIX',
                    ' SEVEN', ' EIGHT', ' NINE', ' TEN', ' ELEVEN', ' TWELVE']
        var minuteList = ['FIVE', 'TEN', 'QUARTER', 'TWENTY', 'TWENTY-FIVE', 'HALF']
        var time = 'It\'s '

        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();

        //changing to 24hr format.
        if (hours <= 12) {
        hours += 12;
        }
        
        var dmin = minutes % scale    //used to determine the right adverb.

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
  }


function init() {}


function enable() {
    orig_clock = date_menu.get_children();
    
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

    date_menu.remove_all_children(orig_clock);
    date_menu.add_child(new_clock);
    signalID = date_menu.connect("notify::text", box.BuildTime);
    box.BuildTime();
}


function disable() {
    date_menu.disconnect(signalID);
    date_menu.remove_all_children(new_clock);
    orig_clock.forEach(element => {
        e_menu.add_child(element)    
    });
}