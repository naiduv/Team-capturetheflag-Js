Point = function(x,y){
	this.x = x;
	this.y = y;
}

Point.prototype = {
};

Rect = function(x,y,w,h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Rect.prototype = {
};

//checks if x is between a and b (a<x<b or b<x<a)
isbetween = function(x,a,b) {
	var small; var big;
	if(a<=b){
		small=a;
		big=b;
	} else {
		small=b;
		big=a;
	}
	if(x<=big)
		if(small<=x)
			return true;

	return false;
}

//checks if a point is inside a rect
ptinrect = function(pt, rect)
{
	if(isbetween(pt.x,rect.x,rect.x+rect.w) && isbetween(pt.y,rect.y,rect.y+rect.h))
		return true;
	return false;
}

rectscollide = function(rect1, rect2)
{	
	// var top1 = rect1.y;
	// var left1 = rect1.x;
	// var bottom1 = rect1.y-rect1.h; //+ or -?
	// var right1 = rect1.x+rect1.w;

	// var top2 = rect2.y;
	// var left2 = rect2.x;
	// var bottom2 = rect2.y-rect2.h; //+ or -?
	// var right2 = rect2.x+rect2.w;

	//check if r
	if(ptinrect(makepoint(rect1.x, rect1.y), rect2))
	 	debugger;
}

makepoint = function(x,y)
{
	return new Point(x,y);
}