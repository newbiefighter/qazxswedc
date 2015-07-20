var args = arguments[0] || {};
var _param = args._params;
var self = $.identifyWin;

var _cardImage;

var submitBtn = Ti.UI.createButton({
    top:'10%',
    left:10,
    right:10,
    width:Ti.UI.FILL,
    height:40,
    backgroundColor:'#70c5a8',
    borderRadius:5,
    color:'white',
    title:L('submitBtn')
});

self.add(submitBtn);
init();

function init(){
    if(Cloud.sessionId && Ti.App.global_photoUrl){
        $.portrait.setImage(Ti.App.global_photoUrl);
    }
}


function welcome(){
	TiDialog(L('register_welcome_article'),L('register_welcome_title'),function(e){
	    if (e.index === 0){
	      self.close();
	    }
	});
}


function uploadPortrait(){

    // show indicator
    //buildMask();
    
    Titanium.Media.openPhotoGallery({
        success: function(e){
            Indicator.openIndicator();
            Ti.API.info('here1');
            if(e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO){
               var image = e.media;
               Ti.API.info('here2');
               Cloud.Photos.create({
                    photo: image,
                    title:'portrait',
                    'photo_sizes[preview]':'88x88#',
                    'photo_sync_sizes[]':'preview'
                }, function(e1){
                    if(e1.success){
                        Ti.API.info('here3');
                        var photo = e1.photos[0];
                        Ti.API.info('photo:'+JSON.stringify(photo));
                        $.portrait.setImage(photo.urls.preview);
                        Ti.App.menu_refresh = 2;
                        // delete old one
                        if(Ti.App.global_photoId){
                            Cloud.Photos.remove({
                                photo_id: Ti.App.global_photoId
                            }, function (e2) {
                                if (e2.success) {
                                    Ti.App.global_photoId = photo.id;
                                    Ti.App.global_photoUrl = photo.urls.preview;
                                    Indicator.closeIndicator();
                                }else{
                                    Indicator.closeIndicator();
                                    alert('Error:\n' +
                                        ((e2.error && e2.message) || JSON.stringify(e2)));
                                }
                            });
                        }else{
                            Indicator.closeIndicator();
                        }    
                    }else{
                        Indicator.closeIndicator(); 
                        alert('Error:\n' +
                        ((e1.error && e1.message) || JSON.stringify(e1)));
                        alert("Code: "+e1.code);
                    }
                });
           }
        },
        cancel: function(){
            Indicator.closeIndicator(); 
        },
        error: function(err){
            alert("ERROR: "+err);
        },
        mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
    });
}

function selectPhoto(){
    
    Titanium.Media.openPhotoGallery({
        success: function(e){
            if(e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO){
               _cardImage = e.media;
               $.certificate.setImage(_cardImage);
           }
        },
        cancel: function(){
            //_overlay.hide(); 
        },
        error: function(err){
            alert("ERROR: "+err);
        },
        mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
    });
}

function deleteOldPortrait(){
	if(Ti.App.global_photoId){
        Cloud.Photos.remove({
            photo_id: Ti.App.global_photoId
        }, function (e) {
            if (e.success) {
                Ti.App.global_photoId = photo.id;
                Ti.App.global_photoUrl = photo.urls.preview;
                alert('Error:\n' +
                    ((e.error && e.message) || JSON.stringify(e)));
            }
        });
    }    
}

function buildMask(){
    var style;
    if (Ti.Platform.name === 'iPhone OS'){
      style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
    }
    else {
      style = Ti.UI.ActivityIndicatorStyle.PLAIN;
    }
    _overlay = Ti.UI.createView({
        backgroundColor : 'gray',
        top:'-40%',
        height:50,
        width:100,
        borderRadius:5,
        zIndex:999,
        
    });
    var actInd = Titanium.UI.createActivityIndicator({
        height:30,
        width:30,
        style:style,
        message:L('waiting'),
        color:'white'
    });
    
    _overlay.add(actInd);
    self.add(_overlay);
  
    //loading indicator shows...
    actInd.show();
}

function uploadAssistanCard(){
    
    Cloud.Photos.create({
        photo: _cardImage,
        title:'assistantCard',
        'photo_sizes[card]':'300x200',
        'photo_sync_sizes[]':'card'
    }, function(e){
        if(e.success){
            // update user info
            updateUserInfo();
        }else{
            Indicator.closeIndicator(); 
            alert('Error:\n' +
            ((e.error && e.message) || JSON.stringify(e)));
            alert("Code: "+e.code);
        } 
    });
}

function updateUserInfo(){
    Cloud.Users.update({
        custom_fields: {
            identification_status : 1
        }
    },function(e){
        if(e.success){
            Indicator.closeIndicator();
            Ti.App.account_refresh = true;
            self.close();
            var resultWin = Alloy.createController('result').getView();
            var nav = Ti.App.global_nav;
            if(Ti.Platform.name == "iPhone OS"){
                nav.openWindow(resultWin,{transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
            }else{
                nav.open(resultWin);
            }
        }else{
            Indicator.closeIndicator();
        }
    });
}

$.certificate.addEventListener('click',function(){
	selectPhoto();
});
$.upload_btn.addEventListener('click',function(){
	uploadPortrait();
});
self.addEventListener('focus',function(){
	Ti.App.current_window = this;
});

// $.backBtn.addEventListener('click',function(){
// 	self.close();
// });

if(Ti.Platform.name == "iPhone OS"){
    $.laterBtn.addEventListener('click',function(){
    	self.close();
    });
}else{
    self.activity.onCreateOptionsMenu = function(e) { 
        var menu = e.menu; 
        var menuItem = menu.add({ 
            title : L('later'), 
            //icon : "images/hand.png", 
            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS 
        }); 
        menuItem.addEventListener("click", function(e) { 
            self.close();
        }); 
    };
}
submitBtn.addEventListener('click',function(){
    Indicator.openIndicator();
	if(!_cardImage){
        Indicator.closeIndicator(); 
		return;
	}
    // check if submitted before
    Cloud.Users.showMe(function (e){
        if(e.success){
            var user = e.users[0];
            if(user.custom_fields.identification_status == 1){
                Indicator.closeIndicator(); 
                TiDialog(L('identification_error'));
                return;
            }

            uploadAssistanCard();
        }
    });
	
});