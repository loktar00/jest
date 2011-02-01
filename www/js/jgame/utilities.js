(function () {

	function Utilities(){
		// Constructor
	}

	this.Utilities = Utilities;

	Utilities.prototype.getRandomRange = function(_min, _max){   
		return Math.floor(Math.random()*_max+_min)
	}
	
	Utilities.prototype.getDistance = function(a, b){
		return Math.sqrt((b.x - a.x) *(b.x - a.x) + (b.y - a.y) * (b.y - a.y));
	}
	
	Utilities.prototype.mouse = function(ev)
	{
		if(ev.pageX || ev.pageY){
			return {x:ev.pageX, y:ev.pageY};
		}
		return {
			x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
			y:ev.clientY + document.body.scrollTop  - document.body.clientTop
		};
	}
})();