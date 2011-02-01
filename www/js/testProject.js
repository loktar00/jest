(function(){
	function TestPoject(){};
	
	TestPoject.prototype = new jGame({"canvas" : "playCanvas", "width": 600, "height" : 600});
	this.TestPoject = TestPoject;
	
	TestPoject.prototype.init = function(){
		jGame.prototype.init.call(this);
		var zomResource = this.resourceManager.add("images/zomtest.png");
		
		Math.seedrandom(10);
		
		for(var i = 0; i < 50; i++){
			var testX = this.utilities.getRandomRange(0,200),
			    testY = this.utilities.getRandomRange(0,200);
				
			this.addEntity(new TestSprite({width :  128, height: 128, x : testX, y : testY, vx : 1, vy : 2, resource : zomResource}));
		}
	}
})();

window.onload = function(){
	var newGame = new TestPoject();
	newGame.init();	
};