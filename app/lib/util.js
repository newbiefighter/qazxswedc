function refreshLabel(view){
    //Ti.API.info(JSON.stringify(view));
    if(view.type == 'TableViewSection'){
        view.setHeaderTitle(L(view.cus_title));
        var children = view.getRows();
        for (var i = 0; i < children.length; i++) {
            Ti.API.info(children[i].cus_title);
            children[i].setTitle(L(children[i].cus_title));
        };
    }
    
}

/*
*   check for network, if offline, show alert
*/
function networkLostAlert(){
    // support in next version
    // TODO
    return;
    var currentWin = Ti.App.current_window;
    if(!currentWin.networkAlertBarExist){    
        //Ti.API.info('comein');
        var alertBar = Ti.UI.createLabel({
            id:'network_alert_bar',
            zIndex:9999,
            top:-40,
            lef:0,
            width:Ti.UI.FILL,
            height:40,
            backgroundColor:'red',
            color:'white',
            textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER,
            text:'Network is not connected...'
        });
        currentWin.add(alertBar);
        currentWin.networkAlertBarExist = true;
        Ti.API.info(alertBar);
    }
    
    var slideDown =  Ti.UI.createAnimation({top:0,duration:500});
    var slideUp =  Ti.UI.createAnimation({top:-40});

    var alert_bar;
    //Ti.API.info(JSON.stringify(currentWin.children));
    
    for(var child in currentWin.children){

        if(currentWin.children[child].id == 'network_alert_bar'){
            alert_bar = currentWin.children[child];
            break;
        }
    }
    //Ti.API.info(alert_bar);

    if(Ti.Network.online){
        alert_bar.animate(slideUp);
    }else{
        alert_bar.animate(slideDown);
    }

}

function generateCaptcha(){
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function smsService(phone){
    var rand = generateCaptcha();
    
    var toUrl = "http://api3.ablemobile.com/service/smsapi2.asmx/SendMessage",
        username = "ekuga",
        password = "DFT8393HH",
        message = L("message_before")+rand,
        countryCode = "852";
    // Ti.API.info(message);
    // return;
    var client = Ti.Network.createHTTPClient({
         // function called when the response data is available
         onload : function(e) {
             Ti.API.info("Received text: " + this.responseText);
             Ti.App.Properties.setString('captcha',rand);
             setTimeout(function(){
                Ti.App.Properties.setString('captcha',false);
             },1000*600);
         },
         // function called when an error occurs, including a timeout
         onerror : function(e) {
             alert('Please check your signal and try again.');
         },
         timeout : 5000  // in milliseconds
     });
     // Prepare the connection.
    client.open("POST", toUrl);
     // Send the request.
    var params = {
        "Username":username,
        "Password":password,
        "Message":message,
        "CountryCode":countryCode,
        "Telephone":phone,
        "Hex":'',
        "UserDefineNo":''
    };
    client.send(params);
}


module.exports = {
    refreshLabel : refreshLabel,
    networkLostAlert: networkLostAlert,
    smsService : smsService
}