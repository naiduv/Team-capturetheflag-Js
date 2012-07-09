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

soldier = function(x, y){
	this.selected = false;
	this.lookx= 0;
	this.looky = 0;
	this.lookangle = 0;
	this.w = 25;
	this.h = 29;
	//this.element = elem;
	this.loc = new Point(x,y);
	this.rect = new Rect(x-this.w/2,y+this.h/2,this.w,this.h); //scaled because of translation for rotation, see draw()
	this.ywalkloc = 1;
	this.ywalkcycle = [	"soldier_walking_1", 
						"soldier_walking_2",
						"soldier_walking_3"];
	this.firing = false;
	this.ammo = 100;
}

var increment = 4;

soldier.prototype = {
	draw : function(movesoldier){
		// ctx.fillStyle="#FFFFFF";
		// ctx.fillRect(this.loc.x-10,this.loc.y-10,60,60);
		ctx.save(); // save current state
		//use the height because it is longer (in the next line)
		ctx.clearRect(this.loc.x-this.w,this.loc.y-this.h,this.w*2,this.h*2);
		ctx.translate(this.loc.x, this.loc.y);
		//ctx.translate(this.w/2,this.h/2);
 		ctx.rotate(this.lookangle*Math.PI/180); // rotate
 		//debugger;
		// if(this.selected){
		// 	ctx.arc(0,0,40,0,2*Math.PI,false);
		// 	ctx.stroke();
		// }

		if(this.firing)
    		ctx.drawImage(document.getElementById("gunfire"),-2,-24,this.w/3,this.h/3);

			ctx.drawImage(document.getElementById(this.walkingimage(movesoldier)),
				-this.w/2,-this.h/2,this.w,this.h);
		
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

	moveup : function(){
		this.loc.x += increment*Math.sin(this.lookangle*Math.PI/180);
		this.loc.y -= increment*Math.cos(this.lookangle*Math.PI/180);
		this.draw(true);
	},

	movedown : function(){
		this.loc.x -= increment*Math.sin(this.lookangle*Math.PI/180);
		this.loc.y += increment*Math.cos(this.lookangle*Math.PI/180);	
		this.draw(true);
	},

	fire: function(){
		if(this.ammo<=0)
			return;

		this.ammo--;
		this.firing = true;
		this.draw();

		//this is a hack to delete the gunfire image..
		this.firing = false;
	}
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

window.onmousedown = function(e){
	if(ls==undefined)
		return;

	mpt = new Point(e.pageX, e.pageY);
	if(ptinrect(mpt,ls.rect)){
		ls.selected = true;
		return;
	}

	ls.fire();
	console.log("fire");
	return;
}

window.onresize = function()
{
  c = document.getElementById("myCanvas");
  ctx = c.getContext("2d");
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  drawdashboard();
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
var cavnvas_h;
//when the page loads init your vars and get the canvas and context
window.onload = function() {
	c = document.getElementById("myCanvas");
 	ctx = c.getContext("2d");
  	canvas_w = ctx.canvas.width  = window.innerWidth;
  	canvas_h = ctx.canvas.height = window.innerHeight;

	while(soldier_count<num_soldiers) {
		ls = new soldier(canvas_w-400-(soldier_count*50),canvas_h-100-(soldier_count*50));
		ls.draw();
		soldiers.push(ls);
		soldier_count++;
	}

	self.setInterval(function(){zombiesoldier(2);}, 70);
}

function zombiesoldier()
{
	// console.log('zombiesoldier command');
	i = 0;
	while(i<num_soldiers-1) {
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
		rectscollide(soldiers[i].rect, soldiers[3].rect);
		i++;
	}

	// console.log(num);
}


function updatedashboard()
{
}