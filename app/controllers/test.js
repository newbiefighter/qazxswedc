/*
* toolbar bottom
*
var send = Titanium.UI.createButton({
    title: 'Send',
    style: Titanium.UI.iPhone.SystemButtonStyle.DONE,
});

var camera = Titanium.UI.createButton({
    systemButton: Titanium.UI.iPhone.SystemButton.CAMERA,
});

var cancel = Titanium.UI.createButton({
    systemButton: Titanium.UI.iPhone.SystemButton.CANCEL
});

flexSpace = Titanium.UI.createButton({
    systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
});

var toolbar = Titanium.UI.iOS.createToolbar({
    items:[send, flexSpace, camera, flexSpace, cancel],
    bottom:0,
    borderTop:true,
    borderBottom:false
}); 
$.win.add(toolbar);
*/
//var win = $.win;
var tableData = [];
 
for(var i=0; i<3; i++){
	var row = Ti.UI.createTableViewRow({
		className : 'passwordTest',
		selectedBackgroundColor : '#909090',
		backgroundColor : "#909090",
		layout:"horizontal",
		height:'33.3%'
		//paddingLeft : 50,
		//paddingRight : 10
	});
	var label = Ti.UI.createLabel({
		
		top:'25%',
		left:'5%',
		color:'#fff',
		textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
		width: Ti.UI.SIZE, 
		height: Ti.UI.SIZE
	});
	var input = Ti.UI.createTextField({
		top:'25%',
		paddingRight:10,
		font : {
			fontSize : 16,
			fontFamily : 'Helvetica Neue'
		},
		backgroundColor : "#909090",
		width : Ti.UI.FILL,
		textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
		autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
		autocorrect : false,
		passwordMask : false /* Removing this or setting it to false makes the input field behave as expected */
	});
	switch(i){
		case 0:
			label.setText("Telephone");
			input.setHintText("Required");
			break;
		case 1:
			label.setText("Password");
			input.setHintText("6-16 digits or chars");
			break;
		case 2:
			label.setText("Password again");
			input.setHintText("password again");
			break;

	}
	row.add(label);
	row.add(input);
 
	tableData.push(row);

 }
var tableView = Ti.UI.createTableView({
	top:'10%',
	backgroundColor : 'white',
	height:Ti.UI.SIZE,
	width:Ti.UI.FILL,
	height:'25%',
	data : tableData
});

//forget password
var forgetPw = Ti.UI.createLabel({
	width:Ti.UI.SIZE,
	text:'Forget Password?',
	font : {
		fontSize : 12,
		fontFamily : 'Helvetica Neue'
	},
	color:'blue'

});

// new user
var newUser = Ti.UI.createLabel({
	width:Ti.UI.SIZE,
	text:'New to Housework?',
	font : {
		fontSize : 16,
		fontFamily : 'Helvetica Neue'
	},
	color:'FF6600'

});

newUser.addEventListener('click',function(){
	var signup = Alloy.createController('logup').getView();
	var nav = Ti.App.global_nav;
	nav.openWindow(signup,{animated:true,transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
	
});


$.win.add(tableView);

function decorateLabel(label,top_p) {
  var decoratedView = Titanium.UI.createView({
    width : Titanium.UI.SIZE, height : Titanium.UI.SIZE, layout : 'vertical',top: top_p,textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER
  });
  decoratedView.add(label);
 
  setTimeout(function() {
    var lineView = Titanium.UI.createView({
      width : label.getSize().getWidth(), left : label.left, height : 1, backgroundColor : label.color ? label.color : 'white', top : -1, bottom : 0
    });
    decoratedView.add(lineView);
  }, 100);
 
  return decoratedView;
}

$.win.add(decorateLabel(forgetPw,'50%'));
$.win.add(decorateLabel(newUser,'60%'));
