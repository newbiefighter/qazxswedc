Ti.App.global_nav = $.navTab;
Ti.App.current_window = $.currentWin;
//registerNotification();

if(Ti.Platform.name != "iPhone OS"){
    buildTabbedbarForAndroid();
}else{
    //$.tbr.setWidth(Ti.Platform.displayCaps.platformWidth);
}

var _all = [],
    _hkIsland = [],
    _kowloon = [],
    _new_terr = [],
    _overlay;
var isToggled = false;


//**************************************

//slide view after clicking menu Button
var leftMenu    = Ti.UI.createView({
    backgroundColor: '#888888',
    top:   0,
    left:  0,
    width: 150,
    height: Ti.UI.Fill,
    layout:'vertical'
    //zIndex: 2
});

var image = Ti.UI.createImageView({
    top:'5%',
    borderRadius: 40,
    image:'/images/portrait.png',
    width:88,
    height:88
});
var currentUser = Ti.UI.createLabel({
    color:'#fff',
    width:Ti.UI.SIZE,
    height:Ti.UI.SIZE
});

// var loggedMenuData = [{title:L('my_account'), id:'account',color:'white'},{title:L('my_order'),id:'order_list',color:'white'},
//     {title:L('setting'),id:'setting',color:'white'},{title:"Contact us",id:'contact_us',color:'white'}],
//     newerMenuData = [{title:L('login'), id:'login',color:'white'},{title:L('setting'),id:'setting',color:'white'}];
//var newerMenuData = [{title:L('login'), id:'login',color:'white'},{title:L('setting'),id:'setting',color:'white'}];
var tableView   = Ti.UI.createTableView({ 
    top:"10%",
    backgroundColor: '#888888',
    allowSelection: true,
    font:{
        fontSize:14
    },
    data: buildMenuTable(Cloud.sessionId)
});
tableView.footerView = Ti.UI.createView({
    height: 1,
    backgroundColor: 'transparent'
});
leftMenu.add(tableView);
$.currentWin.add(leftMenu);
if(Cloud.sessionId){
    currentUser.setText(Ti.App.global_username);
    image.setImage(Ti.App.global_photoUrl ? Ti.App.global_photoUrl : '/images/portrait_account.png'); 
    
}
//var but = Ti.UI.createButton({title:'button',width:Ti.UI.SIZE,height:Ti.UI.SIZE});


function buildTabbedbarForAndroid(){

    // var spacer = Math.round(Ti.Platform.displayCaps.platformWidth*0.25);
    // var width = spacer-4;
    var height = 36;
    var tab = [];
    var tabTexts = [L('district_all'),L('hk_island'),L('kowloon'),L('new_territories')];
    var currTab;
    // TAB BAR
    var tabBar = Ti.UI.createView({
        width:Ti.UI.FILL,
        height:40,
        left:0,
        top:0,
        backgroundColor:'#000',
        layout:'horizontal'
    });
    
    for(var i=0; i<4; i++){
        tab[i] = Ti.UI.createView({
            width:'24.5%',
            height:height,
            left:2,
            top:2,
            backgroundColor: i==0 ? '#70c5a8':'#fff',
            borderRadius:2,
            index:i
        });
        var tabLabel = Ti.UI.createLabel({
            text:tabTexts[i],
            color: i==0 ? '#fff':'#70c5a8',
        });
        tab[i].add(tabLabel);
        tabBar.add(tab[i]);
        if(i == 0){
            currTab = tab[0];
        }

        tab[i].addEventListener('click',function() {
            if(currTab == this){
                return;
            }
            // ui
            currTab.backgroundColor = '#fff';
            currTab.children[0].color = '#70c5a8';
            this.backgroundColor = '#70c5a8';
            this.children[0].color = '#fff';
            currTab = this;

            //data
            setRegionTabData(this.index);
        });
    }
    $.tbview.add(tabBar);
    //win.open();
}


// window initial
function showIndicator(){
    render(true);
    if(Cloud.sessionId){
        render(false);
    }
    
}


function buildMask(current){
    var style;
    if (Ti.Platform.name === 'iPhone OS'){
      style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
    }
    else {
      style = Ti.UI.ActivityIndicatorStyle.PLAIN;
    }
    _overlay = Ti.UI.createView({
        backgroundColor : 'gray',
        height:50,
        width:100,
        borderRadius:5,
        zIndex:999,
        
    });
    var actInd = Titanium.UI.createActivityIndicator({
        height:30,
        width:30,
        style:style,
        message:L('loading'),
        color:'white'
    });
    
    _overlay.add(actInd);
    if(current){
        $.currentWin.add(_overlay);
    }else{
        $.receivedWin.add(_overlay);
    }
    //loading indicator shows...
    actInd.show();
}

function buildItem(order){
    
    var iconSrc=['/images/status_nottaken.png','/images/status_taken.png','/images/status_finish.png','/images/status_cancel.png'];
    var orderNumber = '#'+order.sender.substring(order.sender.length - 4)+order.id.substring(order.id.length - 6);
    var periodText = order.period.slice(0,-1) + L('hour_unit');
    var startHour = order.startHour >= 12 ?  order.startHour - 12 +'pm' : order.startHour + 'am';
    var endHour = parseInt(order.startHour) + parseInt(order.period.slice(0,-1));
    endHour = endHour >= 12 ? endHour - 12 + 'pm' : endHour + 'am';
    var rangeText = startHour + ' - '+ endHour;
    var item = {
        id:order.id,
        typeImg:{image:order.service_type === 0 ? '/images/tryonce.png':'/images/consistent.png'},
        date:{text:order.date},
        region:{text:order.address.region.title},
        address:{text:order.address.detail},
        period:{text:periodText},
        range:{text:order.service_type === 0 ? rangeText : ''},
        fee:{text:order.fee},
        special_req:{text:order.special_req},
        status: order.status,
        statusImg:{image:iconSrc[order.status == -1 ? 3 : order.status]},
        orderNum :{text:orderNumber},
        properties:{searchableText:orderNumber},
        sender:order.sender
    };
    return item;
}

function refreshList(current,e){
    if(current){
        _all = [],
        _hkIsland = [],
        _kowloon = [],
        _new_terr = [];
        for (var i = 0; i < e.orders.length; i++) {
            var order = e.orders[i];
            
            var item =buildItem(order);
            // hkisland:0 ; kowloon:1 ; new territories:2
            var district_code = order.address.district.value;
            if(district_code == 0){
                _hkIsland.push(item);
            }else if(district_code == 1){
                _kowloon.push(item);
            }else if(district_code == 2){
                _new_terr.push(item);
            }
            _all.push(item);

        }
        $.section.setItems(_all);
    }else{
        var receivedList = []; 
        for (var i = 0; i < e.orders.length; i++) {
            var order = e.orders[i];
            var item =buildItem(order);    
            receivedList.push(item);
        }
        $.section2.setItems(receivedList); 
    }
    
    
    
              
}

function render(current){
    Indicator.openIndicator();
    //buildMask(current);
    var clause = {
        status: 0
    };
    var test = Ti.App.global_userId;
    if(!current){
        clause = {
            //status: 1,   
            taken_by: Ti.App.global_userId
        }
    }
    Cloud.Objects.query({
        classname: 'orders',
        limit:1000,
        where: clause
    }, function (e) {
        if (e.success) {
            refreshList(current,e);  
        } else {
            Indicator.closeIndicator();
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
        //remove indicator
        Indicator.closeIndicator();
        
    });
}



function updateBothList(item){
    Cloud.Objects.update({
        classname: 'orders',
        id: item.id,
        fields: {
            status:1,
            taken_by:Ti.App.global_userId
        }
    }, function (e) {
        if (e.success) {
            render(true);
            sendNotification(item.sender);
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}

function sendNotification(to_id){
    Cloud.Users.show({
        user_id:to_id
    }, function (e) {
        if(e.success){
            var user = e.users[0];
            if(user.custom_fields.notification == 'off'){
                Ti.API.info('notification is off');
                return;
            }
            var param;
            if(user.custom_fields.noti_sound == 'on' && user.custom_fields.noti_vibrate == 'on'){
                param = {
                    "alert": L("orderTaken"),
                    //"badge": "+1",
                    "sound": "default",
                    "vibrate": true
                };
            }else if(user.custom_fields.noti_sound == 'on' && user.custom_fields.noti_vibrate == 'off'){
                param = {
                    "alert": L("orderTaken"),
                    "sound": "default"
                };
            }else if(user.custom_fields.noti_sound == 'off' && user.custom_fields.noti_vibrate == 'on'){
                param = {
                    "alert": L("orderTaken"),
                    "vibrate": true
                };
            }else{
                param = {
                    "alert": L("orderTaken")
                };
            }
            var notiParam ={
                channel: 'user',
                payload: param,
                to_ids:to_id
            };
            Cloud.PushNotifications.notify(notiParam,function (e1) {
                if (e1.success) {
                    TiDialog(L('order_taken_success'));
                }
            });

        }
    });

}




















function refreshMenu(level) {
    if(Cloud.sessionId){
        if(Ti.App.global_username){
            currentUser.setText(Ti.App.global_username);
        }
        if(Ti.App.global_photoUrl){
            image.setImage(Ti.App.global_photoUrl);
        }
        
        if(level == 1){
            
            // after login
            leftMenu.remove(tableView);
            tableView.setData(buildMenuTable(true)); 
                 
            leftMenu.add(image);
            leftMenu.add(currentUser);
            leftMenu.add(tableView);
        }
        
    }else{
        leftMenu.remove(image);
        leftMenu.remove(currentUser);
        tableView.setData(buildMenuTable(false));
    }
    Ti.App.menu_refresh = -1;
}


function buildMenuTable(logged){
    var menuData,menuImg; 
    if(logged){
        menuData = [[L('my_account'),'account'],[L('setting'),'setting'],[L('noticeboard'),'noticeboard'],[L('contact_us'),'contact']];
        menuImg = ['/images/account.png','/images/setting.png','/images/noticeboard.png','/images/contact.png'];
    }else{
        menuData = [[L('login'),'login'],[L('setting'),'setting'],[L('noticeboard'),'noticeboard'],[L('contact_us'),'contact']];
        menuImg = ['/images/account.png','/images/setting.png','/images/noticeboard.png','/images/contact.png'];
    }
    var tableData = [];
    for (var i = 0; i < menuData.length; i++) {
        var row = Ti.UI.createTableViewRow({
            className:'menuTable', // used to improve table performance
            backgroundSelectedColor:'white',
            id:menuData[i][1], // custom property, useful for determining the row during events
            height:35,
            layout:"horizontal"
        });
      
        var imageAvatar = Ti.UI.createImageView({
            image: menuImg[i],
            width:29, 
            height:29,
            left:"10%"
        });
        row.add(imageAvatar);
      
        var label = Ti.UI.createLabel({
            color:'#fff',
            font:{fontFamily:'Arial', fontSize:14,fontWeight : 'bold'},
            text:menuData[i][0],
            width:Ti.UI.SIZE, height: Ti.UI.SIZE,
            left:5
        });
        row.add(label);
        tableData.push(row);
    }
    return tableData;
}



function menuClick(){
    var animateLeft= Ti.UI.createAnimation({
        left: 0,
        //width:Ti.Platform.name == "iPhone OS" ? Ti.UI.FILL : 450,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 300
    });
    var animateRight = Ti.UI.createAnimation({
        left: 150,
        //width:450,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 300
    });
    //Ti.API.info(isToggled);
    if(isToggled){
        $.main.animate(animateLeft);
        isToggled = false;
        if (Ti.Platform.name === "iPhone OS") {
            Ti.App.current_window.setTabBarHidden(false);
        }
    }else{
        $.main.animate(animateRight);
        if(Ti.App.menu_refresh ||Ti.App.menu_refresh > 0){
            refreshMenu(Ti.App.menu_refresh); 
        }
        isToggled = true;
        if (Ti.Platform.name === "iPhone OS") {
            Ti.App.current_window.hideTabBar();
        }else{
            $.main.fireEvent('focus');
        }
    }
}



function setRegionTabData(index){
    switch(index){
        case 0:
            $.section.setItems(_all);
            break;
        case 1:
            $.section.setItems(_hkIsland);
            break;
        case 2:
            $.section.setItems(_kowloon);
            break;
        case 3:
            $.section.setItems(_new_terr);
            break;
    }
}



// Event Listener ***************************


$.listview.addEventListener('itemclick', function(e){
    var item = $.section.getItemAt(e.itemIndex);
    if(e.bindId == 'grabImg'){
        if(!Cloud.sessionId){
            TiDialog(L('login_first'),'Tips');
            return;
        }
        var dialog = Ti.UI.createAlertDialog({
            cancel:0,
            buttonNames: [L('cancel'),L('confirm')],
            message: L('grab_text'),
            title: L('grab')
        });
        dialog.addEventListener('click',function(e1){
            
            if(e1.index === e1.source.cancel){
                dialog.hide();
                return;
            }
            //TODO order taken process
            updateBothList(item);

        });
        dialog.show();
    }else{
        var item = e.section.getItemAt(e.itemIndex);
        var detailWin = Alloy.createController('detail',{_param:item,_private:false}).getView(); 
        var nav = Ti.App.global_nav;
        nav.open(detailWin);
    }
    
});

$.listview2.addEventListener('itemclick',function(e){
    var item = e.section.getItemAt(e.itemIndex);
    var detailWin = Alloy.createController('detail',{_param:item,_private:true}).getView();
    //var nav = Ti.App.global_nav;
    $.receivedTab.open(detailWin);
    //detailWin.open();
    
});
if(Ti.Platform.name == "iPhone OS"){
    $.listview.addEventListener('pull',function(e){
        render(true);
    });

    $.listview.addEventListener('pullend',function(e){
        
    });
    $.listview2.addEventListener('pull',function(e){
        render(false);
    });

    $.listview2.addEventListener('pullend',function(e){
        
    });

    $.tbr.addEventListener('click',function(e){
        setRegionTabData(e.index)
    });
    // only refresh menu when Ti.App.menu_refresh == true 
    $.menuBtn.addEventListener('click',function(e){
        //datePickerView.animate(slideOut);
        menuClick();
    });

    $.menuBtn2.addEventListener('click',function(e){
        $.navTab.setActive(true);
        menuClick();
    });
}





tableView.addEventListener('click',function(e){
    
    var newWin;
    switch(e.rowData.id){
        
        case 'login':
            newWin = Alloy.createController('login').getView();   
            break;
        case 'order_list':
            newWin = Alloy.createController('list').getView();
            break;
        case 'account':
            newWin = Alloy.createController('account').getView();
            break;
        case 'setting':
            newWin = Alloy.createController('setting').getView();
            break;
        case 'contact':
            newWin = Alloy.createController('aboutus').getView();
            break;
            //contactUs();
        case 'noticeboard':
            newWin = Alloy.createController('noticeboard').getView();
            break;
        case 'aboutus':
            newWin = Alloy.createController('aboutus').getView();
            break;
   
    }
    if(!newWin){
        return;
    }
    $.navTab.open(newWin,{transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
    menuClick();
});




$.currentWin.addEventListener('focus',function(){
    Ti.App.current_window = this;
    if(Ti.App.language_changed){
        Ti.App.language_changed = false;
        this.close();
        setTimeout(function () {
            var ayi_order = Alloy.createController('ayi_order').getView(); 
            ayi_order.open();
        }, 300);
    }

});
$.receivedWin.addEventListener('focus',function(){
    Ti.App.current_window = this;
});
$.navTab.addEventListener('focus',function(e){

    if(Ti.App.list_refresh){
        render(true);
        Ti.App.list_refresh = false;
    }
});
$.receivedTab.addEventListener('focus',function(e){
    if(!Cloud.sessionId){
        TiDialog(L('login_first'),'Tips');
        $.navTab.setActive(true);
        return;
    }
    
    // if($.section2.getItems().length == 0 || Ti.App.list_refresh == true){
    //     render(false);
    //     Ti.App.list_refresh = false;
    // }
    //Ti.App.global_nav = $.receivedTab;
});


$.navGroup.addEventListener('open',function(){
    if (Ti.Platform.osname === "android") {
        var activity = this.getActivity();
        activity.addEventListener('resume', function(){
            render(true);
            if(Cloud.sessionId){
                render(false);
            }
        });
        activity.onCreateOptionsMenu = function(e){ 
            var menu = e.menu; 
            var menuItem = menu.add({ 
                title : L('refresh'), 
                //icon : "images/hand.png", 
                showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS 
            }); 
            menuItem.addEventListener("click", function(e) { 
                render(Ti.App.current_window.id == 'currentWin');
            }); 
        }
        var actionBar = activity.actionBar;
        if (actionBar) {
            actionBar.icon = "/images/menu.png";
            actionBar.title = L('main_menu');
            actionBar.onHomeIconItemSelected = function() {
                $.navTab.setActive(true);
                menuClick();
            };
        }
    }
});


























