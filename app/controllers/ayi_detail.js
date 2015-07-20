var args = arguments[0] || {};
var _item = args._param;
init();

$.detailWin.addEventListener('focus',function(){
    Ti.App.current_window = this;
});

function init(){
	$.detailWin.hideTabBar();
	$.order_zone.setText(_item.region.text);
	$.service_type.setImage(_item.typeImg.image);
	$.date.setText(_item.date.text);
	$.period.setText(_item.period.text);
	$.fee.setText(_item.fee.text);
	$.special_req.setText(_item.special_req.text);
	$.statusImg.setImage(_item.statusImg.image);

	getAssistantInfo(_item.sender);
	$.slider.text = $.slider.value;

	switch(_item.status){
		case 0:
			$.rate.hide();
			if(Ti.App.Properties.getString('app_type') == 1){
				$.dropBtn.setTitle(L('grab'));
			}
			break;
		case -1:
			$.rate.hide();
			$.dropBtn.hide();
			break;
		case 1:
			$.rating.hide();
			if(Ti.App.Properties.getString('app_type') == 1){
				$.dropBtn.hide();
			}
			break;
		case 2:
			$.dropBtn.hide();
			break;
	}
	if(Ti.App.Properties.getString('app_type') == 1){
		$.rate.hide();
	}


	
}

function getAssistantInfo(uid){
	Cloud.Users.show({
	    user_id:uid
	}, function (e) {
		if(e.success){
			var user = e.users[0];
			$.name.setText(user.username);
			if(user.mark){
				$.average_mark.setText(user.mark);
			}
			
		}
	});
	Cloud.Photos.query({
        user_id:uid,
        where:{
            title:'portrait'
        }        
    },function(e){
    	if(e.success){
    		var photo = e.photos[0];
    		$.badge_portrait.setImage(photo.urls.preview);
    	}
    });
}

//rating
function updateLabel(e){
	// if(_item.status == 1){
	// 	TiDialog('You cannot grade the assistant until the status of order becomes finished.');
	// 	return;
	// }
    $.instant_mark.text = 'Rate: ' + String.format("%2.1f", e.value);
}


$.dropBtn.addEventListener('click',function(){
	
	Cloud.Objects.update({
	    classname: 'orders',
	    id: _item.id,
	    fields: {
	        status:-1
	    }
	}, function (e) {
	    if (e.success) {
	        $.detailWin.close();
	        //Ti.App.list_refresh = true;
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
});