//this is your timer, does nothing right now
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
	_this = this;
	//this.element = elem;
	this.xloc = x;
	this.yloc = y;

	this.ywalkloc = 1;

	this.ywalkcycle = [	"soldier_walking_1", 
						"soldier_walking_2",
						"soldier_walking_3"];
}

soldier.prototype = {
	draw : function(){
		ctx.drawImage(document.getElementById(_this.ywalkcycle[0]),_this.xloc,_this.yloc,30,34);
	},

	moveup : function(){
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,500,500);
		ctx.drawImage(document.getElementById(_this.ywalkcycle[_this.ywalkloc-1]),_this.xloc,_this.yloc,30,34);
		if(this.ywalkloc==3) this.ywalkloc=0;
		_this.ywalkloc++;
		_this.yloc-=5;
	},

	movedown : function(){
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,500,500);
		ctx.drawImage(document.getElementById(_this.ywalkcycle[_this.ywalkloc-1]),_this.xloc,_this.yloc,30,34);
		if(this.ywalkloc==1) this.ywalkloc=4;
		_this.ywalkloc--;
		_this.yloc+=5;
	},
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
