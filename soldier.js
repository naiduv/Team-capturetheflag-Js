
soldier = function(x, y){
	this.selected = false;
	this.id = Math.floor(Math.random()*10000);
	this.teamid = teamid;
	this.lookpt = makepoint(myrand(100),myrand(100));
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
	this.ctx = ctx0;
	this.firing = false;
	this.ammo = 100;
	this.health = 100;
	this.alive = true;
	this.bleeding = false;
	this.waypoint = [];
	_this = this;
}

soldier.prototype = {
	draw : function(movesoldier){
		if(!this.ctx)
			alert('error soldier.draw()');
		
		this.ctx.save(); // save current state
		this.rect.clear(this.ctx);

		this.ctx.translate(this.loc.x, this.loc.y);
 		this.ctx.rotate(this.lookangle*Math.PI/180); // rotate

		this.ctx.drawImage(document.getElementById(this.walkingimage(movesoldier)),
			-this.w/2,-this.h/2,this.w,this.h); //save the returns of document.getelementbyid in variables! should be faster
		
		if(this.firing)
    		this.ctx.drawImage(document.getElementById("gunfire"),0,-19,this.w/3,this.h/3);

    	if(this.bleeding)
    		this.ctx.drawImage(document.getElementById("bleeding"),0,0,this.w/1,this.h/1);

		this.ctx.restore();
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
    	
    	//forcing it down if it collides with another rect
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

		//forcing it up if it collides with another rect
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
		this.rect.clear(ctx0);
	},

	lookat: function(pt){
		this.lookpt = pt;
		this.calclookangle();
	},

	calclookangle: function(){
		distx = this.loc.x - this.lookpt.x;
		disty = this.loc.y - this.lookpt.y;
		hyp = Math.sqrt(disty*disty + distx*distx);
	
		this.lookangle =Math.atan2(disty,distx) * 180/Math.PI; 
		if (this.lookangle < 0) this.lookangle += 360;
		this.lookangle -=90;
	}

}


function makesoldier(teamid, id,x,y,lookx,looky) {
	s = new soldier(x,y);
	s.teamid = teamid;
	s.id = id;
	s.lookpt = makepoint(lookx, looky);
	return s;
}

