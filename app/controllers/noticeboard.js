if(Ti.Platform.name == "iPhone OS"){
	$.noticeWin.hideTabBar();
	$.backBtn.addEventListener('click',function(){
		$.noticeWin.close();
	});
}
