
tank = function(ctx, ctxb, x, y){
	this.selected = false;
	this.id = Math.floor(Math.random()*10000);
	this.teamid = teamid;
	this.lookpt = makepoint(myrand(100),myrand(100));
	this.lookangle = 0;
	this.w = 25;
	this.h = 29;
	//this.element = elem;
	this.loc = new Point(x,y);
	this.collrect = new Rect(this.loc.x-this.w/2-increment*2,this.loc.y-this.h/2-increment*2,this.w+(4*increment),this.h+(4*increment));
	this.rect = new Rect(this.loc.x-this.w/2-increment*2,this.loc.y-this.h/2-increment*2,this.w+(4*increment),this.h+(4*increment));
	this.ywalkloc = 1;
	this.ywalkcycle = [	"tank_walking_1", 
						"tank_walking_2",
						"tank_walking_3"];
	this.ctx = ctx;
	this.ctxb = ctxb;
	this.firing = false;
	this.ammo = 100;
	this.health = 100;
	this.alive = true;
	this.bleeding = false;
	this.waypoint = [];
	this.sendcount = 0;
	_this = this;
}

tank.prototype = {
	select: function(){
		if(this.selected)
			return;
		this.selected = true;
	},

	deselect: function(){
		if(!this.selected)
			return;
		this.selected = false;
		//we need to redraw, in order to clear the selection circle
		this.draw();
	},

	draw : function(movetank){
		if(!this.ctx)
			alert('error tank.draw()');

		this.ctx.save(); // save current state
		this.rect.clear(this.ctx);

		this.ctx.translate(this.loc.x, this.loc.y);
 		this.ctx.rotate(this.lookangle*Math.PI/180); // rotate

		this.ctx.drawImage(document.getElementById(this.walkingimage(movetank)),
			-this.w/2,-this.h/2,this.w,this.h); //save the returns of document.getelementbyid in variables! should be faster
		
		if(this.firing)
    		this.ctx.drawImage(document.getElementById("gunfire"),0,-19,this.w/3,this.h/3);

    	if(this.bleeding)
    		this.ctx.drawImage(document.getElementById("bleeding"),0,0,this.w/1,this.h/1);

		this.ctx.restore();

		//ctxb NOT ctx
		this.rect.clear(this.ctxb);
		this.drawselectionmarker();
		this.drawhealth();
	},

	drawselectionmarker: function(){
		if(this.selected){
			this.ctxb.beginPath();
			this.ctxb.arc(this.loc.x,this.loc.y,this.w/2,0,2*Math.PI, true);
			this.ctxb.fillStyle = "rgba(0, 255, 0, 0.2)";
			this.ctxb.fill();
		}
	},

	drawhealth: function() {
		this.ctxb.beginPath();
		this.ctxb.arc(this.loc.x,this.loc.y,this.w/2+1,0,2*Math.PI, true);
		this.ctxb.lineWidth = 2;
		this.ctxb.strokeStyle = 'green';
		this.ctxb.stroke();
	},

	walkingimage: function(movetank){
		if(movetank) {		
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
		// this.collrect = makerect(this.loc.x-this.w/2-increment*2,this.loc.y-this.h/2-increment,this.w+increment*4,this.h+increment*4);

		// if(Socket) {
		// 	var message= '{"fc":'+"'mu'"+',"gid":'+gameid+',"tid":'+this.teamid+ ',"pid":'+this.id +',"px":'+round(this.loc.x) +',"py":'+round(this.loc.y)+ ',"lx":'+round(this.lookpt.x) +',"ly":'+round(this.lookpt.y)+'}';
		// 	this.sendcount++;
		// 	if(message.length>35 && message.length<115){
		// 		if(this.sendcount==10){
		// 			Socket.send(message);
		// 			this.sendcount=0;
		// 		}
		// 	}
		// }

    	//forcing it down if it collides with another rect
		if(!force) {
    		for (var i in tanks) {
    			if(this.id!=tanks[i].id && tanks[i].alive && rectscollide(this.rect, tanks[i].rect)) {
					this.movedown(true);
    				this.goaround();
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
		this.collrect = makerect(this.loc.x-this.w/2,this.loc.y-this.h/2,this.w,this.h);

		//forcing it up if it collides with another rect
		if(!force) {
    		for (var i in tanks) {
    			if(this.id!=tanks[i].id && rectscollide(this.rect, tanks[i].rect)) {
    				this.goaround();
    				//this.moveup(true);
    				return;
    			}
    		}
    	}
		this.draw(true);
	},

	goaround: function(){
//		console.log('trying to go around');
		this.lookangle +=5;
		this.moveup();
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

	automove: function(){
		if(this.waypoint.length) { 
		    //look at the wayoint and make a move up to it
		    this.lookat(this.waypoint[0]);
		    this.moveup();
		    //when we get to a waypoint
		    if(ptinrect(this.waypoint[0], this.rect)) {
				//remove the waypoint
				this.waypoint.shift();
				//point the tank in the new waypoint dir, if it exists
				if(this.waypoint.length) {
			    	//look at next waypoint
			   		this.lookat(this.waypoint[0]);
				}
			}
		}
		// } else {
		//     //if no commands just look around so that we are not cleaned out
		//     this.lookat(makepoint(this.lookpt.x+myrand(1)*0.5, this.lookpt.y+myrand(1)*0.5));
		//     this.draw();
		// }

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
		this.rect.clear(this.ctx);
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

function maketank(ctx, ctxb, teamid, id,x,y,lookx,looky) {
	s = new tank(ctx, ctxb, x, y);
	s.teamid = teamid;
	s.id = id;
	s.lookpt = makepoint(lookx, looky);
	s.ctx = ctx;
	return s;
}