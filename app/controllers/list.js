var _overlay;

$.currentWin.addEventListener('focus',function(){
    Ti.App.current_window = this;
});


function showIndicator(e){
    render(true);
}

function buildMask(current){
    var style;
    if (Ti.Platform.name === 'iPhone OS'){
      style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
    }
    else {
      style = Ti.UI.ActivityIndicatorStyle.PLAIN;
    }
    _overlay = Ti.UI.createView({
        backgroundColor : 'gray',
        height:50,
        width:100,
        borderRadius:5,
        zIndex:999,
        // left:'30%',
        // top:'50%'
        
    });
    var actInd = Titanium.UI.createActivityIndicator({
        //top:0, 
        height:30,
        width:30,
        style:style,
        message:L('loading'),
        color:'white'
    });
    
    _overlay.add(actInd);
    if(current){
        $.currentWin.add(_overlay);
    }else{
        $.historyWin.add(_overlay);
    }
    
    //loading indicator shows...
    actInd.show();
}

function render(current){
    //buildMask(current);
    Indicator.openIndicator();
    Cloud.Objects.query({
        classname: 'orders',
        limit:1000,
        where: {
            sender: Ti.App.global_userId
        }
    }, function (e) {
        if (e.success) {
            var currentItemData = [],
                historyItemData = [];
            for (var i = 0; i < e.orders.length; i++) {
                var order = e.orders[i];
                //Ti.API.info(JSON.stringify(order));
                
                // status_nottaken 0, status_taken: 1, status_finish:2 , status_cancel:-1
                var iconSrc=['/images/status_nottaken.png','/images/status_taken.png','/images/status_finish.png','/images/status_cancel.png'];
                var orderNumber = '#'+order.sender.substring(order.sender.length - 4)+order.id.substring(order.id.length - 6);
                var periodText = order.period.replace('h',L('hour_unit'));
                var item = {
                    id:order.id,
                    typeImg:{image:order.service_type === 0 ? '/images/tryonce.png':'/images/consistent.png'},
                    date:{text:order.date},
                    region:{text:order.address.region.title},
                    address:{text:order.address.detail},
                    period:{text:periodText},
                    fee:{text:order.fee},
                    special_req:{text:order.special_req},
                    status: order.status,
                    statusImg:{image:iconSrc[order.status == -1 ? 3 : order.status]},
                    orderNum :{text:L('order_num')+' '+orderNumber},
                    properties:{searchableText:orderNumber},
                    sender:order.sender,
                    taker:order.taken_by
                };
                
                //order status 0: unreceived; 1: received  -1: dropped; 2: finished
                if(order.status === 0 || order.status === 1){
                    currentItemData.push(item);
                }else{
                    historyItemData.push(item);
                }
                
            }
            //Ti.API.info(JSON.stringify($.section.getItems()));
            $.section.setItems(currentItemData);
            $.section2.setItems(historyItemData);
            
            
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
        //remove indicator
        Indicator.closeIndicator();
    });
}



$.listview.addEventListener('itemclick',function(e){
    var item = e.section.getItemAt(e.itemIndex);
    var detailWin = Alloy.createController('detail',{_param:item,_private:true}).getView(); 
    var nav = Ti.App.global_nav;
    nav.openWindow(detailWin);
    
});

$.listview2.addEventListener('itemclick',function(e){
    var item = e.section.getItemAt(e.itemIndex);
    var detailWin = Alloy.createController('detail',{_param:item,_private:true}).getView();
    var nav = Ti.App.global_nav;
    nav.openWindow(detailWin);
    
});

$.listview.addEventListener('pull',function(e){
    render(true);
});

$.listview.addEventListener('pullend',function(e){
    
});
$.listview2.addEventListener('pull',function(e){
    render(false);
});

$.listview2.addEventListener('pullend',function(e){
    
});

$.currentWin.addEventListener('focus',function(){

    if(Ti.App.list_refresh){
        Ti.API.info('order list refreshed.');
        render();
        Ti.App.list_refresh = false;
    }
    
});




