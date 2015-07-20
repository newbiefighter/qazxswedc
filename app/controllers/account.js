var self = $.accountWin;

if(Ti.Platform.name == "iPhone OS"){
    self.hideTabBar();
}else{
    self.setWindowSoftInputMode(Ti.UI.Android.SOFT_INPUT_ADJUST_PAN);
}

var _identificationStatus;

if(Ti.App.Properties.getString('app_type') == 0){
    if(Ti.App.global_photoUrl){
        $.portrait.setImage(Ti.App.global_photoUrl);
    }
    self.remove(Ti.Platform.name == "iPhone OS" ? $.tableView2 : $.verify_view);
}else{
    self.remove($.portrait);
    self.remove($.upload);
}

//render 
if(Ti.Platform.name != "iPhone OS"){
    $.infoView.remove($.tableView);
}
var tableData = [],
    inputs = [];
for(var i=0; i<4; i++){
    var icon = Ti.UI.createImageView({
        width:22,
        height:22,
        left:5
    });
    var label = Ti.UI.createLabel({
        left:5,
        color:'#70c5a8',
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        width: Ti.UI.SIZE, 
        height: Ti.UI.SIZE
    });
    inputs[i] = Ti.UI.createTextField({
        paddingRight:10,
        font : {
            fontSize : 16,
            fontFamily : 'Helvetica Neue'
        },
        color : "#000",
        width : Ti.UI.FILL,
        height: Ti.UI.FILL,
        textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
        autocapitalization : Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect : false,
        passwordMask : false /* Removing this or setting it to false makes the input field behave as expected */
    });
    switch(i){
    
        case 0:
            label.setText(L("username"));
            inputs[i].setValue(Ti.App.global_username);
            icon.setBackgroundImage('/images/username.png');
            break;
        // case 1:
        //     label.setText(L("current_pwd"));
        //     inputs[i].setHintText(L("required"));
        //     inputs[i].setPasswordMask(true);
        //     icon.setBackgroundImage('password.png');
        //     break;
        case 1:
            label.setText(L("new_pwd"));
            inputs[i].setHintText(L("password_hint"));
            inputs[i].setPasswordMask(true);
            icon.setBackgroundImage('/images/password.png');
            break;
        case 2:
            label.setText(L("new_pwd_again"));
            inputs[i].setHintText(L("required"));
            inputs[i].setPasswordMask(true);
            icon.setBackgroundImage('/images/password.png');
            break;

    }
    var container = Ti.UI.createView({
        top:"5%",
        height:"90%",
        width:Ti.UI.FILL,
        layout:"horizontal",
    });
    if(i<3){
        container.add(icon);
        container.add(label);
        container.add(inputs[i]);
    }else{
        var submitBtn = Ti.UI.createButton({
            backgroundColor:'#70c5a8',
            color:'#fff',
            width:"25%",
            left:'75%',
            height:Ti.UI.FILL,
            title:L('submitBtn')
        });
        container.add(submitBtn);
        submitBtn.addEventListener('click',updateBasicInfo);
    }
    if(Ti.Platform.name == "iPhone OS"){
        var row = Ti.UI.createTableViewRow({
            className : 'passwordTest',
            height:'25%'
        });
        row.add(container);
        tableData.push(row);
    }else{
        var row = Ti.UI.createView({
            top: 0,
            height:"25%",
            width:Ti.UI.FILL,
            layout:"horizontal",
            left:10,
            right:10,
            borderColor:"#d1d1d1",
            borderRadius:5
        });
        row.add(container);
        $.infoView.add(row);
    }
    

}
if(Ti.Platform.name == "iPhone OS"){
    $.tableView.setData(tableData);
}
// var tableView = Ti.UI.createTableView({
//     top:'5%',
//     left:10,
//     right:10,
//     scrollable:false,
//     backgroundColor : 'white',
//     borderColor:"#d1d1d1",
//     borderRadius:5,
//     //height:Ti.UI.SIZE,
//     width:Ti.UI.FILL,
//     height:'35%',
//     allowsSelection: false, 
//     data : tableData
// });


// self.add(tableView);
function initIDStatus(){
    Cloud.Users.showMe(function (e) {
        if (e.success) {
            var user = e.users[0];
            var icons = ['/images/unidentified.png','/images/inreview.png','/images/identified.png'];
            _identificationStatus = user.custom_fields.identification_status;
            $.verify_image.setImage(icons[_identificationStatus]);
        }
    });
}


var logoutBtn = Ti.UI.createButton({
    top:'15%',
    left:10,
    right:10,
    width:Ti.UI.FILL,
    height:40,
    backgroundColor:'#70c5a8',
    borderRadius:5,
    color:'white',
    title:L('logout')
});

self.add(logoutBtn);



function updateBasicInfo(){
    Indicator.openIndicator();
    if(inputs[1].value == '' && inputs[2].value == '' && inputs[1].value == ''){
        updateUsername();
    }else{
        resetPwdAndUsername();
    }
}

function updateUsername(){
    Cloud.Users.update({
        username:inputs[0].value
    }, function(e){
        Indicator.closeIndicator();
        if(e.success){
            Ti.App.Properties.setString('username',inputs[0].value);
            if(Ti.Platform.name == "iPhone OS"){
                TiDialog(L('info_modify_success'));
            }else{
                Toast(L('info_modify_success')); 
            }
        }else{
            TiDialog(L('info_modify_fail'),L('error'));
        }
    });
    
}

function resetPwdAndUsername(){
    Cloud.Users.update({
        username:inputs[0].value,
        password:inputs[1].value,
        password_confirmation:inputs[2].value
    }, function(e){
        Indicator.closeIndicator();
        if(e.success){
            Ti.App.Properties.setString('username',inputs[0].value);
            Ti.App.Properties.setString('password',inputs[1].value);
            if(Ti.Platform.name == "iPhone OS"){
                TiDialog(L('info_modify_success'));
            }else{
                Toast(L('info_modify_success')); 
            }
            
            inputs[1].setValue('');
            inputs[2].setValue('');
        }else{
            TiDialog(L('info_modify_fail'),L('error'));
        }
    });
}

function verificationViewClick(){
    if(_identificationStatus < 2){
        //redirect to identification 
        var identifyWin = Alloy.createController('identify').getView();
        var nav = Ti.App.global_nav;
        if(Ti.Platform.name == "iPhone OS"){
            nav.openWindow(identifyWin,{transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
        }else{
            nav.open(identifyWin);
        }
    }else{
        TiDialog(L('identification_msg'));
    }
}

self.addEventListener('focus',function(){
    Ti.App.current_window = this;
});
//upload 
$.upload.addEventListener('click',function(){
    uploadPortrait();
});

if(Ti.Platform.name == "iPhone OS"){
    $.tableView2.addEventListener('click',function(e){
        if(e.rowData.id == 'assistant_verification'){
            // 0 : not identified 1: in review 2: identified 
            verificationViewClick();
        }
    });
}else{
    $.verify_view.addEventListener('click',verificationViewClick);
}



// logout
logoutBtn.addEventListener('click',function(){
    Indicator.openIndicator();
    Cloud.Users.logout(function (e) {
        if (e.success) {
            clearLoginCache();
            var dialog = Ti.UI.createAlertDialog({
                cancel: 1,
                buttonNames: ['OK'],
                message: L('logout_text'),
                title: 'Success'
              });
            dialog.addEventListener('click', function(e){
                if (e.index === 0){
                    Ti.App.menu_refresh = 1;
                    self.close();
                }
            });
            Indicator.closeIndicator();
            dialog.show();
        } else {
            Indicator.closeIndicator();
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
});


self.addEventListener('focus',function(){
    if(Ti.App.account_refresh){
        initIDStatus();
        Ti.App.account_refresh = false;
    }
});



function clearLoginCache(){
    Ti.App.Properties.setString('username',null);
    Ti.App.Properties.setString('password',null);
}



function uploadPortrait(){

    // show indicator
    Indicator.openIndicator();
    
    Titanium.Media.openPhotoGallery({
        success: function(e){
            if(e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO){
               var image = e.media;
               // var thumbnail = e.thumbnail;
               // Ti.API.info('thumbnail:'+JSON.stringify(thumbnail));
                Cloud.Photos.create({
                    photo: image,
                    title:'portrait',
                    'photo_sizes[preview]':'88x88#',
                    'photo_sync_sizes[]':'preview'
                }, function(e1){
                    if(e1.success){
                        var photo = e1.photos[0];
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

