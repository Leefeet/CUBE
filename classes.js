function GameObject(x, y, w, h) {
  this.position = createVector(x, y); //object top-left corner in 3d space
  this.width = w; //Width of object collision box
  this.height = h; //Height of object collision box

  // Abstract Functions, implemented by children
  this.update = function() //Updates the variables of the object
  {
    throw new Error("function update() is not implemented. Called update() in GameObject object. Perhaps child lacks an update()");
  } 
  this.draw = function() //Draws the object visibly to the canvas
  {
    throw new Error("function draw() is not implemented. Called draw() in GameObject object. Perhaps child lacks an draw()");
  } 
  
  //setters and getters
  this.getPosition = function() {return this.position;}
  this.getX = function() {return this.position.x;}
  this.getY = function() {return this.position.y;}
  this.getWidth = function() {return this.width;}
  this.getHeight = function() {return this.height;}
  
  this.setPosition = function(position) {this.position = position;}
  this.setX = function(x) {this.position.x = x;}
  this.setY = function(y) {this.position.y = y;}
  this.setWidth = function(w) {this.width = w;}
  this.setHeight = function(h) {this.height = h;}
  
}

function Box(x,y,w,h)
{
  GameObject.call(this,x,y,w,h);
  
  this.draw = function()
  {
    fill(255);
    rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
  }
}

function Inherit(x) //inherits from GameObject
{
  GameObject.call(this, x);
  
}

function DoubleChild(x) //inherits from Inherit
{
  Inherit.call(this, x);
}