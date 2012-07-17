var bkcolor = "#FFFFFF"
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

var idcount = 0;

soldier = function(x, y){
	this.selected = false;
	this.id = Math.floor(Math.random()*10000);
	this.lookx= 0;
	this.looky = 0;
	this.lookangle = 0;
	this.w = 25;
	this.h = 29;
	//this.element = elem;
	this.loc = new Point(x,y);
	this.rect = new Rect(this.loc.x-this.w/2-increment*2,this.loc.y-this.h/2-increment*2,this.w+(4*increment),this.h+(4*increment));
	this.ywalkloc = 1;
	this.ywalkcycle = [	"soldier_walking_1", 
						"soldier_walking_2",
						"soldier_walking_3"];
	this.firing = false;
	this.ammo = 100;
	this.health = 100;
	this.alive = true;
	this.bleeding = false;
	_this = this;
}

var increment = 3;

soldier.prototype = {
	draw : function(movesoldier){
		ctx.save(); // save current state
		this.rect.clear(ctx);
		
		ctx.translate(this.loc.x, this.loc.y);
 		ctx.rotate(this.lookangle*Math.PI/180); // rotate

		ctx.drawImage(document.getElementById(this.walkingimage(movesoldier)),
			-this.w/2,-this.h/2,this.w,this.h); //save the returns of document.getelementbyid in variables! should be faster
		
		if(this.firing)
    		ctx.drawImage(document.getElementById("gunfire"),0,-19,this.w/3,this.h/3);

    	if(this.bleeding)
    		ctx.drawImage(document.getElementById("bleeding"),0,0,this.w/1,this.h/1);

		ctx.restore();
	},

	walkingimage: function(movesoldier){
		if(movesoldier) {		
			this.ywalkloc++;
			if(this.ywalkloc==3)
				this.ywalkloc=0;
		}
		return this.ywalkcycle[this.ywalkloc];
	},

	moveup : function(force){
		this.loc.x += increment*Math.sin(this.lookangle*Math.PI/180);
		this.loc.y -= increment*Math.cos(this.lookangle*Math.PI/180);
    	this.rect = makerect(this.loc.x-this.w/2-increment*2,this.loc.y-this.h/2-increment*2,this.w+(4*increment),this.h+(4*increment));
    	
		if(!force) {
    		for (var i in soldiers) {
    			if(this.id!=soldiers[i].id && soldiers[i].alive && rectscollide(this.rect, soldiers[i].rect)) {
					this.movedown(true);
    				return;
    			}
    		}
    	}

		this.draw(true);
	},

	movedown : function(force){
		this.loc.x -= increment*Math.sin(this.lookangle*Math.PI/180);
		this.loc.y += increment*Math.cos(this.lookangle*Math.PI/180);	
		this.rect = makerect(this.loc.x-this.w/2-increment*2,this.loc.y-this.h/2-increment*2,this.w+(4*increment),this.h+(4*increment));
		if(!force) {
    		for (var i in soldiers) {
    			if(this.id!=soldiers[i].id && rectscollide(this.rect, soldiers[i].rect)) {
    				this.moveup(true);
    				return;
    			}
    		}
    	}
		this.draw(true);
	},

	fire: function(){
		if(this.ammo<=0)
			return;

		this.ammo--;
		this.firing=true;
		this.draw();

		setTimeout(function(_this) {_this.hidefire();},100,this);
	},

	hidefire: function(){
		this.firing=false;
		this.draw();
	},

	hit: function(damage){
		console.log('hit');
		this.health -= damage;
		
		this.bleeding = true;
		this.draw();

		if(this.health<=0)
			this.kill();
		else
			setTimeout(function(_this) {_this.stopbleeding();},50,this);
	},

	stopbleeding: function(){
		this.bleeding = false;
		if(this.alive) this.draw();
	},

	kill: function(){
		this.alive = false;
		this.loc.x = 10000; //hack to make it go away
		this.rect.clear(ctx);
	},

}

window.onkeydown = function(e){
	if(ls==undefined)
		return;

	console.log('keyup');
	
	switch(e.keyCode) {
		case 87:
			ls.moveup();
			break;
		case 83:
			ls.movedown();
			break;
	}
}

window.onmouseup = function(e){
	if(ls==undefined)
		return;

	sendhit(makepoint(e.pageX, e.pageY));
	ls.fire();
}

window.onresize = function()
{
  c = document.getElementById("myCanvas");
  ctx = c.getContext("2d");
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

//this should be done on the server?
function sendhit(pt) {
	for(var i in soldiers) {
		if(ls.id!=soldiers[i].id && ptinrect(pt,soldiers[i].rect)) {
			//soldiers[i].rect.stroke(ctx, '1', 'red');
			soldiers[i].hit(35);
		}
	}
}

window.onmousemove = function(e){
	if(ls==undefined)
		return;
	
	ls.lookx = e.pageX;
	ls.looky = e.pageY;

	disty = ls.loc.y - ls.looky;
	distx = ls.loc.x - ls.lookx;
	hyp = Math.sqrt(disty*disty + distx*distx);
	
	ls.lookangle =Math.atan2(disty,distx) * 180/Math.PI; 
	if (ls.lookangle < 0) ls.lookangle += 360;
	ls.lookangle -=90;

	ls.draw();
}

var soldiers = [];
var num_soldiers = 4;
var canvas_w;
var canvas_h;
//when the page loads init your vars and get the canvas and context
window.onload = function() {
	c = document.getElementById("myCanvas");
 	ctx = c.getContext("2d");
  	canvas_w = ctx.canvas.width  = window.innerWidth;
  	canvas_h = ctx.canvas.height = window.innerHeight;

	while(soldier_count<num_soldiers) {
		ls = new soldier(100+Math.floor(Math.random()*(canvas_w-200)),100+Math.floor(Math.random()*(canvas_h-200)));
		ls.draw();
		soldiers.push(ls);
		soldier_count++;
	}

	self.setInterval(function(){zombiesoldier();}, 70);
}

function zombiesoldier()
{
	// console.log('zombiesoldier command');
	for (var i in soldiers) {
		if(i==num_soldiers-1 || !soldiers[i].alive)
			continue;
		num = Math.floor(Math.random()*11);
		switch(num)
		{	
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				soldiers[i].moveup();
				break;
			case 8:
				soldiers[i].fire();
				break;
			case 9:
				soldiers[i].lookangle += 20;
				break;	
			case 10:
				soldiers[i].lookangle -= 20;
				break;
		}
	}	
}


function updatedashboard()
{
}