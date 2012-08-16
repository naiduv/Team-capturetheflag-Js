var bkcolor = "#FFFFFF"
var ls;
var gameid;
var soldiers = [];
var num_soldiers = 3;
var canvas_w;
var canvas_h;
var stop_running = false;
var fb;
var fbgameref;

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
var teamid = Math.floor(Math.random()*10000);
var idcount = 0;

soldier = function(x, y){
	this.selected = false;
	this.id = Math.floor(Math.random()*10000);
	this.teamid = teamid;
	this.lookpt = makepoint(0,0);
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
	this.waypoint = [];
	_this = this;
}

makesoldier = function(teamid, id,x,y,lookx,looky) {
	s = new soldier(x,y);
	s.teamid = teamid;
	s.id = id;
	s.lookpt = makepoint(lookx, looky);
	return s;
}

var increment = 4;

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
		this.rect.clear(ctx);
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

window.onkeydown = function(e){
	if(ls==0)
		return;

	console.log('keydown' + e.keyCode);
	
	switch(e.keyCode) {
		case 87:
			fbgameref.push({func:"mu", teamid:teamid, id:ls.id, locx:ls.loc.x, locy:ls.loc.y, lookx:ls.lookpt.x, looky:ls.lookpt.y});
			ls.moveup();
			break;
		case 83:
			fbgameref.push({func:"md", teamid:teamid, id:ls.id, locx:ls.loc.x, locy:ls.loc.y, lookx:ls.lookpt.x, looky:ls.lookpt.y});		
			ls.movedown();
			break;
		case 13:
			if(!gameid) {
				var gameidform = document.getElementById('gameidform')
				var gameidinput = document.getElementById('gameid');
				gameid = gameidinput.value;
				gameidinput.hidden = true;
				//gameidform.hidden = true;
				gameidform.innerText = "YOUR GAMEID IS " + gameid + ". INVITE FRIENDS TO JOIN!"
				debugger;

				fbgameref = fb.child(gameid);
				fbgameref.on('child_added', function (snapshot) {
				    var message = snapshot.val();
				    console.log('child_added');
				    if(message.teamid==teamid)
				    	return;

				    var new_opp_soldier = true;
				    for(var i in opp_soldiers) {
				   		if (opp_soldiers[i].id==message.id) {
				   			opp_soldiers[i].loc = makepoint(message.locx, message.locy);
				   			opp_soldiers[i].lookat(makepoint(message.lookx, message.looky));
				   			//opp_soldiers[i].draw();
				   			if(message.func=="mu")
				   				opp_soldiers[i].moveup();
				   			else
				   				opp_soldiers[i].movedown();

				   			new_opp_soldier = false;
				   			console.log('opp_soldier found, loc updated');
				   		} 	
				    }

				    if(new_opp_soldier) {
				    	opp_soldiers.push(makesoldier(message.teamid, message.id, message.locx, message.locy, message.lookx, message.looky));	   
						console.log('new opp_soldier added');
					}
				});

				//START RUNNING THE PROGRAM
				start();
			}
			break;
	}
}

function canvasmouseup(e){
	// if(ls==0)
	// 	return;

	x = e.layerX + 0.1*e.layerX; //90%css
	y = e.layerY + 0.1*e.layerY;

	//send a hit if its not a teammate
	handleclick(makepoint(x, y));

	//ls.fire();
}

function handleclick(pt){
	var wassoldierselected = (ls!=0); 
	var newsoldierselected = false;
	for (var i in soldiers) {
		//if we click on a soldier, try to select one
		if(ptinrect(pt, soldiers[i].rect)) {
			//if soldier was already selected, direct it to the last waypoint so it can start moving
			// if(ls!=0) {
			// 	if(ls.waypoint.length) {
			// 		console.log('force look at the first waypoint');
			// 		ls.lookat(ls.waypoint[0]);
			// 	}
			// }
			ls = soldiers[i];
			ls.waypoint = [];
			newsoldierselected = true;
			break;
		}
		//if a soldier is selected, try hitting opposing teammates
		else if(ls!=0 && ptinrect(pt,soldiers[i].rect) && ls.teamid!=soldiers[i].teamid) {
			soldiers[i].hit(35);
			break;
		}
	}

	//soldier was prev selected and user clicks on empty spot
	if(wassoldierselected && !newsoldierselected) {
		console.log('waypoint added')
		ls.waypoint.push(pt);
		//ctx.fillStyle="#FF0000";
		//ls = 0;
	}
}

window.onresize = function()
{
  c = document.getElementById("myCanvas");
  ctx = c.getContext("2d");
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

function canvasmousemove(e){
	if(ls==0)
		return;

	//calculate where the soldier is looking
	ls.lookpt.x = e.layerX + 0.1*e.layerX; //90% css
	ls.lookpt.y = e.layerY + 0.1*e.layerY;

	//ctx.fillRect(ls.lookx, ls.looky, 2, 2);
	ls.calclookangle();
	ls.draw();
}

function canvasdblclick(e){
	if(ls==0)
		return;

	console.log('dblclick');
	ls = 0;
}

function commandloop() {
	livesoldiers = 0;
	for (var i in soldiers) {
		if(ls==soldiers[i] || !soldiers[i].alive)
			continue;
		livesoldiers++;
		if(soldiers[i].waypoint.length) {
			soldiers[i].lookat(soldiers[i].waypoint[0]);
			soldiers[i].moveup();
			fbgameref.push({func:"mu", teamid:teamid, id:soldiers[i].id, locx:soldiers[i].loc.x, locy:soldiers[i].loc.y, lookx:soldiers[i].lookpt.x, looky:soldiers[i].lookpt.y});
			//when we get to a waypoint
			if(ptinrect(soldiers[i].waypoint[0], soldiers[i].rect)) {
				console.log('hit waypoint');
				//ctx.clearRect(soldiers[i].waypoint.x, soldiers[i].waypoint.y,5,5);
				//remove the waypoint
				soldiers[i].waypoint.shift();
				//point the soldier in the new waypoint dir, if it exists
				if(soldiers[i].waypoint.length) {
					//look at next waypoint
					console.log('look at next waypoint');
					soldiers[i].lookat(soldiers[i].waypoint[0]);
				}
			}
		}
	}

	if(livesoldiers<=0) {
		stop_running = true;
		document.location.reload(true);
	}
}

//fb is changed after the gameid is entered!!!!! check onkeypress 13 (enter)
// fb = new Firebase('http://gamma.firebase.com/Naiduv/' + gameid);


var opp_soldiers = [];

function randomloop()
{
	// console.log('zombiesoldier command');
	livesoldiers = 0;
	for (var i in soldiers) {
		if(ls==soldiers[i] || !soldiers[i].alive)
			continue;
		livesoldiers++;
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

	if(livesoldiers<=0) {
		stop_running = true;
		document.location.reload(true);
	}
}

function initcanvas(){
	c = document.getElementById("myCanvas");
	c.addEventListener('mousemove', canvasmousemove);
	c.addEventListener('mouseup', canvasmouseup);
	c.addEventListener('dblclick', canvasdblclick);

 	ctx = c.getContext("2d");
  	canvas_w = ctx.canvas.width  = window.innerWidth;
  	canvas_h = ctx.canvas.height = window.innerHeight;
}

//initialize the units
function initsquad() {
	while(soldier_count<num_soldiers) {
		//ls = new soldier(100+Math.floor(Math.random()*(canvas_w-200)),100+Math.floor(Math.random()*(canvas_h-200)));
		ls = new soldier((soldier_count*50)+50, (soldier_count)+canvas_h-50);
		ls.draw();
		soldiers.push(ls);
		soldier_count++;
	}
}

function mainloop(){
	self.setInterval(function(){
		if(!stop_running)
			commandloop();
			//randomloop();
	}, 70);
}

//THIS IS THE MAIN FUNCTION
function start(){
	initcanvas();
	initsquad();
	mainloop();
}

//fb = new Firebase('http://gamma.firebase.com/Naiduv/');
//when the page loads init your vars and get the canvas and context
window.onload = function() {
	fb = new Firebase('http://gamma.firebase.com/Naiduv/');
}


