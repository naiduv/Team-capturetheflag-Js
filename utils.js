
function randomsign()
{
	if(Math.random()*10<=5)
		return -1;
	else
		return 1;
}

function myrand(max)
{
	return randomsign()*(Math.random()*max);
}
