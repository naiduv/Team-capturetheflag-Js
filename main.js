var bkcolor = "#FFFFFF"
var ls;
var gameid;
var soldiers = [];
var num_soldiers = 3;
var canvas_w;
var canvas_h;
var stop_running = false;
// var fb;
// var fbgameref;
var ctx0;
var ctx1;
var soldier_count = 0;
var timer;
var ammo = 0;
var teamid = Math.floor(Math.random()*10000);
var idcount = 0;
//increment used to set the step size for each player move
var increment = 3;
var Socket;

window.onkeydown = function(e){
	if(ls==0)
		return;

	// console.log('keydown' + e.keyCode);
	
	switch(e.keyCode) {
		case 87:
			if(!started) return;
			//fbgameref.push({func:"mu", teamid:teamid, id:ls.id, locx:ls.loc.x, locy:ls.loc.y, lookx:ls.lookpt.x, looky:ls.lookpt.y});
			ls.loc.x= round(ls.loc.x);
			ls.loc.y= round(ls.loc.y);
			ls.lookx= round(ls.lookx);
			ls.looky= round(ls.looky);
			//if(Socket) Socket.send('{"fc":'+"'mu'"+',"gid":'+gameid+',"tid":'+teamid+ ',"pid":'+ls.id +',"px":'+ls.loc.x +',"py":'+ls.loc.y+ ',"lx":'+ls.lookpt.x +',"ly":'+ls.lookpt.y+'}');
			ls.moveup();
			break;
		case 83:
			if(!started) return;
			//if(Socket) Socket.send('{"fc":'+"'md'"+',"gid":'+gameid+',"tid":'+teamid+ ',"pid":'+ls.id +',"px":'+ls.loc.x +',"py":'+ls.loc.y+ ',"lx":'+ls.lookpt.x +',"ly":'+ls.lookpt.y+'}');
			ls.movedown();
			break;
		case 13:
			if(!gameid) {
				var gameidform = document.getElementById('gameidform')
				var gameidinput = document.getElementById('gameid');
				gameid = gameidinput.value;
				gameidinput.hidden = true;
				//gameidform.hidden = true;
				gameidform.innerText = "YOUR GAMEID IS " + gameid + ". INVITE FRIENDS TO JOIN!";

				Socket = new WebSocket("ws://192.168.0.189:5001");
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

				    var new_opp_soldier = true;
				    for(var i in opp_soldiers) {
				   		if (opp_soldiers[i].id==message.pid) { 
				   			if(distance(opp_soldiers[i].loc, makepoint(message.px, message.py)))
				   				ctx1.clearRect(opp_soldiers[i].loc.x-20, opp_soldiers[i].loc.y-20, opp_soldiers[i].w+20,opp_soldiers[i].h+20);
				   			opp_soldiers[i].loc = makepoint(message.px, message.py);
				   			opp_soldiers[i].lookat(makepoint(message.lx, message.ly));
				   			//dealing with points that are too far apart
				   			//opp_soldiers[i].draw();
				   			if(message.fc=="mu")
				   				opp_soldiers[i].moveup();
				   			else if(message.fc=="md")
				   				opp_soldiers[i].movedown();
				   			else if(message.fc=="nm")
				   				opp_soldiers[i].draw();


				   			new_opp_soldier = false;
				   			console.log('opp_soldier found, loc updated');
				   		} 	
				    }

				    if(new_opp_soldier) {
				    	opp_soldiers.push(makesoldier(ctx1, message.tid, message.pid, message.px, message.py, message.lx, message.ly));	   
						// console.log('new opp_soldier added');
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

				//     var new_opp_soldier = true;
				//     for(var i in opp_soldiers) {
				//    		if (opp_soldiers[i].id==message.id) {
				//    			opp_soldiers[i].loc = makepoint(message.locx, message.locy);
				//    			opp_soldiers[i].lookat(makepoint(message.lookx, message.looky));
				//    			//opp_soldiers[i].draw();
				//    			if(message.func=="mu")
				//    				opp_soldiers[i].moveup();
				//    			else if(message.func=="md")
				//    				opp_soldiers[i].movedown();
				//    			else if(message.func=="nm")
				//    				opp_soldiers[i].draw();


				//    			new_opp_soldier = false;
				//    			console.log('opp_soldier found, loc updated');
				//    		} 	
				//     }

				//     if(new_opp_soldier) {
				//     	opp_soldiers.push(makesoldier(ctx1, message.teamid, message.id, message.locx, message.locy, message.lookx, message.looky));	   
				// 		// console.log('new opp_soldier added');
				// 	}
				// });

				//START RUNNING THE PROGRAM
				start();
			}
			break;
	}
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
		// console.log('waypoint added')
		ls.waypoint.push(pt);
		//ctx0.fillStyle="#FF0000";
		//ls = 0;
	}
}

window.onresize = function()
{
  var c = document.getElementById("top-canvas");
  ctx0 = c.getContext("2d");
  ctx0.canvas.width  = window.innerWidth;
  ctx0.canvas.height = window.innerHeight;

  c = document.getElementById("bottom-canvas");
  ctx1 = c.getContext("2d");
  ctx1.canvas.width  = window.innerWidth;
  ctx1.canvas.height = window.innerHeight;
}

function canvasmousemove(e){
	if(!started) return;

	if(ls==0)
		return;

	//calculate where the soldier is looking
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
	livesoldiers = 0;
	for (var i in soldiers) {
		if(ls==soldiers[i] || !soldiers[i].alive)
			continue;
		livesoldiers++;
		if(soldiers[i].waypoint.length) {
			soldiers[i].lookat(soldiers[i].waypoint[0]);
			soldiers[i].moveup();
			soldiers[i].loc.x= round(soldiers[i].loc.x);
			soldiers[i].loc.y= round(soldiers[i].loc.y);
			soldiers[i].lookx= round(soldiers[i].lookx);
			soldiers[i].looky= round(soldiers[i].looky);
			if(Socket) {
				var message= '{"fc":'+"'mu'"+',"gid":'+gameid+',"tid":'+teamid+ ',"pid":'+soldiers[i].id +',"px":'+soldiers[i].loc.x +',"py":'+soldiers[i].loc.y+ ',"lx":'+soldiers[i].lookpt.x +',"ly":'+soldiers[i].lookpt.y+'}';
				if(message.length>35 && message.length<115){
					console.log(message);
					Socket.send(message);
				}
			}
			//fbgameref.push({func:"mu", teamid:teamid, id:soldiers[i].id, locx:soldiers[i].loc.x, locy:soldiers[i].loc.y, lookx:soldiers[i].lookpt.x, looky:soldiers[i].lookpt.y});
			//when we get to a waypoint
			if(ptinrect(soldiers[i].waypoint[0], soldiers[i].rect)) {				// console.log('hit waypoint');
				//ctx0.clearRect(soldiers[i].waypoint.x, soldiers[i].waypoint.y,5,5);
				//remove the waypoint
				soldiers[i].waypoint.shift();
				//point the soldier in the new waypoint dir, if it exists
				if(soldiers[i].waypoint.length) {
					//look at next waypoint
					// console.log('look at next waypoint');
					soldiers[i].lookat(soldiers[i].waypoint[0]);
				}
			}
		} else {
			//if no commands just look around so that we are not cleaned out
			soldiers[i].lookat(makepoint(soldiers[i].lookpt.x+myrand(1), soldiers[i].lookpt.y+myrand(1)));
			//fbgameref.push({func:"nm", teamid:teamid, id:soldiers[i].id, locx:soldiers[i].loc.x, locy:soldiers[i].loc.y, lookx:soldiers[i].lookpt.x, looky:soldiers[i].lookpt.y});
			soldiers[i].draw();
			// console.log('looking around' + Math.random()*1000);
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
	var c = document.getElementById("top-canvas");
 	ctx0 = c.getContext("2d");
  	canvas_w = ctx0.canvas.width  = window.innerWidth;
  	canvas_h = ctx0.canvas.height = window.innerHeight;
	c.addEventListener('mousemove', canvasmousemove);
	c.addEventListener('mouseup', canvasmouseup);
	c.addEventListener('dblclick', canvasdblclick);

	c = document.getElementById("bottom-canvas");
	ctx1 = c.getContext("2d");
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
	}, 100);
}

//THIS IS THE MAIN FUNCTION
var started = false;
function start(){
	started=true;

	//unhide the instructions
	instructions_element_id.hidden = false;

	//init the canvas, squad and start ai
	initcanvas();
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


