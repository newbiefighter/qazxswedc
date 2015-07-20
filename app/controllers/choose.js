




/*******
 user type assistant:1  user:0
*******/
// var app_type = Ti.App.Properties.getString('app_type');
// if(app_type){
// 	$.chooseWin.close();
// 	var order = Alloy.createController(app_type == 1 ? 'ayi_order' : 'order').getView(); 
// 	order.open();
// }

$.userBtn.addEventListener('click',function(){
	Ti.App.Properties.setString('app_type',0);
	var order = Alloy.createController('order').getView(); 
	order.open();
});

$.assistantBtn.addEventListener('click',function(){
	Ti.App.Properties.setString('app_type',1);
	var order = Alloy.createController('ayi_order').getView(); 
	order.open();
});






