var locale = Ti.App.Properties.getString('SETTING_LANGUAGE');
if(locale == 'en'){
	$.mainView.hide();
}else{
	$.tempTip.hide();
}

if(Ti.Platform.name == "iPhone OS"){
	$.backBtn.addEventListener('click',function(){
		$.provisionWin.close();
	});
}