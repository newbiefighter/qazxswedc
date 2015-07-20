var self = $.phoneVldWin;
var args = arguments[0] || {};
var _param = args._param;

var _inputs = [],
	_sendBtn,
	_nextBtn;
initView();
function initView(){
	var tableData = [];
		//inputs = [],
		
 
	for(var i=0; i<2; i++){
		
		var container = Ti.UI.createView({
			top:"10%",
			height:"80%",
			width:Ti.UI.FILL,
			layout:"horizontal"
		});
		var icon = Ti.UI.createImageView({
			width:22,
			height:22,
			left:5
		});
		var label = Ti.UI.createLabel({
			left:5,
			color:'#70c5a8',
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			width: "22%", 
			height: Ti.UI.SIZE,
			font:{
				fontSize:16
			}
		});
		_inputs[i] = Ti.UI.createTextField({
			left:3,
			paddingRight:10,
			font : {
				fontSize : 16,
				fontFamily : 'Helvetica Neue'
			},
			color:'#000',
			width : i==0 ? '43%' :Ti.UI.SIZE,
			height: Ti.UI.FILL,
			textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
			autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			autocorrect : false,
			passwordMask : false /* Removing this or setting it to false makes the input field behave as expected */
		});
		switch(i){
			case 0:
				label.setText(L("telephone"));
				_inputs[i].setHintText(L("telephone_hint"));
				icon.setBackgroundImage('/images/username.png');
				//_inputs[i].setWidth('50%');
				break;
			case 1:
				label.setText(L("captcha"));
				_inputs[i].setHintText(L("captcha_hint"));
				icon.setBackgroundImage('/images/password.png');
				break;

		}
		container.add(icon);
		container.add(label);
		container.add(_inputs[i]);
		if(i == 0){
			_sendBtn = Ti.UI.createButton({
				right:0,
				width:Ti.UI.FILL,
				height:Ti.UI.FILL,
				title:L("getpin"),
				backgroundColor:"#70c5a8",
				color:"#fff",
				borderRadius:5,
				font:{
					fontSize:16,
					fontWeight:"bold"
				}
				//disabledColor:"#d1d1d1"
			});
			container.add(_sendBtn);
		}
		if(Ti.Platform.name == "iPhone OS"){
			var row = Ti.UI.createTableViewRow({
				className : 'captcha_row',
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
			height:Ti.UI.SIZE,
			width:Ti.UI.FILL,
			height:'20%',
			allowsSelection: false,
			data : tableData
		});
		var tips = decorateLabel(
			Ti.UI.createLabel({
				width:Ti.UI.SIZE,
				text:L("captcha_tip"),
				font : {
					fontSize : 12,
					fontFamily : 'Helvetica Neue'
				},
				color:'blue'
		}),'15%');
		tips.hide();
		self.add(tableView);
		//self.add(tips);
	}
	
	_nextBtn = Ti.UI.createButton({
	    top:'25%',
	    left:10,
	    right:10,
	    width:Ti.UI.FILL,
	    height:40,
	    backgroundColor:'#70c5a8',
	    borderRadius:5,
	    color:'white',
	    title:L('submitBtn')
	});

	self.add(_nextBtn);
	

	_sendBtn.addEventListener('click',function(){
		if(!_inputs[0].value || _inputs[0].value== '' || _inputs[0].value.length != 8){
			TiDialog(L('sms_phone_error'));
			return;
		}
		Cloud.Users.query({
			where:{
				"phone":_inputs[0].value
			}
		},function(e){
			sendSMS(e);
		});
		
	});


}

function sendSMS(e){
	if(e.success){
		Ti.API.info('exist phone:'+e.users.length);
		if(e.users.length > 0){
			TiDialog(L('sms_phone_exist'),L('warning'));
			return;	
		}else{
			var util = require('util');
			util.smsService(_inputs[0].value);
			_sendBtn.setEnabled(false);
			_sendBtn.setBackgroundColor("#d1d1d1");
			var counter = 60;
			var timer = setInterval(function(){
				_sendBtn.setTitle(counter+L('second'));
				if(counter > 0){
					counter--;
				}else{
					_sendBtn.setEnabled(true);
					_sendBtn.setTitle(L("send"));
					_sendBtn.setBackgroundColor('#70c5a8');
					clearInterval(timer);
				}	

			},1000);
		}
		
	}
	
}

function validateSMS(){
	var captcha = Ti.App.Properties.getString('captcha');
	if(captcha && captcha == _inputs[1].getValue()){
		return true;
	}
	return false;
}

function welcome(){
	TiDialog(L('register_welcome_article'),L('register_welcome_title'),function(e){
	    if (e.index === 0){
	      self.close();
	    }
	});
}



// ********     Event Listener     **************
if(Ti.Platform.name == "iPhone OS"){
	$.backBtn.addEventListener('click',function(){
		self.close();
	});
}

_nextBtn.addEventListener('click',function(){
	
	if(!validateSMS()){
		TiDialog("captcha is incorrect.");
		return;
	}
	Indicator.openIndicator();
	var cusFields;
	if(Ti.App.Properties.getString('app_type') == 1){
		cusFields = {
			phone: _inputs[0].value,
			identification_status:0,  // default:0, submit but not approval:1, approval:2
			notification:'on',
			noti_sound:'on',
			noti_vibrate:'on'
		};
	}else{
		cusFields = {
			phone: _inputs[0].value,
			notification:'on',
			noti_sound:'on',
			noti_vibrate:'on'
		};
	}
	Cloud.Users.create({
		role:Ti.App.Properties.getString('app_type'),
		custom_fields : cusFields,
	    username: _param[0].value,
	    password: _param[1].value,
	    password_confirmation: _param[2].value,
	}, function (e) {
	    if (e.success) {
	    	Indicator.closeIndicator();
	        var user = e.users[0];
	        Ti.App.newUser = true;
	        welcome();
	    } else {
	    	Indicator.closeIndicator();
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
});


self.addEventListener('focus',function(){
	Ti.App.current_window = this;
});