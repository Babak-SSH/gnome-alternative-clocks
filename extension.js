const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();


date_menu = Main.panel.statusArea.dateMenu.actor;

var orig_clock = null;
var box = null;
var new_clock = null;


MhinClock.prototype = {
    _init: function(){
    },
  
    BuildTime: function() {}
}


TimeTuner.prototype = {
    _init: function(){
    },
  
    BuildTime: function() {}
}


BinaryClock.prototype = {
    _init: function(){
    },
  
    BuildTime: function() {}
}


FuzzyClock.prototype = {
    _init: function(){
        this.label = new St.Label();
        new_clock.add_child(this.label);
    },
  
    BuildTime: function() {
        scale = 5
        adverbs = ['exactly ', 'around ', 'almost ']
        hourList = [' ONE', ' TWO', ' THREE', ' FOUR', ' FIVE', ' SIX',
                    ' SEVEN', ' EIGHT', ' NINE', ' TEN', ' ELEVEN', ' TWELVE']
        minuteList = ['FIVE', 'TEN', 'QUARTER', 'TWENTY', 'TWENTY-FIVE', 'HALF']
        time = 'It\'s '

        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();

        //changing to 24hr format.
        if (hours <= 12) {
        hours += 12;
        }
        
        dmin = minutes % scale    //used to determine the right adverb.

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
    
    //new_clock is the box that will be replaced with default clock.
    //box is the selected clocks prototype.
    new_clock = new St.BoxLayout();
    box = new FuzzyClock();

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