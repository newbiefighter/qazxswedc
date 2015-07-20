var args = arguments[0] || {};
var _item = args._param;
var _private = args._private;
var self = $.detailWin;
init(_private);

self.addEventListener('focus',function(){
    Ti.App.current_window = this;
});

function init(showAddress){
	if(Ti.Platform.name == "iPhone OS"){
		self.hideTabBar();
	}
	$.order_zone.setText(_item.region.text);
	$.service_type.setImage(_item.typeImg.image);
	$.date.setText(_item.date.text);
	$.period.setText(_item.period.text);
	$.fee.setText(_item.fee.text);
	$.special_req.setText(_item.special_req.text);
	$.statusImg.setImage(_item.statusImg.image);
	if(showAddress){
		$.address_label.show();
		$.address.setText(_item.address.text);
	}else{
		//$.address_label.hide();
		$.address_label.setVisible(false);
	}
	$.slider.text = $.slider.value;
	if(Ti.App.Properties.getString('app_type') == 0){
		getAssistantInfo(_item.taker);
		//self.remove($.takeBtn);
		switch(_item.status){
			case 0:
				//$.rate.hide();
                $.scrollView.remove($.rate);
                $.funcBtn.setTop('10%');
				$.funcBtn.setTitle(L('drop_order'));
				break;
			case -1:
                $.scrollView.remove($.rate);
                $.funcBtn.setTop('10%');
				//$.rate.hide();
				$.funcBtn.hide();
				$.funcBtn.setTouchEnabled(false);
				break;
			case 1:
				//$.rate.hide();
				$.funcBtn.setTitle(L('confirm_order'));
				// funcBtn turn into confirm status
				break;
			case 2:
				$.funcBtn.hide();
				$.funcBtn.setTouchEnabled(false);
				break;
		}
	}else{
		//$.rate.hide();
        $.scrollView.remove($.rate);
		$.funcBtn.setTop('10%');
		if(_item.status == 0){
			$.funcBtn.setTitle(L('take_order'));
		}else{
			//$.funcBtn.hide();
			$.funcBtn.setVisible(false);
		}
	}
	


	
}

function getAssistantInfo(uid){
	Cloud.Users.show({
	    user_id:uid
	}, function (e) {
		if(e.success){
			var user = e.users[0];
			$.name.setText(user.username);
		}
	});
	Cloud.Photos.query({
        where:{
        	user_id:uid,
            title:'portrait'
        }        
    },function(e){
    	if(e.success){
    		var photo = e.photos[0];
    		Ti.API.info(JSON.stringify(e.photos));
    		$.badge_portrait.setImage(photo.urls.preview);
    	}
    });
    calculateAssistantGrade(uid);
}

function calculateAssistantGrade(uid){
    Cloud.Objects.query({
        classname: 'orders',
        limit:1000,
        where: {
            taken_by:uid,
            status:2
        }
    },function(e){
        if (e.success) {
            var count = e.orders.length;
            if(count < 1){
                return;
            }
            var total = 0;
            for (var i = 0; i < count; i++) {
                var order = e.orders[i];
                total += order.mark;
            };
            var average = String.format('%3.2f',total/count);
            Ti.API.info(total+'-'+count);
            $.average_mark.setText(average);
        }
    });
}


//rating
function updateLabel(e){
    $.instant_mark.text = 'Rate: ' + String.format("%2.1f", e.value);
}

function dropOrder(){
	Cloud.Objects.update({
	    classname: 'orders',
	    id: _item.id,
	    fields: {
	        status:-1
	    }
	}, function (e) {
	    if (e.success) {
	        self.close();
	        Ti.App.list_refresh = true;
	    } else {
	        alert('Error:\n' +
	            ((e.error && e.message) || JSON.stringify(e)));
	    }
	});
}

function takeOrder(){
	Cloud.Objects.update({
        classname: 'orders',
        id: _item.id,
        fields: {
            status:1,
            taken_by:Ti.App.global_userId
        }
    }, function (e) {
        if (e.success) {
            sendNotification(_item.sender);
            
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}

function confirmOrder(){
	Cloud.Objects.update({
        classname: 'orders',
        id: _item.id,
        fields: {
            mark:parseFloat(String.format("%2.1f",$.slider.value)),
            status:2
        }
    }, function (e) {
        if (e.success) {
        	//TODO
            //sendNotification(_item.sender);
         	self.close();
	        Ti.App.list_refresh = true;
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}

$.funcBtn.addEventListener('click',function(){
	if(!Cloud.sessionId){
        TiDialog(L('login_first'),'Tips');
        return;
    }
    if(_item.status == 0 && Ti.App.Properties.getString('app_type') == 0){
    	// order status is untaken, user version
    	dropOrder();
    }else if(_item.status == 0 && Ti.App.Properties.getString('app_type') == 1){
    	// order status is untaken, assitant version
    	takeOrder();
    }else if(_item.status == 1 && Ti.App.Properties.getString('app_type') == 0){
    	// order status is taken, user version
    	confirmOrder();
    }
	
});


function sendNotification(to_id){
    Cloud.Users.show({
        user_id:to_id
    }, function (e) {
        if(e.success){
            var user = e.users[0];
            if(user.custom_fields.notification == 'off'){
                Ti.API.info('Cancel notification');
                return;
            }
            var param;
            if(user.custom_fields.noti_sound == 'on' && user.custom_fields.noti_vibrate == 'on'){
                param = {
                    "alert": L("orderTaken"),
                    //"badge": "+1",
                    "sound": "default",
                    "vibrate": true
                };
            }else if(user.custom_fields.noti_sound == 'on' && user.custom_fields.noti_vibrate == 'off'){
                param = {
                    "alert": L("orderTaken"),
                    "sound": "default"
                };
            }else if(user.custom_fields.noti_sound == 'off' && user.custom_fields.noti_vibrate == 'on'){
                param = {
                    "alert": L("orderTaken"),
                    "vibrate": true
                };
            }else{
                param = {
                    "alert": L("orderTaken")
                };
            }
            var notiParam ={
                channel: 'user',
                payload: param,
                to_ids:to_id
            };
            Cloud.PushNotifications.notify(notiParam,function (e1) {
                if (e1.success) {
                    TiDialog(L('order_taken_success'));
                }
                self.close();
                Ti.App.list_refresh = true;
            });

        }
    });

}