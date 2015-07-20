$.counterWin.addEventListener('focus',function(){
    Ti.App.current_window = this;
});

var circle = Ti.UI.createImageView({
			top:100,
            width: 100,
            height: 100,
            borderRadius: 50,
            borderColor: '#000',
            backgroundColor: '#fff'
});

var box = Ti.UI.createView({
  backgroundColor : 'red',
  height : '100',
  width : '100'
});


box.addEventListener('click', function() {
  var matrix = Ti.UI.create2DMatrix()
  matrix = matrix.rotate(180);
  matrix = matrix.scale(2, 2);
  var a = Ti.UI.createAnimation({
    transform : matrix,
    duration : 2000,
    autoreverse : true,
    repeat : 3
  });
  box.animate(a);
});



var portrait = Ti.UI.createImageView({
	top:100,
    width: 100,
    height: 100,
    borderRadius: 50
});

var tip = Ti.UI.createLabel({
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	font: { fontSize:25 },
	color:'#0099cc',
  	shadowColor: '#aaa',
  	top:250,
  	width: Ti.UI.SIZE, 
  	height: Ti.UI.SIZE
});

var portraits = ["portrait1.png","portrait2.png","portrait3.png","portrait4.png"];
var count = 0;
var timer = setInterval(function(){
    count++;
    
	portrait.setBackgroundImage(portraits[count%4]);
    tip.setText("already push to "+count+" assistants successfully.");
    var rd = Math.floor(Math.random()*30);
    if(rd == 17){
    	var takerWin = Alloy.createController('taker').getView();
      $.counterWin.close();
      takerWin.open();
		  //var nav = Ti.App.global_nav;
	    //nav.openWindow(takerWin,{animated:true});
    }
    if (count == 300 || rd == 17) {
        clearInterval(timer);
    }
}, 250);


portrait.addEventListener('click',function (argument) {
	this.setBackgroundImage("minus-icon.png");
})

$.counterWin.add(portrait);
$.counterWin.add(tip);


