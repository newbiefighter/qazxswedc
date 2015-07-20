var self = $.loginWin;
if(Ti.Platform.name == "iPhone OS"){
	self.hideTabBar();
}
var tableData = [],
	inputs = [];
 
for(var i=0; i<2; i++){
	var icon = Ti.UI.createImageView({
		width:22,
		height:22,
		left:5
	});
	var label = Ti.UI.createLabel({
		left:5,
		color:'#70c5a8',
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		width: Ti.UI.SIZE, 
		height: Ti.UI.SIZE,
		font:{
			fontSize:16
		}
	});
	inputs[i] = Ti.UI.createTextField({
		paddingRight:10,
		font : {
			fontSize : 16,
			fontFamily : 'Helvetica Neue'
		},
		color : "#000",
		width : Ti.UI.FILL,
		height: Ti.UI.FILL,
		textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		autocorrect : false,
		passwordMask : false /* Removing this or setting it to false makes the input field behave as expected */
	});
	switch(i){
		case 0:
			label.setText(L("username"));
			inputs[i].setHintText(L("required"));
			icon.setBackgroundImage('/images/username.png');
			break;
		case 1:
			label.setText(L("password"));
			inputs[i].setHintText(L("required"));
			inputs[i].setPasswordMask(true);
			icon.setBackgroundImage('/images/password.png');
			break;

	}
	
	var container = Ti.UI.createView({
		top:"20%",
		height:"60%",
		width:Ti.UI.FILL,
		layout:"horizontal"
		//backgroundColor : "#d1d1d1"
	});
	
	container.add(icon);
	container.add(label);
	container.add(inputs[i]);
	if(Ti.Platform.name == "iPhone OS"){
		var row = Ti.UI.createTableViewRow({
			className : 'passwordTest',
			height:'50%'		
		});
		row.add(container);
		tableData.push(row);
	}else{
		var row = Ti.UI.createView({
			top: i==0 ? '10%' : 0,
			height:"10%",
			width:Ti.UI.FILL,
			layout:"horizontal",
			left:10,
			right:10,
			borderColor:"#d1d1d1",
			borderRadius:5
		});
		row.add(container);
		self.add(row);
	}

}

if(Ti.Platform.name == "iPhone OS"){
	var tableView = Ti.UI.createTableView({
		top:'10%',
		left:10,
		right:10,
		scrollable:false,
		backgroundColor : 'white',
		borderColor:"#d1d1d1",
		borderRadius:5,
		//height:Ti.UI.SIZE,
		width:Ti.UI.FILL,
		height:'20%',
		allowsSelection: false,
		data : tableData
	});
	self.add(tableView);
}


//forget password
var forgetPw = Ti.UI.createLabel({
	width:Ti.UI.SIZE,
	text:L('forgetpwd'),
	font : {
		fontSize : 12,
		fontFamily : 'Helvetica Neue'
	},
	color:'blue'

});

// // new user
// var newUser = Ti.UI.createLabel({
// 	width:Ti.UI.SIZE,
// 	text:L('newuser'),
// 	font : {
// 		fontSize : 16,
// 		fontFamily : 'Helvetica Neue'
// 	},
// 	color:'FF6600'

// });
if(Ti.Platform.name == "iPhone OS"){
	$.newUser.addEventListener('click',function(){
		var signup = Alloy.createController('signup').getView();
		var nav = Ti.App.global_nav;
		nav.openWindow(signup,{animated:true,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
		
	});
	//cancel
	$.cancel.addEventListener('click',function(){
		self.close({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	});
}else{
	self.activity.onCreateOptionsMenu = function(e) { 
		var menu = e.menu; 
		var menuItem = menu.add({ 
			title : L('createnewuser'), 
			//icon : "images/hand.png", 
			showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS 
		}); 
		menuItem.addEventListener("click", function(e) { 
			var signup = Alloy.createController('signup').getView();
			var nav = Ti.App.global_nav;
			nav.open(signup); 
		}); 
	};
}


self.add(decorateLabel(forgetPw,'10%'));
// self.add(decorateLabel(newUser,'50%'));

//login
var loginBtn = Ti.UI.createButton({
    top:'25%',
    left:10,
    right:10,
    width:Ti.UI.FILL,
    height:40,
    backgroundColor:'#70c5a8',
    borderRadius:5,
    color:'white',
    title:L('login')
});

self.add(loginBtn);
loginBtn.addEventListener('click',function(){
	//buildMask();
	Indicator.openIndicator();
	Cloud.Users.login({
	    login: inputs[0].value,
	    password: inputs[1].value
	}, function (e) {
	    if (e.success) {
	        var user = e.users[0];
	        //Ti.API.info(JSON.stringify(user));
	        if(Ti.App.Properties.getString('app_type') != parseInt(user.role)){
	        	Cloud.Users.logout(function(e){
	        		if(e.success){
	        			Ti.API.info('logout success');
	        		}else{
	        			Ti.API.info('logout fail');
	        		}
	        	});
	        	
	        	Indicator.closeIndicator();
				TiDialog(L('account_warning'));
				return;
	        }

	        cacheLoginInfo(inputs[0].value,inputs[1].value);
	        getPortrait(user);
	        subscribeNotification(parseInt(user.role));
	        Ti.App.menu_refresh = 1;
	        Indicator.closeIndicator();
	        self.close();
	        // new user?
	        if(Ti.App.newUser && Ti.App.Properties.getString('app_type') == 1){
	        	//redirect to identification 
				var identifyWin = Alloy.createController('identify').getView();
				var nav = Ti.App.global_nav;
				nav.open(identifyWin,{transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
	        }
	     
	    } else {
	    	//_overlay.hide();
	    	Indicator.closeIndicator();
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
});

self.addEventListener('focus',function(){
	Ti.App.current_window = this;
});


function cacheLoginInfo(username,password){
	Ti.App.Properties.setString('username',username);
	Ti.App.Properties.setString('password',password);
}

function getPortrait(user){
	Cloud.Photos.query({
        where:{
        	user_id:user.id,
            title:'portrait'
        }        
    },function(e){
        if(e.success){	
	        if(e.photos.length > 0){
	        	var photo = e.photos[0];
	        	Ti.API.info('photoid::::'+photo.id);
	        	Ti.API.info(JSON.stringify(photo));
	        	Ti.App.global_userId = user.id;
	        	Ti.App.global_username = user.username;
	        	Ti.App.global_photoId = photo.id;
	        	Ti.App.global_photoUrl = photo.urls.preview;
	        	// Ti.App.global_user = {
		        // 	_id:user.id,
		        // 	_username:user.username	,
		        // 	_pid:photo.id,
		        // 	_purl:photo.urls.preview
		        // };
	        	
	        }else{
	        	Ti.App.global_userId = user.id;
	        	Ti.App.global_username = user.username;
	        	// Ti.App.global_user = {
		        // 	_id:user.id,
		        // 	_username:user.username		        	
		        // };
	        }
        }

    });
}

function subscribeNotification(type){
	var subscription = Ti.App.Properties.getString('subscription');
	if(subscription){
		return;
	}
	// subscribe notification
    subscribeToChannel( type==1? 'assistant':'user');

    // option 2 : ask user to if subscribe
    /*
	var dialog = Ti.UI.createAlertDialog({
        cancel:0,
        buttonNames: [L('later'),L('cool')],
        message: L('subscribe_noti')
        //title: 'Tip'
    });
    dialog.addEventListener('click',function(e1){
        
        if(e1.index === e1.source.cancel){
            dialog.hide();
            return;
        }

        // subscribe notification
        subscribeToChannel( type==1? 'assistant':'user');
    });
    dialog.show();
    */
}

function buildMask(){
	var style;
    if (Ti.Platform.name === 'iPhone OS'){
      style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
    }
    else {
      style = Ti.UI.ActivityIndicatorStyle.PLAIN;
    }
    _overlay = Ti.UI.createView({
        backgroundColor : 'gray',
        top:'-40%',
        height:50,
        width:100,
        borderRadius:5,
        zIndex:999,
        
    });
    var actInd = Titanium.UI.createActivityIndicator({
        height:30,
        width:30,
        style:style,
        message:L('waiting'),
        color:'white'
    });
    
    _overlay.add(actInd);
    $.loginWin.add(_overlay);
  
    //loading indicator shows...
    actInd.show();
}




