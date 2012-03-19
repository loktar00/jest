(function(){	
	Math.seedrandom('particles');
	function ParticleDemo(){};
	
	ParticleDemo.prototype = new jGame({canvas : "playCanvas", width: 400, height: 400, showFrameRate: true});
	this.ParticleDemo = ParticleDemo;
	
	ParticleDemo.prototype.load = function(){
		// Call the main game constructor
		jGame.prototype.init.call(this);
		this.resourceManager.add("images/smoke.png", 1, "particles");
		this.resourceManager.add("images/point.png", 1, "fire");
		jGame.prototype.load.call(this);
	}
	
	
	ParticleDemo.prototype.init = function(){
		jGame.prototype.init.call(this);
		// create a hud, so we can see how many pixels are being rendered
		this.gameHud = {};
		var gameHud = this.gameHud;
		gameHud.ui = new UI();
		gameHud.ui.particleCount = new Label({'text':' ', x:0,y:50, 'font':'14pt arial bold'});
		gameHud.ui.addItem(gameHud.ui.particleCount, 100);	
		
		// create an emitter that will always emit
		var fountain = new Emitter({pos : {x: 200, y: 200}});
		// add a particle group to the emitter to get it started
		fountain.addGroup({
				size: 1, 
				endSize: 5, 
				thrust : 0,
				thrustRange: {min:8, max:9.5}, 
				angleRange : {min:265,max:10},
				gravity:1,
				drawAngleRange : {min: 0, max: 360},
				drawAngleChange : 2,
				endAlpha: 0, 
				startColor : {r: 0, g:0, b:200},
				endColor : {r: 0, g:200, b:0},
				duration : -1,
				rate: 200,
				lifeTime : 3000,
				blend:true
			});
	}
	
	ParticleDemo.prototype.clicked = function(event, self){
		jGame.prototype.clicked(event,self);	
		
		var explosion = new Emitter({pos : {x : Game.cX, y : Game.cY}});
		explosion.addGroup({
				size: 3, 
				thrustRange: {min:8, max:10}, 
				angleRange : {min:0,max:360},
				drawAngleRange : {min: 0, max: 360},
				endAlpha: 0, 
				startColor : {r: 200, g:200, b:0},
				endColor : {r: 255, g:0, b:0},
				duration : 80,
				rate: 5000,
				lifeTime : 1000,
				blend:true
			});
	}
	
	ParticleDemo.prototype.update = function(){
		jGame.prototype.update.call(this);
		this.gameHud.ui.particleCount.text = this.particleCount;
	}

})();


var Game = {};
window.onload = function(){
	Game = new ParticleDemo();
	Game.init();	
};