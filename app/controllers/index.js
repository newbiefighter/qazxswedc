

Ti.UI.setBackgroundColor('transparent');

Ti.Network.addEventListener('change', function(e) {
  var util = require('util');
  util.networkLostAlert();
});

var username = Ti.App.Properties.getString('username');
var password = Ti.App.Properties.getString('password');
if(Cloud.sessionId){
    showMain();
}else if(username && password){
    Cloud.Users.login({
        login: username,
        password: password
    }, function (e) {
        if (e.success) {
            var user = e.users[0];
            getPortrait(user);
            Ti.App.menu_refresh = 1;
            showMain();
        }else{
            introSlideShow();
        }
    });
}else{
    introSlideShow();
}

/*******
 user type assistant:1  user:0
*******/
function introSlideShow(){
    var img1 = Ti.UI.createImageView({
        image:'/images/background/splash1.png'
    });
    var img1Wrapper = Ti.UI.createScrollView({
        
        maxZoomScale:4.0,
    });
    img1Wrapper.add(img1);

    var img2 = Ti.UI.createImageView({
        image:'/images/background/splash2.png'
    });
    var img2Wrapper = Ti.UI.createScrollView({
        maxZoomScale:4.0,
    });
    img2Wrapper.add(img2);
    var img3 = Ti.UI.createImageView({
        image:'/images/background/splash3.png'
    });
    var img3Wrapper = Ti.UI.createScrollView({
        maxZoomScale:4.0,
    });
    img3Wrapper.add(img3);
    var img4 = Ti.UI.createImageView({
        image:'/images/background/splash4.png'
    });
    var img4Wrapper = Ti.UI.createScrollView({
        maxZoomScale:4.0,
    });
    var startBtn = Ti.UI.createButton({
    	bottom:'10%',
        left:'5%',
        right:'5%',
    	width:Ti.UI.FILL,
    	height:35,
        borderRadius:5,
    	title:L('startBtn'),
        color:'#fff',
    	backgroundColor:'#70c5a8'
    });
    img4Wrapper.add(img4);
    img4Wrapper.add(startBtn);
    var photosView = Ti.UI.createScrollableView({
        //showPagingControl:true,
        views:[img1Wrapper, img2Wrapper,img3Wrapper, img4Wrapper]
    });
    $.index.add(photosView);


    startBtn.addEventListener('click',function(e){
    	showMain();
    	$.index.close();
    });


    if(Ti.Platform.name != "iPhone OS"){
        $.index.open();
        $.index.addEventListener('open', function(){    
            this.activity.actionBar.hide();
        });
    }else{
        setTimeout(function () {
            $.index.open();
        }, 3 * 1000);
    }
    

}

function showMain(){
    var app_type = Ti.App.Properties.getString('app_type');
    if(app_type){
        var order = Alloy.createController(app_type == 1 ? 'ayi_order' : 'order').getView(); 
        order.open();
    }else{
        var choose = Alloy.createController('choose').getView(); 
        choose.open();
    }
}

function getPortrait(user){
    Ti.API.info(JSON.stringify(user));
    Cloud.Photos.query({
        where:{
            user_id:user.id,
            title:'portrait'
        }        
    },function(e){
        if(e.success){
              Ti.API.info('.....:'+e.photos.length);
            if(e.photos.length > 0){
                var photo = e.photos[0];
                Ti.API.info('preview:'+photo.urls.preview);
                Ti.App.global_userId = user.id;
                Ti.App.global_username = user.username;
                Ti.App.global_photoId = photo.id;
                Ti.App.global_photoUrl = photo.urls.preview;
            }else{
                Ti.App.global_userId = user.id;
                Ti.App.global_username = user.username;
            }
            
        }

    });
}

