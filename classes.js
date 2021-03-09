//Object: GameObject
//Function: a base object for other objects to inherit from. Has basic functionality with position, size, update() and draw(), and setters/getters
//Inherits: Object
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
  
  //Object collision with another GameObject
  this.collidesWith = function(other)
  {
    if (this.getX() < other.getX() + other.getWidth() && 
       this.getX() + this.getWidth() > other.getX() &&
       this.getY() < other.getY() + other.getHeight() &&
       this.getY() + this.getHeight() > other.getY())
      {
        return true; //there is a collision
      }
    else {
      return false; //there is no collision
    }
  }
  
  //Gives extra data on the collision.
  //returns two numbers. The first one represents the side of collision On "other"
  // 1-Top : 2-Right : 3-Bottom : 4-Left
  //Second number is the collision depth, i.e. how far in the collision is. This number can be used to correct the collision
  this.getColissionData = function(other)
  {
    let side = 0;
    let difference = 0;
    
    //differences  of GameObject opposing sides (references to other)
    let dTop = abs(other.getY() - this.getY() + this.getHeight());
    let dRight = abs(other.getX() + other.getWidth() - this.getX());
    let dBottom = abs(other.getY() + other.getHeight() - this.getY());
    let dLeft = abs(other.getX() - this.getX() + this.getWidth());
    
    //see which difference is the smallest
    if (dTop <= dRight && dTop <= dBottom && dTop <= dLeft)
      {
        side = 1;
        difference = dTop;
      }
    else if (dRight <= dTop && dRight <= dBottom && dRight <= dLeft)
      {
        side = 2;
        difference = dRight;
      }
    else if (dBottom <= dTop && dBottom <= dRight && dBottom <= dLeft)
      {
        side = 3;
        difference = dBottom;
      }
    else //left side is least
      {
        side = 4;
        difference = dLeft;
      }
    
    return [side, difference];
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

//Object: Block
//Function: draws a block to the screen
//Inherits: GameObject
function Block(x,y,w,h)
{
  GameObject.call(this,x,y,w,h);
  this.fillColor = color(255, 255, 255); //The fill color of the block
  this.strokeColor = color(0, 0, 0); //the block border color
  this.strokeWeight = 1 * progScale; //The width of the block border. Set to <= 0 to have no stroke
  //IDEA: implement strokes as overallping rectangles, so that strokes will be inside block rather than outside
  
  this.update = function() {} //nothing to update
  
  this.draw = function()
  {
    fill(this.fillColor);
    //stroke
    if (this.strokeWeight <= 0) {noStroke();}
    else {
      stroke(this.strokeColor);
      strokeWeight(this.strokeWeight);
    }
    //block
    rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
  }
  
  //setter and getters
  this.getFillColor = function() {return this.fillColor;}
  this.getStrokeColor = function() {return this.strokeColor;}
  this.getStrokeWeight = function() {return this.strokeWeight;}
  
  this.setFillColor = function(fillColor) {this.fillColor = fillColor;}
  this.setStrokeColor = function(strokeColor) {this.strokeColor = strokeColor;}
  this.setStrokeWeight = function(strokeWeight) {this.strokeWeight = strokeWeight;}
  
}

//movable object for player user
// child of Block for now so it can reuse drawing code
function Player(x,y,w,h)
{
  Block.call(this,x,y,w,h);
  this.velocity = createVector(1000,1000);
  this.forces = createVector(0,0);
  this.gravity = 8;
  
  this.update = function() { //TODO: Make movement work
    let pos = this.getPosition();
    print("Old Pos: " + pos);
    pos = pos.add(this.velocity.mult(deltaTime));
    print("New Pos: " + pos);
    this.setPosition(pos);
  }
  
  
}
