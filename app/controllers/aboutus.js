var self = $.aboutusWin;
if(Ti.Platform.name == "iPhone OS"){
	$.backBtn.addEventListener('click',function(){
		$.aboutusWin.close();
	});
}

init();

function init(){
	var decoration = [],
		label_text = [L('website'),L('facebook'),L('hotline')],
		artical_text= ['www.tidyuphk.com','www.facebook.com/ekugahk','53732989'];
	for (var i = 0; i < 3; i++) {
		var lineView = Ti.UI.createView({
			width:Ti.UI.SIZE,
			height:Ti.UI.SIZE,
			layout:'horizontal',
			top:5
		});
		var label = Ti.UI.createLabel({
			width:Ti.UI.SIZE,
			height:Ti.UI.SIZE,
			font:{
				fontSize:14
			},
			color:'#888888',
			text: label_text[i]
		});
		var artical = Ti.UI.createLabel({
			left: 5,
			width:Ti.UI.SIZE,
			height:Ti.UI.SIZE,
			font:{
				fontSize:16
			},
			color:'blue',
			text:artical_text[i],
			index : i
		});
		decoration[i] = decorateLabel(artical,0);
		decoration[i].addEventListener('click',function(){
			var url = this.getChildren()[0];
			if(url.index < 2){
				Ti.Platform.openURL(url.text);
			}else{
				contactUs();
			}
		});

		lineView.add(label);
		lineView.add(decoration[i]);
		self.add(lineView);
	};
}



function contactUs(){
    var dialog = Ti.UI.createAlertDialog({
        cancel:0,
        buttonNames: [L('cancel'),L('confirm')],
        message: L('contact_tip')
        //title: 'Tip'
    });
    dialog.addEventListener('click',function(e){
        
        if(e.index === e.source.cancel){
            dialog.hide();
            return;
        }
        Titanium.Platform.openURL('tel:53732989');
    });
    dialog.show();
}