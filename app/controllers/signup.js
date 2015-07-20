var self = $.signupWin;
self.addEventListener('focus',function(){
	Ti.App.current_window = this;
});
var tableData = [],
	_inputs = [];
 
for(var i=0; i<3; i++){
	
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
		height: Ti.UI.SIZE
	});
	_inputs[i] = Ti.UI.createTextField({
		paddingRight:5,
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
			_inputs[i].setHintText(Ti.App.Properties.getString('app_type') == 1 ? L("ayi_username_hint") : L('username_hint'));
			icon.setBackgroundImage('/images/username.png');
			break;
		case 1:
			label.setText(L("password"));
			_inputs[i].setHintText(L("password_hint"));
			_inputs[i].setPasswordMask(true);
			icon.setBackgroundImage('/images/password.png');
			break;
		case 2:
			label.setText(L("password_again"));
			_inputs[i].setHintText(L("password_again_hint"));
			_inputs[i].setPasswordMask(true);
			//icon.setBackgroundImage('password.png');
			break;

	}

	var container = Ti.UI.createView({
		top:"20%",
		height:"60%",
		width:Ti.UI.FILL,
		layout:"horizontal",
	});
	container.add(icon);
	container.add(label);
	container.add(_inputs[i]);
	if(Ti.Platform.name == "iPhone OS"){
		var row = Ti.UI.createTableViewRow({
			className : 'passwordTest',
			height:'33.3%'
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
		height:'30%',
		allowsSelection: false, 
		data : tableData
	});

	self.add(tableView);
}
var tipView = Ti.UI.createView({
	top:'5%',
	width:Ti.UI.FILL,
	height:Ti.UI.SIZE,
	layout:'horizontal'
});
var tickBox = Ti.UI.createImageView({
	width:29,
	height:29,
	image:'/images/untick.png',
	left:'15%'
});
var tip = Ti.UI.createLabel({
	width:Ti.UI.SIZE,
	text:L('readprovisionlabel'),
	font : {
		fontSize : 12,
		fontFamily : 'Helvetica Neue'
	},
	color:'#70c5a8'
});
var tipLink = decorateLabel(tip,5); // tip height is 17 for font 12
tipView.add(tickBox);
tipView.add(tipLink);
tipLink.addEventListener('click',function(){
	var newWin = Alloy.createController('provision').getView();
	var nav = Ti.App.global_nav;
	if(Ti.Platform.name == "iPhone OS"){
		nav.openWindow(newWin,{transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
	}else{
		nav.open(newWin);
	}
});

var nextBtn = Ti.UI.createButton({
    top:'25%',
    left:10,
    right:10,
    width:Ti.UI.FILL,
    height:40,
    backgroundColor:'#70c5a8',
    borderRadius:5,
    color:'white',
    title:L('next')
});
self.add(tipView);
self.add(nextBtn);


// *********** Event

tickBox.addEventListener('click',function(){
	
	this.setImage(this.image == '/images/untick.png' ? '/images/ticked.png' : '/images/untick.png');
});
if(Ti.Platform.name == "iPhone OS"){
	$.backBtn.addEventListener('click',function(){
		self.close();
	});
}
nextBtn.addEventListener('click',function(){
	//validation
	if(!formValidation()){
		TiDialog(L('account_warning'));
		return;
	}
	if(!acceptProvision()){
		TiDialog(L('accept_provision'));
		return;
	}

	var phoneVld = Alloy.createController('phoneValidate',{_param:_inputs}).getView();
	//phoneVld.inputData = _inputs;
	var nav = Ti.App.global_nav;
	
	if(Ti.Platform.name == "iPhone OS"){
		nav.openWindow(phoneVld,{transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
	}else{
		nav.open(phoneVld);
	}
	self.close();
	return;
});

function formValidation(){
	var username = _inputs[0].value,
		pwd = _inputs[1].value,
		pwdAgain = _inputs[2].value;
	
	return username.length >0 && pwd.length >= 6 && pwd.length <= 16 && !/[\W]/.test(pwd) && pwd == pwdAgain;
}

function acceptProvision(){
	return tickBox.getImage() == '/images/ticked.png';
}



