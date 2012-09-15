var bkcolor = "#FFFFFF"
var ls;
var gameid;
var tanks = [];
var num_tanks = 3;
var canvas_w;
var canvas_h;
var stop_running = false;
// var fb;
// var fbgameref;
var ctx0;
var ctx1;
var ctx2;
var tank_count = 0;
var timer;
var ammo = 0;
var teamid = Math.floor(Math.random()*10000);
var idcount = 0;
//increment used to set the step size for each player move
var increment = 10;
var Socket;

var flags = [];
var flagx;
var flagy;

window.onkeydown = function(e){
	if(ls==0)
		return;

	// console.log('keydown' + e.keyCode);
	
	switch(e.keyCode) {
		case 87:
			return;
			if(!started) return;
			//fbgameref.push({func:"mu", teamid:teamid, id:ls.id, locx:ls.loc.x, locy:ls.loc.y, lookx:ls.lookpt.x, looky:ls.lookpt.y});
			//if(Socket) Socket.send('{"fc":'+"'mu'"+',"gid":'+gameid+',"tid":'+teamid+ ',"pid":'+ls.id +',"px":'+ls.loc.x +',"py":'+ls.loc.y+ ',"lx":'+ls.lookpt.x +',"ly":'+ls.lookpt.y+'}');
			ls.moveup();
			break;
		case 83:
			return;
			//if(!started) return;
			//if(Socket) Socket.send('{"fc":'+"'md'"+',"gid":'+gameid+',"tid":'+teamid+ ',"pid":'+ls.id +',"px":'+ls.loc.x +',"py":'+ls.loc.y+ ',"lx":'+ls.lookpt.x +',"ly":'+ls.lookpt.y+'}');
			//ls.movedown();
			break;
		case 13:
			if(!gameid) {
				var gameidform = document.getElementById('gameidform')
				var gameidinput = document.getElementById('gameid');
				gameid = gameidinput.value;
				gameidinput.hidden = true;
				//gameidform.hidden = true;
				gameidform.innerText = "YOUR GAMEID IS " + gameid + ". INVITE FRIENDS TO JOIN!";

				Socket = new WebSocket("ws://192.168.0.191:5001");
				//Socket = new WebSocket("ws://www.mailerdemon.com:5001");
				//Socket = new WebSocket("ws://10.0.2.15:5001");

				Socket.onopen = function() {
					console.log('conn established');
				}
				Socket.onmessage = function (e) {
  					console.log('Server: ' + e.data);
  					eval("smx1="+e.data);
  					var message = smx1;
				    // console.log('child_added');
				    if(message.tid==teamid)
				    	return;

				    var new_opp_tank = true;
				    for(var i in opp_tanks) {
				   		if (opp_tanks[i].id==message.pid) { 
				   			// if(distance(opp_tanks[i].loc, makepoint(message.px, message.py)))
				   			// 	ctx1.clearRect(opp_tanks[i].loc.x-20, opp_tanks[i].loc.y-20, opp_tanks[i].w+20,opp_tanks[i].h+20);
				   			// opp_tanks[i].loc = makepoint(message.px, message.py);
				   			// opp_tanks[i].lookat(makepoint(message.lx, message.ly));
				   			//dealing with points that are too far apart
				   			// //opp_tanks[i].draw();
				   			// if(message.fc=="mu")
				   			// 	opp_tanks[i].moveup();
				   			// else if(message.fc=="md")
				   			// 	opp_tanks[i].movedown();
				   			// else if(message.fc=="nm")
				   			// 	opp_tanks[i].draw();
				   			opp_tanks[i].waypoint = [];
				   			opp_tanks[i].waypoint.push(makepoint(message.px, message.py));
				   			new_opp_tank = false;
				   			console.log('opp_tank found, loc updated');
				   		} 	
				    }

				    if(new_opp_tank) {
				    	opp_tanks.push(maketank(ctx1, message.tid, message.pid, message.px, message.py, message.lx, message.ly));	   
						// console.log('new opp_tank added');
					}
				};
				Socket.onclose = function () {
  					console.log('conn was closed');
				};
				Socket.onerror = function() {
					console.log('conn error');
				};


				//fbgameref = fb.child(gameid);

				// fbgameref.on('child_added', function (snapshot) {
				//     var message = snapshot.val();
				//     // console.log('child_added');
				//     if(message.teamid==teamid)
				//     	return;

				//     var new_opp_tank = true;
				//     for(var i in opp_tanks) {
				//    		if (opp_tanks[i].id==message.id) {
				//    			opp_tanks[i].loc = makepoint(message.locx, message.locy);
				//    			opp_tanks[i].lookat(makepoint(message.lookx, message.looky));
				//    			//opp_tanks[i].draw();
				//    			if(message.func=="mu")
				//    				opp_tanks[i].moveup();
				//    			else if(message.func=="md")
				//    				opp_tanks[i].movedown();
				//    			else if(message.func=="nm")
				//    				opp_tanks[i].draw();


				//    			new_opp_tank = false;
				//    			console.log('opp_tank found, loc updated');
				//    		} 	
				//     }

				//     if(new_opp_tank) {
				//     	opp_tanks.push(maketank(ctx1, message.teamid, message.id, message.locx, message.locy, message.lookx, message.looky));	   
				// 		// console.log('new opp_tank added');
				// 	}
				// });

				//START RUNNING THE PROGRAM
				start();
			}
			break;
	}
}

function handleclick(pt){
	var wastankselected = (ls!=0); 
	var newtankselected = false;
	for (var i in tanks) {
		//if we click on a tank, try to select one
		if(ptinrect(pt, tanks[i].rect)) {
			//if tank was already selected, direct it to the last waypoint so it can start moving
			// if(ls!=0) {
			// 	if(ls.waypoint.length) {
			// 		console.log('force look at the first waypoint');
			// 		ls.lookat(ls.waypoint[0]);
			// 	}
			// }
			ls = tanks[i];
			ls.waypoint = [];
			newtankselected = true;
			break;
		}
		//if a tank is selected, try hitting opposing teammates
		else if(ls!=0 && ptinrect(pt,tanks[i].rect) && ls.teamid!=tanks[i].teamid) {
			tanks[i].hit(35);
			break;
		}
	}

	//tank was prev selected and user clicks on empty spot
	if(wastankselected && !newtankselected) {
		// console.log('waypoint added')
		ls.waypoint.push(pt);
		//ctx0.fillStyle="#FF0000";
		//ls = 0;
	}
}

function canvasmousemove(e){
	if(!started) return;

	if(ls==0)
		return;

	//calculate where the tank is looking
	ls.lookpt.x = e.layerX + 0.1*e.layerX; //90% css
	ls.lookpt.y = e.layerY + 0.1*e.layerY;

	//ctx0.fillRect(ls.lookx, ls.looky, 2, 2);
	ls.calclookangle();
	ls.draw();
}

function canvasmouseup(e){
	if(!started) return;

	x = e.layerX + 0.1*e.layerX; //90%css
	y = e.layerY + 0.1*e.layerY;

	//send a hit if its not a teammate
	handleclick(makepoint(x, y));

}

function canvasdblclick(e){
	if(!started) return;
	if(ls==0)
		return;

	// console.log('dblclick');
	ls = 0;
}

function commandloop() {
    for (var i in tanks) {
    	if(ls!=tanks[i])
    		tanks[i].automove();
    } 

    for (var i in opp_tanks) {
    	opp_tanks[i].automove();
    }

}

function flagloop() {
	flags[0].checkoccupied(tanks);
}

function initflag() {
	flagx = myurand(800);
	flagy = myurand(600);
	flags.push(new flag(ctx1, makepoint(flagx, flagy)));
	flags[0].draw();
}

//fb is changed after the gameid is entered!!!!! check onkeypress 13 (enter)
// fb = new Firebase('http://gamma.firebase.com/Naiduv/' + gameid);


var opp_tanks = [];

function randomloop()
{
	// console.log('zombietank command');
	livetanks = 0;
	for (var i in tanks) {
		if(ls==tanks[i] || !tanks[i].alive)
			continue;
		livetanks++;
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
				tanks[i].moveup();
				break;
			case 8:
				tanks[i].fire();
				break;
			case 9:
				tanks[i].lookangle += 20;
				break;	
			case 10:
				tanks[i].lookangle -= 20;
				break;
		}
	}

	if(livetanks<=0) {
		stop_running = true;
		document.location.reload(true);
	}
}

function initcanvas(){
	var c = document.getElementById("canvas-o");
 	ctx0 = c.getContext("2d");
  	canvas_w = ctx0.canvas.width  = window.innerWidth;
  	canvas_h = ctx0.canvas.height = window.innerHeight;
	c.addEventListener('mousemove', canvasmousemove);
	c.addEventListener('mouseup', canvasmouseup);
	c.addEventListener('dblclick', canvasdblclick);

	c = document.getElementById("canvas-i");
	ctx1 = c.getContext("2d");

	c = document.getElementById("canvas-z");
	ctx2 = c.getContext("2d");

	resizecanvas();
}


window.onresize = function()
{
	resizecanvas();
}

function resizecanvas(){
	var c = document.getElementById("canvas-o");
	ctx0 = c.getContext("2d");
	ctx0.canvas.width  = window.innerWidth;
	ctx0.canvas.height = window.innerHeight;

	c = document.getElementById("canvas-i");
	ctx1 = c.getContext("2d");
	ctx1.canvas.width  = window.innerWidth;
	ctx1.canvas.height = window.innerHeight;

	c = document.getElementById("canvas-z");
	ctx2 = c.getContext("2d");
	ctx2.canvas.width  = window.innerWidth;
	ctx2.canvas.height = window.innerHeight;
}

//initialize the units
function initsquad() {
	var x = myurand(window.innerWidth);
	var y = myurand(window.innerHeight) 
	while(tank_count<num_tanks) {
		//ls = new tank(100+Math.floor(Math.random()*(canvas_w-200)),100+Math.floor(Math.random()*(canvas_h-200)));
		ls = new tank(ctx0, (tank_count*50)+x, (tank_count)+y);
		ls.draw();
		tanks.push(ls);
		tank_count++;
	}
}

function mainloop(){
	self.setInterval(function(){
		if(!stop_running)
			commandloop();
			flagloop();
			//randomloop();
	}, 70);
}

//THIS IS THE MAIN FUNCTION
var started = false;
function start(){
	started=true;

	//unhide the instructions
	instructions_element_id.hidden = false;

	//init the canvas, squad and start ai
	initcanvas();
	initflag();
	initsquad();
	mainloop();
}

var instructions_element_id; 
window.onload = function() {
	//hide instructions until we start the game
	instructions_element_id = document.getElementById('inctructions');
	instructions_element_id.hidden = true;

	//fb = new Firebase('http://gamma.firebase.com/Naiduv/');
}


