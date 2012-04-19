//this is your timer, does nothing right now
var ls;

//randomly returns a +1 or -1
randfunc = function(){
	if(Math.random()<0.5) 
		return 1; 
	else 
		return -1;
}

var soldier_count = 0;
var timer;
var ammo = 0;

soldier = function(x, y){
	this.lookx= 0;
	this.looky = 0;
	this.lookangle = 0;
	//this.element = elem;
	this.xloc = x;
	this.yloc = y;

	this.ywalkloc = 1;
	this.ywalkcycle = [	"soldier_walking_1", 
						"soldier_walking_2",
						"soldier_walking_3"];
	this.firing = false;
	this.ammo = 10;
	_this = this;
}

var increment = 10;

soldier.prototype = {
	draw : function(){
		// ctx.fillStyle="#FFFFFF";
		// ctx.fillRect(_this.xloc-10,_this.yloc-10,60,60);
		ctx.save(); // save current state
		ctx.translate(_this.xloc, _this.yloc);
		ctx.translate(15,17);
    	ctx.rotate(_this.lookangle*Math.PI/180); // rotate
    	ctx.fillStyle="#FFFFFF";
		ctx.arc(0,0,40,0,2*Math.PI,false);
		ctx.fill();
		if(_this.firing) {
    		ctx.drawImage(document.getElementById("gunfire"),-4,-28,15,12);
    	}
		ctx.drawImage(document.getElementById(_this.ywalkcycle[_this.ywalkloc]),-15,-17,30,34);
		ctx.restore();
	},

	moveup : function(){
		_this.xloc += increment*Math.sin(_this.lookangle*Math.PI/180);
		_this.yloc -= increment*Math.cos(_this.lookangle*Math.PI/180);
		_this.draw();
	},

	movedown : function(){
		_this.xloc -= increment*Math.sin(_this.lookangle*Math.PI/180);
		_this.yloc += increment*Math.cos(_this.lookangle*Math.PI/180);	
		_this.draw();
	},

	fire: function(){
		if(_this.ammo<=0)
			return;

		_this.ammo--;
		_this.firing = true;
		_this.draw();

		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(200,10,70,15);
		ctx.strokeText("ammo left - "+_this.ammo, 200, 20);

		//this is a hack to delete the gunfire image..
		_this.firing = false;
	}
}

window.onkeyup = function(e){
	if(ls==undefined)
		return;
	
	var evtobj=window.event? event : e;
	var unicode=evtobj.charCode? evtobj.charCode : evtobj.keyCode;
	var actualkey=String.fromCharCode(unicode);
	
	switch(actualkey) {
		case "W":
			ls.moveup();
			break;
		case "S":
			ls.movedown();
			break;
	}
}

window.onmousedown = function(e){
	if(ls==undefined)
		return;

	ls.fire();
	console.log("fire");
	return;
}

window.onmousemove = function(e){
	if(ls==undefined)
		return;
	
	ls.lookx = e.pageX;
	ls.looky = e.pageY;

	disty = ls.yloc - ls.looky;
	distx = ls.xloc - ls.lookx;
	hyp = Math.sqrt(disty*disty + distx*distx);
	ls.lookangle =Math.atan2(disty,distx) * 180/Math.PI; 
	if (ls.lookangle < 0) ls.lookangle += 360;
	ls.lookangle -=90;

	// this.lookangle = this.lookangle*Math.PI/180;

	ls.draw();
}

//when the page loads init your vars and get the canvas and context
window.onload = function() {
	x = 100;
	y = 100;

	c = document.getElementById("myCanvas");
	ctx = c.getContext("2d");

	while(soldier_count<1) {
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,500,500);
		ls = new soldier(200,200);
		ls.draw();
		soldier_count++;
	}
}
