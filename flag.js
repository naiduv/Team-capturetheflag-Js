//flag.js

var RADIUS = 35;
var THICKNESS = 7;

function flag(ctx, pt) {
	this.loc = pt;
	this.vis = false;
	this.radius = RADIUS;
	this.ctx = ctx;
	this.percentconvert = 0;
	this.occupied = false;
}

flag.prototype = {
	show: function(){
		this.vis = true;
	},

	hide: function(){
		this.vis = false;
	},

	draw: function(){
		this.ctx.beginPath();
		this.ctx.arc(this.loc.x, this.loc.y, this.radius, 0, 2*Math.PI,true);
		this.ctx.lineWidth = THICKNESS;
		this.ctx.strokeStyle = 'black';
		this.ctx.stroke();
	},

	convert: function(){
		this.ctx.beginPath();
		this.ctx.arc(this.loc.x, this.loc.y, this.radius, 0, this.percentconvert,false);
		this.ctx.lineWidth = THICKNESS;
		this.ctx.strokeStyle = 'gray';
		this.ctx.stroke();
	},

	checkoccupied: function(units){
		var unitsocc = 0;
		for(var i in units){
			if(distance(this.loc, units[i].loc)<(this.radius+THICKNESS)){
				if(this.percentconvert<=2*Math.PI) {
					this.occupied = true;
					this.percentconvert += 1/50;
					console.log(this.percentconvert);
					this.convert();
				}
				unitsocc++;
			}
		}

		if(this.percentconvert>0 && !unitsocc){
			this.percentconvert=0;
			this.draw();
		}
	}
}