const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;
const Cairo = imports.cairo;
const Mainloop = imports.mainloop;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const panel = imports.ui.panel;
const DATE_MENU = Main.panel.statusArea.dateMenu.actor;

let orig_clock = null;
let box = null;
let new_clock = null;

const LINE_WIDTH = 2;
// marging around the entire clock top & bottom (px)
const MARGIN = 1;

class MhinClock {
    constructor(){
        this.rect = new St.DrawingArea();

        // TODO: define Clock Box size.

        new_clock.add_child(this.rect);
        // conecting rect to Build function with repaint signal.
        this.rect.connect('repaint', this.BuildClock.bind(this));
    }
  
    BuildClock() {}

    paint() {
        // mainloop repeates paint function 
        // and paint calls the repaint function
        // which calls the BuildClock function 
        // every second.
        this.rect.queue_repaint();
        return true;
    }

    Run() {
        // connecting to mainloop
        this.paint();
        Mainloop.timeout_add(1000, this.paint.bind(this));
    }
}


class TimeTuner {
    constructor(){
        this.rect = new St.DrawingArea();
        
        // Clock Box size.
        this.base = Math.floor((panel.PANEL_ICON_SIZE) - 2*MARGIN - LINE_WIDTH);  //  Box size
        this.rect.set_width(24*this.base + 24*LINE_WIDTH);
        this.rect.set_height(2*this.base + 2*LINE_WIDTH);        

        new_clock.add_child(this.rect);
        // conecting rect to Build function with repaint signal.
        this.rect.connect('repaint', this.BuildClock.bind(this));
    }
  
    BuildClock() {
        let now = new Date();
        this.display_time = [now.getHours(), now.getMinutes()];

        let cr = this.rect.get_context();
        let theme_node = this.rect.get_theme_node();

        let area_height = this.rect.get_height();
        let area_width = this.rect.get_width();

        //  Draw background
        Clutter.cairo_set_source_color(cr, theme_node.get_foreground_color());
        cr.setLineWidth(LINE_WIDTH);
        cr.rectangle(0, 0, area_width, area_height);
        cr.fill();

        //  Draw grid
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.moveTo(0, area_height/2);
        cr.lineTo(area_width, area_height/2);
        cr.stroke();

        // Draw hour bars
        for (let i = 0;i < 24;i++) {
            cr.moveTo(i*(area_width/24), 0);
            cr.lineTo(i*(area_width/24), area_height/4);
            cr.stroke();
        }

        //Draw minute bars
        for (let i=0;i < 60;i++) {
            cr.moveTo(i*(area_width/60), area_height/2);
            if (i%5==0)
                cr.lineTo(i*(area_width/60), 3*area_height/4);
            else
                cr.lineTo(i*(area_width/60), 5*area_height/8);
            cr.stroke();
        }

        // Draw hour hand.
        cr.moveTo((this.display_time[0] + (this.display_time[1]/60))*(area_width/24), 0);
        cr.lineTo((this.display_time[0] + (this.display_time[1]/60))*(area_width/24), area_height/2);
        cr.stroke();

        //Draw minute hand.
        cr.moveTo(this.display_time[1] * (area_width/60), area_height/2);
        cr.lineTo(this.display_time[1] * (area_width/60), area_height);
        cr.stroke();
    }

    paint() {
        // mainloop repeates paint function 
        // and paint calls the repaint function
        // which calls the BuildClock function 
        // every second.
        this.rect.queue_repaint();
        return true;
    }

    Run() {
        // connecting to mainloop
        this.paint();
        Mainloop.timeout_add(1000, this.paint.bind(this));
    }
}


class BinaryClock {
    constructor() {
        this.rect = new St.DrawingArea();
        // Clock Box size.
        this.base = Math.floor((panel.PANEL_ICON_SIZE) - 2*MARGIN - LINE_WIDTH);  //  Box size
        this.rect.set_width(6*this.base + 6*LINE_WIDTH - 2);
        this.rect.set_height(2 * this.base + LINE_WIDTH);

        new_clock.add_child(this.rect);
        // conecting rect to Build function with repaint signal.
        this.rect.connect('repaint', this.BuildClock.bind(this));
    }
  
    BuildClock() {
        let now = new Date();
        this.display_time = [now.getHours(), now.getMinutes()];

        let cr = this.rect.get_context();
        let theme_node = this.rect.get_theme_node();

        let area_height = this.rect.get_height();
        let area_width = this.rect.get_width();

        //  Draw background
        Clutter.cairo_set_source_color(cr, theme_node.get_foreground_color());
        cr.setLineWidth(LINE_WIDTH);
        cr.rectangle(0, 0, area_width, area_height);
        cr.fill();

        //  Draw grid
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.moveTo(0, area_height/2);
        cr.lineTo(area_width, area_height/2);
        cr.stroke();

        //  Draw dots
        for (let p in this.display_time) {
            for (let i=0; i<6; ++i) {
                cr.moveTo((i+1)*(this.base + LINE_WIDTH/2) + i*(LINE_WIDTH/2), 0);
                cr.lineTo((i+1)*(this.base + LINE_WIDTH/2) + i*(LINE_WIDTH/2), area_height)
                cr.stroke();    
                if ((this.display_time[p] & (1 << (5-i)))) {
                    cr.rectangle(LINE_WIDTH + (this.base + LINE_WIDTH)*i, LINE_WIDTH + (this.base + LINE_WIDTH)*p, this.base-2*LINE_WIDTH, this.base-2*LINE_WIDTH);
                    cr.fill();
                }
            }
        }
    }

    paint() {
        // mainloop repeates paint function 
        // and paint calls the repaint function
        // which calls the BuildClock function 
        // every second.
        this.rect.queue_repaint();
        return true;
    }

    Run() {
        // connecting to mainloop
        this.paint();
        Mainloop.timeout_add(1000, this.paint.bind(this));
    }
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

        // changing to 24hr format.
        if (hours <= 12) {
        hours += 12;
        }
        
        let dmin = minutes % scale    // used to determine the right adverb.

        // pos is used in minuteList.
        if (minutes > 30) {
            pos = Math.round((60 - minutes) / scale)
        } 
        else {
            pos = Math.round(minutes / scale)
        }
        // specifing the adverb (almost, exactly, around).
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
        // specifing the hour and minute words.
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
        // connecting to mainloop
        this.BuildClock();
        Mainloop.timeout_add(100, this.BuildClock.bind(this));
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

    // new_clock is the boxlayout that will be replaced with default clock.
    new_clock = new St.BoxLayout();
    //box is the selected clock.
    if (_settings.get_boolean('fuzzy-clock'))
        box = new FuzzyClock();
    else if (_settings.get_boolean('binary-clock'))
        box = new BinaryClock();
    else if (_settings.get_boolean('mhin-clock'))
        box = new MhinClock();
    else if (_settings.get_boolean('time-tuner'))
        box = new TimeTuner();

    DATE_MENU.remove_all_children();
    DATE_MENU.add_child(new_clock);
    box.Run();
}


function disable() {
    DATE_MENU.remove_all_children();
    orig_clock.forEach(element => {
    DATE_MENU.add_child(element)    
    });
}   