if(Ti.Platform.name == "iPhone OS"){
    Ti.App.global_nav = $.navWin;
}else{
    // Ti.App.global_nav = $.navTab;
    // $.orderWin.setWindowSoftInputMode(Ti.UI.Android.SOFT_INPUT_ADJUST_PAN);
    // $.main.setScrollType('vertical');
}
// notification registration move to alloy.js
//registerNotification();
// if(Ti.Platform.name == "iPhone OS"){
    
// }else{
    
// }


//**************************************    global variables
var isToggled = false,
    _startingFare = 80;
//slide view after clicking menu Button
var leftMenu    = Ti.UI.createView({
    backgroundColor: '#adadad',
    top:   0,
    left:  0,
    width: 150,
    height: Ti.UI.Fill,
    layout:'vertical'
    //zIndex: 0
});

var image = Ti.UI.createImageView({
    top:20,
    borderRadius: 40,
    image:'/images/portrait.png', //default image in resource
    width:88,
    height:88
});

var currentUser = Ti.UI.createLabel({
    color:'#fff',
    width:Ti.UI.SIZE,
    height:Ti.UI.SIZE
});


var tableView   = Ti.UI.createTableView({ 
    top:"15%",
    backgroundColor: '#adadad',
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
if(Cloud.sessionId){
    currentUser.setText(Ti.App.global_username);
    image.setImage(Ti.App.global_photoUrl ? Ti.App.global_photoUrl : '/images/portrait_account.png');  
}
$.orderWin.add(leftMenu);


//****************************

//combobox address widget from MIT 
function Tw() {}
var Tw = require('widget/UI');

var comboDistrict = Tw.createCombobox({
    borderWidth : '1dp',
    borderRadius : '5dp',
    borderColor:'#d1d1d1',
    //labelSelect : 'select',
    width : Ti.UI.FILL,
    height : '30%',
    values : [{
        title : L('district0'),
        value : 0
    }, {
        title :L('district1'),
        value : 1
    },
    {
        title : L('district2'),
        value : 2
    }],
    selectedValueIndex : 0,
    multiple : false
});

var districtData = buildDistrictData();
 
var comboRegion = Tw.createCombobox({
    borderWidth : '1dp',
    borderRadius : '5dp',
    borderColor:'#d1d1d1',
    top:3,
    width : Ti.UI.FILL,
    height : '30%',
    values : districtData[0],
    selectedValueIndex : 0,
    multiple : false
});

var address = Ti.UI.createTextField({
    width:Ti.UI.FILL,
    height:"30%",
    left:0,
    top:3,
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    borderRadius : 7,
    borderColor:'#d1d1d1',
    borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    hintText: L('address_hint'),
    color:'#000'
});

$.combo_district.add(comboDistrict);
$.combo_district.add(comboRegion);
$.combo_district.add(address);

comboDistrict.addEventListener('TwChange', function(e){
    //Ti.API.info(e.data.value +'-'+districtData[e.data.value][0].value);
    comboRegion.xsetValues(districtData[e.data.value]);
    comboRegion.xsetValue(districtData[e.data.value][0]);
    if(e.data.value == 0){
        _startingFare = 80;
    }else if(e.data.value == 1){
        _startingFare = 75;
    }else{
        _startingFare = 70;
    }
});
// if(Ti.Platform.name != "iPhone OS"){
//     address.addEventListener('focus',function(){
//         $.main.scrollTo(0,200);
//     });
// }


/*
*   date picker
*/
var _serviceStartHour;
// animations
var slideIn =  Ti.UI.createAnimation({bottom:0,duration:500});
var slideOut =  Ti.UI.createAnimation({bottom:-251});
var datePickerView = Ti.UI.createView({height:248,bottom:-248,zIndex:999});
$.orderWin.add(datePickerView);

if(Ti.Platform.name != "iPhone OS"){
    $.serviceTypePair.add(buildServiceTypeTabs_Android());
}

function buildServiceTypeTabs_Android(){
    
    var tab = [];
    var tabTexts = [L('try_once'),L('regular_service')];
    var currTab;
    // TAB BAR
    var tabBar = Ti.UI.createView({
        width:Ti.UI.FILL,
        height:Ti.UI.FILL,
        backgroundColor:'#fff',
        layout:'horizontal',
        borderWidth:1,
        borderRadius:5,
        borderColor:'#d1d1d1'
    });

    for(var i=0; i<2; i++){
        tab[i] = Ti.UI.createView({
            width:'49%',
            height:Ti.UI.FILL,
            left:2,
            top:2,
            backgroundColor: i==0 ? '#70c5a8':'#fff',
            //borderRadius:2,
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

            //animation
            serviceTypeClick(this.index);
        });
    }
    
    return tabBar;
}

function buildDatePicker(consistent){

    datePickerView.removeAllChildren();
    var dateVal = '',
        datePicker;    
    
    var cancel = Titanium.UI.createButton({
        backgroundImage: 'none',
        title: L('cancel'),
        color : '#fff',
        //style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    var done = Titanium.UI.createButton({
        backgroundImage: 'none',
        title : L('done'),
        color : '#fff',
        //style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    var toolbar;
    if(Ti.Platform.name == "iPhone OS"){
        var spacer = Titanium.UI.createButton({
            systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        toolbar = Titanium.UI.iOS.createToolbar({
            top : 0,
            barColor : '#70c5a8',
            items : [cancel, spacer, spacer, spacer, spacer, done]
        });
        
    }else{
        toolbar = Ti.UI.createView({
            top:0,
            height:43,
            width:Ti.UI.FILL,
            backgroundColor:'#70c5a8'
        });
        cancel.setLeft(10);
        done.setRight(10);
        toolbar.add(cancel);
        toolbar.add(done);
    }
    if(consistent){
        var frequency = [L('every'),L('every_2_weeks'),L('every_3_weeks'),L('every_4_weeks')];
        var week = [L('Monday'),L('Tuesday'),L('Wednesday'),L('Thursday'),L('Friday'),L('Saturday'),L('Sunday')];
        var time = ["9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
        var column0 = Ti.UI.createPickerColumn();
        for(var i=0, ilen=frequency.length; i<ilen; i++){
            var row = Ti.UI.createPickerRow({
                title: frequency[i],
                width:Ti.UI.SIZE,
                font:{
                    fontSize:12
                }
            });
            column0.addRow(row);
        }
        var column1 = Ti.UI.createPickerColumn();
        for(var i=0, ilen=week.length; i<ilen; i++){
            var row = Ti.UI.createPickerRow({
                title: week[i],
                width:Ti.UI.SIZE,
                font:{
                    fontSize:12
                }
            });
            column1.addRow(row);
        }
        var column2 = Ti.UI.createPickerColumn();
        for(var i=0, ilen=time.length; i<ilen; i++){
            var row = Ti.UI.createPickerRow({
                title: time[i],
                width:Ti.UI.SIZE,
                font:{
                    fontSize:12
                }
            });
            column2.addRow(row);
        }
        column0.setWidth(143);
        column1.setWidth(105);
        column2.setWidth(67);
        datePicker = Ti.UI.createPicker({
            columns: [column0, column1, column2],
            selectionIndicator: true,
            useSpinner: true, // required in order to use multi-column pickers with Android
            top:43,
            width:Ti.UI.FILL
        });
        //done.setTitle('Add');
        datePicker.setSelectedRow(0,0,false);
        datePicker.setSelectedRow(1,3,false);
        datePicker.setSelectedRow(2,5,false);
    }else{
        // var time = ["9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
        // var column2 = Ti.UI.createPickerColumn();
        // for(var i=0, ilen=time.length; i<ilen; i++){
        //     var row = Ti.UI.createPickerRow({
        //         title: time[i],
        //         width:Ti.UI.SIZE,
        //         font:{
        //             fontSize:12
        //         }
        //     });
        //     column2.addRow(row);
        // }

        //TODO  build own date picker
        if(Ti.Platform.name == "iPhone OS"){
            datePicker = Ti.UI.createPicker({
                top:43, 
                type:Ti.UI.PICKER_TYPE_DATE_AND_TIME,
                //type:Ti.UI.PICKER_TYPE_DATE,
                value: new Date(),
                width:Ti.UI.FILL,
                selectionIndicator:true
            });
            datePicker.addEventListener('change',function (e) {
                dateVal = dateFormat(e.value.getTime());
            });
        }else{
            datePicker = Ti.UI.createPicker({
                top:43, 
                //type:Ti.UI.PICKER_TYPE_DATE_AND_TIME,
                type:Ti.UI.PICKER_TYPE_DATE,
                value: new Date(),
                width:Ti.UI.FILL,
                selectionIndicator:true
            });

            datePicker.showDatePickerDialog({
                value: new Date(2015,7,1),
                callback: function(e) {
                    if (e.cancel) {
                      Ti.API.info('User canceled dialog');
                    } else {
                      Ti.API.info('User selected date: ' + e.value);
                    }
                }
            });

        }
        
        

        
    }
    
   
    datePickerView.add(toolbar);
    datePickerView.add(datePicker);
    

    
    cancel.addEventListener('click', function(e) {
        $.time_tf.text= "";
        datePickerView.animate(slideOut);
     });
        
    done.addEventListener('click', function(e){
        if(consistent){
            var frequency = datePicker.getSelectedRow(0).title,
                weekday = datePicker.getSelectedRow(1).title,
                time = datePicker.getSelectedRow(2).title;
            //$.time_tf.setValue($.time_tf.getValue()+" "+frequency + " "+weekday+" "+ time); 
            $.time_tf.setValue(frequency + " "+weekday+" "+ time); 
        }else{
            dateVal = dateVal ? dateVal : dateFormat(new Date().getTime());
            $.time_tf.setValue(dateVal);
        }
        datePickerView.animate(slideOut);
    });
    
}



function dateFormat(milliseconds){
    var fullDate = new Date(milliseconds);
    var fullYear = fullDate.getFullYear();
    var month = (fullDate.getMonth() + 1).toString();
    var day = fullDate.getDate().toString();
    var hour = fullDate.getHours();
    var minute = fullDate.getMinutes();
    Ti.API.info(minute);
    if(minute <= 15){
        minute = '00';
    }else if(minute > 15 && minute < 45){
        minute = '30';
    }else{
        minute = '00';
        hour = (hour + 1).toString();
    }

    var arr = [month,day,hour];
    arr.forEach(function(el,i){
        if(el.length < 2){
            arr[i] = '0' + el;
        }
    });

    var weekday = new Array(7);
    weekday[0]=  L("Sunday");
    weekday[1] = L("Monday");
    weekday[2] = L("Tuesday");
    weekday[3] = L("Wednesday");
    weekday[4] = L("Thursday");
    weekday[5] = L("Friday");
    weekday[6] = L("Saturday");
    var n = weekday[fullDate.getDay()];

    _serviceStartHour = hour;
    //return fullYear + '-' + month + '-' + day +' '+ hour+':'+minute+'  '+n;
    return fullYear + '-' + arr[0] + '-' + arr[1] + ' ' + arr[2]+':'+minute + '  '+n;
}











function buildDistrictData(){
    var district1 = [],
        district2 = [],
        district3 = [];

    //HK Island has 15 regions
    for (var i = 0; i < 15; i++) {
        district1[i] = {title:L('region_0_'+i),value:i};
    };
    // Kowloon has 23 regions
    for (var i = 0; i < 23; i++) {
        district2[i] = {title:L('region_1_'+i),value:i};
    };
    // New Territories has 25 regions
    for (var i = 0; i < 25; i++) {
        district3[i] = {title:L('region_2_'+i),value:i};
    };
    var districtData = [district1,district2,district3];

    //Ti.API.info(districtData);
    return districtData;
}


//***********************************
//price click
$.price_plus.addEventListener('click',function(){
    var before = $.price.getValue();
    var after = parseInt(before.slice(1)) >= 120 ? 120 : parseInt(before.slice(1))+ 5;
    $.price.setValue("$"+after);
    var hourStr = $.hours.value;
    var hourInt = parseInt(hourStr.slice(0,-1));
    $.fee.setText("$"+hourInt*after);
});
$.price_minus.addEventListener('click',function(){
    var before = $.price.getValue();
    var after = parseInt(before.slice(1)) <= _startingFare ? _startingFare : parseInt(before.slice(1)) - 5;    
    $.price.setValue("$"+after);
    var hourStr = $.hours.value;
    var hourInt = parseInt(hourStr.slice(0,-1));
    $.fee.setText("$"+hourInt*after);
});
// hours click
$.hour_plus.addEventListener('click',function(){
    var before = $.hours.getValue();
    var after = parseInt(before.slice(0,-1)) >=8 ? 8 : parseInt(before.slice(0,-1))+ 1;
    $.hours.setValue(after+"h");
    var priceStr = $.price.value;
    var priceInt = parseInt(priceStr.slice(1));
    $.fee.setText("$"+priceInt*after);
});
$.hour_minus.addEventListener('click',function(){
    var before = $.hours.getValue();
    var after = parseInt(before.slice(0,-1)) <=2 ? 2 : parseInt(before.slice(0,-1))- 1;
    

    $.hours.setValue(after+'h');
    var priceStr = $.price.value;
    var priceInt = parseInt(priceStr.slice(1));
    $.fee.setText("$"+priceInt*after);
});






tableView.addEventListener('click',function(e){
    
    var newWin;
    switch(e.rowData.id){
        
        case 'login':
            newWin = Alloy.createController('login').getView();   
            break;
        case 'my_order':
            newWin = Alloy.createController('list').getView();
            break;
        case 'account':
            newWin = Alloy.createController('account').getView();
            break;
        case 'setting':
            newWin =Alloy.createController('setting').getView();
            // var settingWin = Alloy.createController('setting').getView();
            //  $.orderWin.close();
            //  settingWin.open();
            break;
        case 'contact':
            contactUs();
            break;
        case 'noticeboard':
            newWin = Alloy.createController('noticeboard').getView();
            break;
        case 'aboutus':
            newWin = Alloy.createController('aboutus').getView();
            break;
        case 'fortest':
            deleteAllOrders();
            break;
   
    }
    if(!newWin){
        return;
    }
    var nav = Ti.App.global_nav;
    if(Ti.Platform.name == "iPhone OS"){
        nav.openWindow(newWin,{transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
    }else{
        //$.navTab.open(newWin);
        newWin.open();
    }
    menuClick();
    //Ti.API.info(JSON.stringify(e.rowData.title));  
});



function contactUs(){
    var dialog = Ti.UI.createAlertDialog({
        cancel:0,
        buttonNames: [L('cancel'),L('confirm')],
        message: L('contact_tip')
        //title: 'Tip'
    });
    dialog.addEventListener('click',function(e){
        
        if(e.index === e.source.cancel){
            dialog.hide();
            return;
        }
        Titanium.Platform.openURL('tel:53732989');
    });
    dialog.show();
}


// only refresh menu when Ti.App.menu_refresh == true 
if(Ti.Platform.name == "iPhone OS"){
    $.menuBtn.addEventListener('click',function(e){
        menuClick();
    });
}
function menuClick(){
    datePickerView.animate(slideOut);
    var animateLeft= Ti.UI.createAnimation({
        left: 0,
        //width:Ti.UI.FILL,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 300
    });
    var animateRight = Ti.UI.createAnimation({
        left: 150,
        //width:450,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 300
    });

    if(isToggled){
        $.main.animate(animateLeft);
        isToggled = false;
    }else{
        $.main.animate(animateRight);
        if(Ti.App.menu_refresh ||Ti.App.menu_refresh > 0){
            refreshMenu(Ti.App.menu_refresh); 
        }
        isToggled = true;
    }
}


function refreshMenu(level) {
    if(Cloud.sessionId){
        if(level == 2){
            // change image or username
            currentUser.setText(Ti.App.global_username);
            if(Ti.App.global_photoUrl){
                image.setImage(Ti.App.global_photoUrl);
            } 
        }else if(level == 1){
            // after login
            leftMenu.remove(tableView);
            tableView.setData(buildMenuTable(true)); 
            currentUser.setText(Ti.App.global_username);
            image.setImage(Ti.App.global_photoUrl ? Ti.App.global_photoUrl : '/images/portrait.png')       
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


//***************** submit order
$.orderWin.addEventListener('open',function(){
    if (Ti.Platform.osname === "android") {
        var activity = this.getActivity();
        activity.onCreateOptionsMenu = function(e){ 
            var menu = e.menu; 
        }
        var actionBar = activity.actionBar;
        if (actionBar) {
            actionBar.icon = "/images/menu.png";
            actionBar.title = "";
            actionBar.onHomeIconItemSelected = function() {
                //$.navTab.setActive(true);
                menuClick();
            };
        }
    }
});
$.send.addEventListener('click',function(){

    if(!Cloud.sessionId){
        // Ti.API.info("need login first");
        // var login = Alloy.createController('login').getView();
        // var nav = Ti.App.global_nav;
        // nav.openWindow(login,{transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
        if(!Cloud.sessionId){
            TiDialog(L('login_first'));
            return;
        }
        return;
    }

    Indicator.openIndicator();

    checkACL('order_access');
    
    Cloud.Objects.create({
        classname: 'orders',
        acl_name:'order_access',
        fields: {
            date: $.time_tf.getValue(),
            startHour: _serviceStartHour,
            address: {
                district:comboDistrict.xgetValue(),
                region:comboRegion.xgetValue(),
                detail:address.value
            },
            //payment:$.tbr1.index,
            service_type: Ti.Platform.name == "iPhone OS" ? $.tbr2.index : 'TODO',
            period:$.hours.value,
            fee:$.fee.text,
            special_req:$.special_tf.value,
            sender: Ti.App.global_userId,
            taken_by:'',
            status:0
        }
    }, function (e) {
        if (e.success) {
            var order = e.orders[0];
            beforeSendNotification(order);
            // var order = e.orders[0];
            // var counterWin = Alloy.createController('counter').getView();
            // var nav = Ti.App.global_nav;
            // nav.openWindow(counterWin,{transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });

});


function checkACL(acl_name){
    var acl = Ti.App.Properties.getString(acl_name+"_acl");

    if(!acl){
        Cloud.ACLs.show({
            name: acl_name
        }, function (e) {
            if (!e.success) {
                Cloud.ACLs.create({
                    name: acl_name,
                    public_read: "true",
                    public_write: "true"
                }, function (e1) {
                    if(e1.success){
                        Ti.App.Properties.setString(acl_name+"_acl",true);
                    }
                });
            } 
        });
        
    }
}



function buildMenuTable(logged){
    var menuData,menuImg; 
    if(logged){
        menuData = [[L('my_account'),'account'],[L('my_order'),'my_order'],[L('setting'),'setting'],[L('noticeboard'),'noticeboard'],[L('contact_us'),'contact']];
        menuImg = ['/images/account.png','/images/order.png','/images/setting.png','/images/noticeboard.png','/images/contact.png'];
    }else{
        menuData = [[L('login'),'login'],[L('setting'),'setting'],[L('noticeboard'),'noticeboard'],[L('contact_us'),'contact']];
        menuImg = ['/images/account.png','/images/setting.png','/images/noticeboard.png','/images/contact.png'];
    }
    var tableData = [];
    for (var i = 0; i < menuData.length; i++) {
        var row = Ti.UI.createTableViewRow({
            className:'menuTable', // used to improve table performance
            selectedBackgroundColor:'white',
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

function sendNotification(order,both,sound,vibrate,neither){
    var content = order.address.region.title+' '+order.fee+' '+order.date+ ' '+order.period;
    var paramBoth= {
        channel: 'assistant',
        payload: {
            "alert": content,
            "sound": "default",
            "vibrate": true
        },
        to_ids:both
    };
    var paramSound={
        channel: 'assistant',
        payload: {
            "alert": content,
            "sound": "default"          
        },
        to_ids:sound
    };
    var paramVibrate={
        channel: 'assistant',
        payload: {
            "alert": content,
            "vibrate": true         
        },
        to_ids:vibrate
    };
    var paramNeither={
        channel: 'assistant',
        payload: {
            "alert": content    
        },
        to_ids:neither
    };
    
    if(both){
        Cloud.PushNotifications.notify(paramBoth,function (e) {
            if (!e.success) {
                alert('Error:\n' +
                    ((e.error && e.message) || JSON.stringify(e)));
            }
        });
    }
    if(sound){
        Cloud.PushNotifications.notify(paramSound,function (e) {
            if (!e.success) {
                alert('Error:\n' +
                    ((e.error && e.message) || JSON.stringify(e)));
            }
        });
    }
    if(vibrate){
        Cloud.PushNotifications.notify(paramVibrate,function (e) {
            if (!e.success) {
                alert('Error:\n' +
                    ((e.error && e.message) || JSON.stringify(e)));
            }
        });
    }
    if(neither){
        Cloud.PushNotifications.notify(paramNeither,function (e) {
            if (!e.success) {
                alert('Error:\n' +
                    ((e.error && e.message) || JSON.stringify(e)));
            }
        });
    }
    
    TiDialog(L('text_after_send_order'));
}

function beforeSendNotification(order){
    Cloud.Users.query({
        limit:1000,
        where: {
            role: '1',
            'notification':'on' 
        }
    }, function (e) {
        if (e.success) {
            Ti.API.info(JSON.stringify(e.users[0]));
            if(e.users.length <= 0){
                Ti.API.info('not found');
                return;
            }
            var both = [],
                sound = [],
                vibrate = [],
                neither = [];
            for (var i = 0; i < e.users.length; i++) {
                var user = e.users[i];
                if(user.custom_fields.noti_sound == 'on' && user.custom_fields.noti_vibrate == 'on'){
                    both[i] = user.id;
                }else if(user.custom_fields.noti_sound == 'on' && user.custom_fields.noti_vibrate == 'off'){
                    sound[i] = user.id;
                }else if(user.custom_fields.noti_sound == 'off' && user.custom_fields.noti_vibrate == 'on'){
                    vibrate[i] = user.id;
                }else{
                    neither[i] = user.id;
                }
            };

            Indicator.closeIndicator();

            sendNotification(order,both.join(),sound.join(),vibrate.join(),neither.join());
        }
    });
}


//*************** Event Listener

$.orderWin.addEventListener('focus',function(){
    if(Ti.Platform.name != "iPhone OS"){
        // function hideTabBar()
        // {
        //     $.navGroup.animate({
        //         opacity: 1,
        //         top: -94,
        //         duration: 1
        //     });
        // }
 
        // $.navGroup.visible = false;
        // $.navGroup.opacity = 0;
 
        // setTimeout(hideTabBar, 2);
    }
    Ti.App.current_window = this;
    if(Ti.App.language_changed){
        
        Ti.App.language_changed = false;
        //$.orderWin.close();
        var order = Alloy.createController('order').getView(); 
        order.open();
    }
});

if(Ti.Platform.name == "iPhone OS"){
   $.tbr2.addEventListener('click',function(e){
        serviceTypeClick(e.index);
    }); 
}

function serviceTypeClick(index){
    buildDatePicker(index === 1 ? true : false);
    $.time_tf.setValue('');
    datePickerView.animate(slideIn);
}


$.time_tf.addEventListener('click',function (event) {
    Ti.API.info('here1');
    buildDatePicker(false);  
    //datePickerView.animate(slideIn);
});

if(Ti.Platform.name == "android"){
    Ti.API.info('here3');
    $.time_view.addEventListener('click',function (event) {
        Ti.API.info('here4');
        buildDatePicker(false);  
        datePickerView.animate(slideIn);
    });
}
$.main.addEventListener('click',function(){
    if (isToggled){
        menuClick();
    }
    address.blur();
    $.special_tf.blur();
});


if(Ti.Platform.name != "iPhone OS"){
    //$.navGroup.addEventListener('open',function(){
        
    //});


}











// test notification
 

function registerNotification(){
    var deviceToken = Ti.App.Properties.getString('deviceToken');
    if(deviceToken){
        return;
    }
    // Check if the device is running iOS 8 or later
    if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
        
     // Wait for user settings to be registered before registering for push notifications
        Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {

        // Register notification types to use
        
        // Remove event listener once registered for push notifications
            Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
            Ti.Network.registerForPushNotifications({
                success: deviceTokenSuccess,
                error: deviceTokenError,
                callback: receivePush
            });
            
        });
        
        Ti.App.iOS.registerUserNotificationSettings({
            types: [
                Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
                Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
                Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
            ]
        });
     
     
    }
     
    // For iOS 7 and earlier
    else {
        Ti.Network.registerForPushNotifications({
     // Specifies which notifications to receive
            types: [
                Ti.Network.NOTIFICATION_TYPE_BADGE,
                Ti.Network.NOTIFICATION_TYPE_ALERT,
                Ti.Network.NOTIFICATION_TYPE_SOUND
            ],
            success: deviceTokenSuccess,
            error: deviceTokenError,
            callback: receivePush
        });
    }
}



// Process incoming push notifications
function receivePush(e) {
    alert('Received push: ' + JSON.stringify(e));
}
// Save the device token for subsequent API calls
function deviceTokenSuccess(e) {
    Ti.API.info('user token success: '+e.deviceToken);
    Ti.App.Properties.setString('deviceToken',e.deviceToken);
}
function deviceTokenError(e) {
    alert('Failed to register for push notifications! ' + e.error);
}





// for test **************

function deleteAllOrders(){
    var ids = [];
    Cloud.Objects.query({
        classname: 'orders',
        limit:100
    },function (e) {
        if (e.success) {
            for (var i = 0; i < e.orders.length; i++) {
                var order = e.orders[i];
                ids[i]= order.id;
            }
            removeAll(ids.join());
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
    
}

function removeAll(oids){
    Cloud.Objects.remove({
        classname: 'orders',
        ids: oids
    }, function (e) {
        if (e.success) {
            alert('delete all orders success.');
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}



