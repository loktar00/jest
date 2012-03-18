(function(){
	function TestPoject(){};
	
	TestPoject.prototype = new jGame({"canvas" : "playCanvas", "width": 800, "height" : 600, "frameRate" : Math.ceil(1000/120), "showFrameRate" : true});
	this.TestPoject = TestPoject;
	
	TestPoject.prototype.load = function(){
		this.charResource = this.resourceManager.add("images/orcbase.png?" + new Date().getTime());
		this.orcWalkFrames = [0,1,2];
		
		jGame.prototype.load.call(this);
	}
	
	TestPoject.prototype.init = function(){
		jGame.prototype.init.call(this);
	
		Math.seedrandom(10);
		
		for(var i = 0; i < 500; i++){
			var y = this.utilities.getRandomRange(0,Game.bounds.width),
			    x = this.utilities.getRandomRange(0,Game.bounds.height),
				angle = Math.floor(Math.random()*360),
				orc = new TestSprite({width : 16, height: 18, pos : {x : x, y : y, z : 0}, angle : angle, thrust : 2, resource : this.charResource});
				
			this.addEntity(orc);
		}
	}
})();

var Game = {};

window.onload = function(){
	Game = new TestPoject();
	Game.load();	
};