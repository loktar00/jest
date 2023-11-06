<!-- Start D:\xampp\htdocs\jest\source\game.js -->

function

DOMElement

## Jest()

Jest(options:object)
options canvas:string, width:int, height:int, frameRate:int
Sets up the initial values required to start the game

Jest.load()

prepares the canvas for rendering, and starts the update process

Jest.loaded()
object event
makes sure everything is loaded until continuing

Jest.init()

prepares the canvas for rendering, and starts the update process

Jest.update()

Main update loop for the game, updates all objects, and calls the renderer.

Jest.getKey()
returns the state of a key

Jest.keyDown()
sets the state of the key pressed to true

Jest.keyUp()
sets the state of the key pressed to false

Jest.clicked()
object event
handles the click event for the canvas
TODO update this, I dont like how it requires origin and pos

Jest.mouseMove()
object event
handles the mouse move event

Jest.addEntity()
object entity, renderFalse bool, state object
renderFalse : controls if the item is added to the renderer.. idk this is kind of hack, basically its for things you want in the
main update loop but doesn't render at all, so like a container
state {name : string, OR id : number}: allows you to specify what state you want to add the entity to, if you dont specify it adds it to the current state

Jest.removeEntity()
object entity, state Object
Removes an entity from the update cycle and renderer, you can also specify the state you want to remove from

Jest.addState()
object options
{name : string}
Adds a state the Jest, states hold their own entity list, and render list

Jest.getState()
object options
{name : string, id : number}
Finds and returns the state

Jest.switchState()
object options
{name : string, id : number}
Adds a state the Jest, states hold their own entity list, and render list

Jest.checkHit(x,y)
x,y number
Checks all the entities to see if they were hit by the coords. Very expensive right now definitly need to clean it up

<!-- End D:\xampp\htdocs\jest\source\game.js -->
