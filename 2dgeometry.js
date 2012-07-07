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