//this is your timer, does nothing right now
var ls;

Timer = function() { 
	this.intervalid = 0;
	_this = this;
	this.lonesoldier;
}

//randomly returns a +1 or -1
randfunc = function(){
	if(Math.random()<0.5) 
		return 1; 
	else 
		return -1;
}

var soldier_count = 0;
var timer;

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
	_this.firing = false;
	_this = this;
}

var increment = 3;

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
    		_this.firing = false;
    	}
		ctx.drawImage(document.getElementById(_this.ywalkcycle[_this.ywalkloc]),-15,-17,30,34);
		ctx.restore();
	},

	moveup : function(){
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(_this.xloc,_this.yloc,50,50);
		_this.xloc += increment*Math.sin(_this.lookangle*Math.PI/180);
		_this.yloc -= increment*Math.cos(_this.lookangle*Math.PI/180);
		_this.draw();
	},

	movedown : function(){
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(_this.xloc,_this.yloc-15,50,50);
		_this.xloc -= increment*Math.sin(_this.lookangle*Math.PI/180);
		_this.yloc += increment*Math.cos(_this.lookangle*Math.PI/180);	
		_this.draw();
	},

	fire: function(){
		_this.firing = true;
		_this.draw();	
	}
}

window.onkeypress = function(e){
	var evtobj=window.event? event : e;
	var unicode=evtobj.charCode? evtobj.charCode : evtobj.keyCode;
	var actualkey=String.fromCharCode(unicode);
	
	switch(actualkey) {
		case "w":
			ls = timer.getlonesoldier();
			ls.moveup();
			break;
		case "s":
			ls = timer.getlonesoldier();
			ls.movedown();
			break;
	}
}

window.onmousedown = function(e){
	ls = timer.getlonesoldier();
	ls.fire();
}

window.onmousemove = function(e){
	ls = timer.getlonesoldier();
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

Timer.prototype = {
	update: function() {
	},

	run: function() {
		// document.onmousemove = updatemouseloc;
		// document.onmousedown = setclicked;
		//_this.update();

		if(soldier_count==0) {
			ctx.fillStyle="#FFFFFF";
			ctx.fillRect(0,0,500,500);
			lonesoldier = new soldier(200,200);
			lonesoldier.draw();
			soldier_count++;
		}
	},

	getlonesoldier: function(){
		return lonesoldier;
	}
}


// function updatemouseloc(e) {
// 	mousex = e.pageX;
// 	mousey = e.pageY;
// }

//when the page loads init your vars and get the canvas and context
window.onload = function() {
	x = 100;
	y = 100;

	c = document.getElementById("myCanvas");
	ctx = c.getContext("2d");

	timer = new Timer();
	timer._intervalId = setInterval(timer.run, 10);
}
