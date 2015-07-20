var self = $.settingWin;
var _needUpdate = false;
var _onOffImage = [];

if(Ti.Platform.name == "iPhone OS"){
	self.hideTabBar();
	init();
}else{
	//self.remove($.table1);
	//self.remove($.table2);
	buildViewForAndroid();
}




function init(){
	$.table2.footerView = Ti.UI.createView({
	    height: 1,
	    backgroundColor: 'transparent'
	});
	
	var locale = Ti.App.Properties.getString('SETTING_LANGUAGE');
	
	$.tbr.setIndex(locale == 'en' ? 1 : 0);
	
	// notification inital
	if(!Cloud.sessionId){
		$.notification.hide();
		$.noti_sound.hide();
		$.noti_vibrate.hide();
		return;
	}
	initNotiStatus();
}

function initNotiStatus(){
	Cloud.Users.showMe(function (e) {
	    if (e.success) {
	        var user = e.users[0];
	        var noti_on = user.custom_fields.notification,
	        	noti_sound = user.custom_fields.noti_sound,
	        	noti_vibrate = user.custom_fields.noti_vibrate;
	        var notificationObj = Ti.Platform.name == "iPhone OS" ? $.notification : _onOffImage[0],
				soundObj = Ti.Platform.name == "iPhone OS" ? $.noti_sound : _onOffImage[1],
				vibrateObj = Ti.Platform.name == "iPhone OS" ? $.noti_vibrate : _onOffImage[2];
	        if(noti_on == 'off'){
				notificationObj.setBackgroundImage('/images/turnoff.png');
				soundObj.setBackgroundImage('/images/turnoff.png');
				vibrateObj.setBackgroundImage('/images/turnoff.png');
			}else{
				notificationObj.setBackgroundImage('/images/turnon.png');
				soundObj.setBackgroundImage(noti_sound == 'on' ? '/images/turnon.png':'/images/turnoff.png');
				vibrateObj.setBackgroundImage(noti_vibrate == 'on' ? '/images/turnon.png':'/images/turnoff.png');
			}
	    }
	});
}

function buildViewForAndroid(){
	var container1 = Ti.UI.createView({
		backgroundColor : '#fff',
		borderColor:"#d1d1d1",
		borderRadius:5,
		borderWidth:1,
		allowsSelection: false,
		top:'5%',
		height:Ti.UI.SIZE,
		width:'95%',
		layout:'vertical'
	});
	var headTitle = Ti.UI.createLabel({
		top:0,
		left:10,
		font:{
			fontSize:12
		},
		textAlign:Ti.UI.TEXT_ALIGNMENT_LEFT,
		color:'#000',
		text:L('system_preferences')
	});
	container1.add(headTitle);
	var langView = Ti.UI.createView({
		left:10,
		width:Ti.UI.FILL,
		height:50,
		layout:'horizontal'
	});
	var langLabel = Ti.UI.createLabel({
		text:L('language'),
		color:'#70c5a8',
		width:'20%'
	});
	var tabBar = buildLangTabs();
	langView.add(langLabel);
	langView.add(tabBar);
	container1.add(langView);
	buildNotiView(container1);
	$.sys_table.add(container1);

	var container2 = Ti.UI.createView({
		backgroundColor : '#fff',
		borderColor:"#d1d1d1",
		borderRadius:5,
		width:'95%',
		height:Ti.UI.SIZE,
		top:'10%'
	});

	initNotiStatus();
}


function buildLangTabs(){
	var width = 150;
	var tab = [];
    var tabTexts = ['中文(繁體)','English'];
    var currTab;
    // TAB BAR
    var tabBar = Ti.UI.createView({
        width:width,
        height:35,
        left:'30%',
        right:10,
        backgroundColor:'#fff',
        layout:'horizontal',
        borderWidth:1,
        borderRadius:5,
        borderColor:'#d1d1d1'
    });
    var locale = Ti.App.Properties.getString('SETTING_LANGUAGE');
    var activeIndex = locale == 'en' ? 1 : 0;
    for(var i=0; i<2; i++){
        tab[i] = Ti.UI.createView({
            width:width*0.50-2,
            height:Ti.UI.FILL,
            left:2,
            top:2,
            backgroundColor: i==activeIndex ? '#70c5a8':'#fff',
            borderRadius:2,
            index:i
        });
        var tabLabel = Ti.UI.createLabel({
      
            text:tabTexts[i],
            color: i==activeIndex ? '#fff':'#70c5a8',
        });
        tab[i].add(tabLabel);
        tabBar.add(tab[i]);

        tab[i].addEventListener('click',function() {
        	var locale = Ti.App.Properties.getString('SETTING_LANGUAGE');
    		currTab = tab[locale == 'en' ? 1 : 0];
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
         	langTabClick(this.index);
        });
    }
    
    return tabBar;
}

function buildNotiView(parent){
	var notiLabels = [L('notification'),L('noti_sound'),L('noti_vibrate')];
	for(var i=0; i<3; i++){
		var outerView = Ti.UI.createView({
			left:10,
			width:Ti.UI.FILL,
			height:50,
			layout:'horizontal'
		});
		var langLabel = Ti.UI.createLabel({
			text:notiLabels[i],
			color:'#70c5a8',
			height:Ti.UI.SIZE,
			width:'20%'
		});
		outerView.add(langLabel);
		if(Cloud.sessionId){
			_onOffImage[i] = Ti.UI.createButton({
				left:'50%',
				right:10,
				backgroundImage:'/images/turnon.png',
				width:50,
				height:25,
				index:i
			});
			outerView.add(_onOffImage[i]);
			_onOffImage[i].addEventListener('click',function(){
				if(this.index === 0){
					notificationClick(this,_onOffImage[1],_onOffImage[2]);
				}else{
					soundVibrateClick(this,_onOffImage[0]);
				}	
			});
		}
		
		parent.add(outerView);
	}
}


function langTabClick(index){
	
	var locale = Ti.App.Properties.getString('SETTING_LANGUAGE'); 
	var langs = ['zh_hk','en'];

	if(langs[index]!= locale){
		// language changed.
		Ti.App.Properties.setString('SETTING_LANGUAGE', langs[index]);
		Ti.App.language_changed = true;
		self.close();
	}
}

function notificationClick(selfView,soundView,vibrateView){
	_needUpdate = true;
	var currentImage = selfView.getBackgroundImage();
	if(currentImage == '/images/turnon.png'){
		selfView.setBackgroundImage('/images/turnoff.png');
		soundView.setBackgroundImage('/images/turnoff.png');
		vibrateView.setBackgroundImage('/images/turnoff.png');
	}else{
		selfView.setBackgroundImage('/images/turnon.png');
	}
}

function soundVibrateClick(selfView,notiView){
	_needUpdate = true;
	var noti_on = notiView.getBackgroundImage();
	if(noti_on == '/images/turnoff.png'){
		return;
	}
	var img = selfView.getBackgroundImage();
	selfView.setBackgroundImage(img == '/images/turnoff.png' ? '/images/turnon.png':'/images/turnoff.png');
}

// ************** Event Listener
// $.returnBtn.addEventListener('click',function(){
// 	self.close();
// 	var order = Alloy.createController('order').getView(); 
// 	order.open();
// });
self.addEventListener('focus',function(){
	Ti.App.current_window = this;
});

if(Ti.Platform.name == "iPhone OS"){

	$.tbr.addEventListener('click',function(e){
		langTabClick(e.index);
	});
	$.backBtn.addEventListener('click',function(){
		self.close();
	});
	$.table1.addEventListener('click',function(e){
		//Ti.API.info(JSON.stringify(e));
	});
	$.notification.addEventListener('click',function(){
		notificationClick(this,$.noti_sound,$.noti_vibrate);
	});
	$.noti_sound.addEventListener('click',function(){
		soundVibrateClick(this,$.notification);
	});
	$.noti_vibrate.addEventListener('click',function(){
		soundVibrateClick(this,$.notification);
	});
}


$.table2.addEventListener('click',function(e){
	var itemId; 
	if(Ti.Platform.name == "iPhone OS"){
		itemId = e.rowData.id;
	}else{
		itemId = e.source.id;
	}
	switch(itemId){
		case 'about_us':
			var newWin = Alloy.createController('aboutus').getView();
			break;
		case 'provision':
			var newWin = Alloy.createController('provision').getView();
			break;
	}
	Ti.API.info(JSON.stringify(e));
	Ti.API.info(itemId);
	var nav = Ti.App.global_nav;
	if(Ti.Platform.name == "iPhone OS"){
	    nav.openWindow(newWin,{transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
	}else{
		nav.open(newWin);
	}
});

self.addEventListener('blur',function(){
	if(!Cloud.sessionId || !_needUpdate){
		return;
	}
	var notificationObj = Ti.Platform.name == "iPhone OS" ? $.notification : _onOffImage[0],
		soundObj = Ti.Platform.name == "iPhone OS" ? $.noti_sound : _onOffImage[1],
		vibrateObj = Ti.Platform.name == "iPhone OS" ? $.noti_vibrate : _onOffImage[2];
	Cloud.Users.update({
	    custom_fields: {
	        notification: (notificationObj.getBackgroundImage() == '/images/turnon.png') ? 'on':'off',
	        noti_sound: (soundObj.getBackgroundImage() == '/images/turnon.png') ? 'on':'off',
	        noti_vibrate: (vibrateObj.getBackgroundImage() == '/images/turnon.png') ? 'on':'off'
	    }
	}, function (e) {
	    if (!e.success) {
	    	TiDialog(L('process_error'));
	    }
	});
});




