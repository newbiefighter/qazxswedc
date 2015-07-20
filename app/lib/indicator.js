/**
 * Indicator window with a spinner and a label
 * 
 * @param {Object} args
 */
function createIndicatorWindow(args) {
    var _opened = false;
    var width = 160,
        height = 50;
    var args = args || {};
    var top = args.top || 300;
    var text = args.text || L('loading');
    
    var win = Titanium.UI.createWindow({
        height:height,
        width:width,
        top:top,
        borderRadius:5,
        touchEnabled:false,
        backgroundColor:'#000',
        opacity:0.6
    });
    
    var view = Ti.UI.createView({
        width:Ti.UI.FILL,
        height:Ti.UI.FILL,
        center: {x:(width/2), y:(height/2)},
        layout:'horizontal'
    });
    
    function osIndicatorStyle() {
        var style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
        
        if ('iPhone OS' !== Ti.Platform.name) {
            style = Ti.UI.ActivityIndicatorStyle.PLAIN;            
        }
        
        return style;
    }
     
    var activityIndicator = Ti.UI.createActivityIndicator({
        style:osIndicatorStyle(),
        left:0,
        height:Ti.UI.FILL,
        width:30
    });
    
    var label = Titanium.UI.createLabel({
        left:10,
        width:Ti.UI.FILL,
        height:Ti.UI.FILL,
        text:text,
        color: '#fff',
        font: {fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'bold'},
    });

    view.add(activityIndicator);
    view.add(label);
    win.add(view);

    function openIndicator() {
        if(_opened){
            return;
        }
        win.open();
        activityIndicator.show();
        _opened = true;
    }
    
    win.openIndicator = openIndicator;
    
    function closeIndicator() {
        if(!_opened){
            return;
        }
        activityIndicator.hide();
        win.close();
        _opened = false;
    }
    
    win.closeIndicator = closeIndicator;

    if ('iPhone OS' !== Ti.Platform.name) {
        win.addEventListener('open', function(){    
            win.activity.actionBar.hide();
        });
    }
    return win;
}

// Public interface
exports.createIndicatorWindow = createIndicatorWindow;
