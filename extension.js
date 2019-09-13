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

const LINE_WIDTH = 2;
// marging around the entire clock top & bottom (px)
const MARGIN = 1;
// padding square and the black centre
const PADDING = 2;

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
        this.bs = Math.floor((panel.PANEL_ICON_SIZE - 2 * MARGIN - LINE_WIDTH) / 2);
        this.rect.set_width(6*this.bs + 5*LINE_WIDTH);
        this.rect.set_height(panel.PANEL_ICON_SIZE-2*MARGIN);
        if (this.bs % 2) {
            this.bs -= 1;
        }
        let height = 2 * this.bs + LINE_WIDTH;
        this.rect.set_width(6 * this.bs + 5 * LINE_WIDTH);
        this.rect.set_height(height);
        new_clock.add_child(this.rect);
        this.rect.connect('repaint', Lang.bind(this, this.BuildClock));
    }
  
    BuildClock() {
        let now = new Date();
        // this.time_label.set_text(now.toLocaleFormat(this.time_format))
        this.display_time = [now.getHours(), now.getMinutes()];

        let cr = this.rect.get_context();
        let theme_node = this.rect.get_theme_node();

        let area_height = this.rect.get_height();
        let area_width = this.rect.get_width();

        // Draw background
        Clutter.cairo_set_source_color(cr, theme_node.get_foreground_color());
        cr.setLineWidth(LINE_WIDTH);
        cr.rectangle(0, 0, area_width, area_height);
        cr.fill();

        // Draw grid
        cr.setSourceRGBA(0, 0, 0, 0);
        cr.setOperator(Cairo.Operator.CLEAR);
        // ensure no fuzziness
        let halfHeight = Math.floor(area_height / 2) + (LINE_WIDTH % 2 ? 0.5 : 0);
        cr.moveTo(0, halfHeight);
        cr.lineTo(area_width, halfHeight);
        cr.stroke();

        // Draw dots (precache some stuff)
        let dim = this.bs - 2 * LINE_WIDTH, // dimension of internal box
        halfLineWidth = LINE_WIDTH / 2,
        blockWidth = this.bs + LINE_WIDTH;
        for (let p = 0; p < this.display_time.length; ++p) {
            for (let i = 0; i < 6; ++i) {
                let startx = i * blockWidth;
                let borderx = startx + this.bs + halfLineWidth; // FOR SURE

                // draw the border
                cr.moveTo(borderx, 0);
                cr.lineTo(borderx, area_height);
                cr.stroke();

                // draw the rectangle.
                if ((this.display_time[p] & (1 << (5 - i)))) {
                    cr.rectangle(
                        startx + PADDING,
                        p * blockWidth + PADDING,
                        dim,
                        dim
                    );
                    cr.fill();
                }
            }
        }
    }

    paint() {
        this.rect.queue_repaint();
        return true;
    }

    Run() {
        this.paint();
        Mainloop.timeout_add(100, this.paint.bind(this));
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
        this.BuildClock();
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