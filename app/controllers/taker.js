
$.takerWin.addEventListener('focus',function(){
	Ti.App.current_window = this;
});
$.taker_btn.addEventListener('click',function (argument) {
	var Cloud = require('ti.cloud');
	Cloud.debug = true;

	var listWin = Alloy.createController('list').getView();
	listWin.open({transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});

});