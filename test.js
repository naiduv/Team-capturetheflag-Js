//this is your timer, does nothing right now
Timer = function() { 
	this.intervalid = 0;
	_this = this;
}

//randomly returns a +1 or -1
randfunc = function(){
	if(Math.random()<0.5) 
		return 1; 
	else 
		return -1;
}

Timer.prototype = {
	update: function() {
	},

	run: function() {
		// document.onmousemove = updatemouseloc;
		// document.onmousedown = setclicked;
		//_this.update();
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,500,500);
		ctx.drawImage(document.getElementById("bot"),x,y);
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
