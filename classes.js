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
  
  //Object collision with another GameObject including adjacency
  this.collidesWithAdjacent = function(other)
  {
    if (this.getX() <= other.getX() + other.getWidth() && 
       this.getX() + this.getWidth() >= other.getX() &&
       this.getY() <= other.getY() + other.getHeight() &&
       this.getY() + this.getHeight() >= other.getY())
      {
        return true; //there is a collision
      }
    else {
      return false; //there is no collision
    }
  }
  
  //gives min and max values
  this.getMinX = function() {return this.getX();}
  this.getMaxX = function() {return this.getX() + this.getWidth();}
  this.getMinY = function() {return this.getY();}
  this.getMaxY = function() {return this.getY() + this.getHeight();}
  
  //Gives extra data on the collision.
  //returns two numbers. The first one represents the side of collision On "other"
  // 1-Top : 2-Right : 3-Bottom : 4-Left
  //Second number is the collision depth, i.e. how far in the collision is. This number can be used to correct the collision
  this.getCollisionData = function(other)
  {
    let side = 0;
    let difference = 0;
    
    //differences  of GameObject opposing sides (references to other)
    let dTop = abs(other.getMinY() - this.getMaxY());
    let dRight = abs(other.getMaxX() - this.getMinX());
    let dBottom = abs(other.getMaxY() - this.getMinY());
    let dLeft = abs(other.getMinX() - this.getMaxX());
    
    //see which difference is the smallest
    if (dTop <= dRight && dTop <= dBottom && dTop <= dLeft)
      {
        side = 1;
        difference = dTop;
        //print("TOP");
      }
    else if (dRight <= dTop && dRight <= dBottom && dRight <= dLeft)
      {
        side = 2;
        difference = dRight;
        //print("RIGHT");
      }
    else if (dBottom <= dTop && dBottom <= dRight && dBottom <= dLeft)
      {
        side = 3;
        difference = dBottom;
        //print("BOTTOM");
      }
    else //left side is least
      {
        side = 4;
        difference = dLeft;
        //print("LEFT");
      }
    
    //print("dTOP: " + dTop + " | dRIGHT: " + dRight +"dBOTTOM: " + dBottom + " | dLEFT: " + dLeft);
    
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


//ENUM for block type
const BlockType = Object.freeze(
  {
    "normal":1, "kill":2, "end":3, "player":4
  }
);


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
  
  this.blockType = BlockType.normal; //defaults to normal
  
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
  this.getBlockType = function() {return this.blockType;}
  
  this.setFillColor = function(fillColor) {this.fillColor = fillColor;}
  this.setStrokeColor = function(strokeColor) {this.strokeColor = strokeColor;}
  this.setStrokeWeight = function(strokeWeight) {this.strokeWeight = strokeWeight;}
  this.setBlockType = function(blockType) {this.blockType = blockType;}
}

//movable object for player user
// child of Block for now so it can reuse drawing code
function Player(x,y,w,h)
{
  Block.call(this,x,y,w,h);
  
  let scaler = 25; //this is the width/height that the player was built for. This allows the player to have its attributes adjusted based on its size
  
  this.spawnPosition = createVector(x,y);
  
  this.velocity = createVector(0.1 * w/scaler,0.1 * w/scaler);
  this.forces = createVector(0.0,0.0);
  this.gravity = 0.01 * w/scaler; 
  this.maxFallSpeed = 0.50 * w/scaler;
  this.gravityWallSlide = 0.0033 * w/scaler;
  this.maxWallSlideSpeed = 0.20 * w/scaler;
  
  this.movementSpeed = 0.01 * w/scaler;
  this.airMovementSpeed = 0.005 * w/scaler;
  this.maxMovementSpeed = 0.25 * w/scaler;
  this.movementTraction = 0.005 * w/scaler;
  this.cornerThreshold = 2.0 * w/scaler; //provides a leniency for whether the player will hit the side or top/bottom of a block. This will allow the player to run smoothly over blocks that are next to each other and avoid getting stopped.
  
  this.jumpSpeed = 0.35 * w/scaler;
  this.wallJumpSpeedX = 0.4 * w/scaler;
  this.wallJumpSpeedY = 0.3 * w/scaler;
  this.isGrounded = true;
  this.isOnRightWall = false;
  this.isOnLeftWall = false;
  //previous frame
    this.prevIsGrounded = false;
    this.prevIsOnRightWall = false;
    this.prevIsOnLeftWall = false;
  
  this.blockType = BlockType.player;
  
  this.update = function() { //TODO: Make movement work
    
    this.playerMovement();
    
    //adding gravity
    //different gravity is sliding down a wall
    //must also make sure player is falling and not rising
    if (this.velocity.y > 0 && (this.isOnRightWall || this.isOnLeftWall))
      {this.velocity.y += this.gravityWallSlide;}
    else
      {this.velocity.y += this.gravity;}
    
    let pos = this.getPosition().copy();
    let vel = this.velocity.copy();
    
    //print("onLeft: " + this.isOnLeftWall);
    //print("onRight: " + this.isOnRightWall);
    
    vel.mult(deltaTime); //as unit of deltaTime
    
    pos.add(vel); //moving player pos based on Velocity
    
    this.setPosition(pos); //applying new position to player
    
    this.testBlockCollision(pos); //testing if hit something and position/velocity needs adjustment
    
    this.setPosition(pos); //applying new position to player
    
    //if player is below screen, reset position
    if (this.position.y > height + 10)
      {
        this.setPosition(this.spawnPosition.copy());
        
        //reset velocity
        this.velocity = createVector(0.1 * w/scaler,0.1 * w/scaler);
      }
    
    //updating variables
    this.prevIsGrounded = this.isGrounded;
    this.prevIsOnRightWall = this.isOnRightWall;
    this.prevIsOnLeftWall = this.isOnLeftWall;
  }
  
  this.playerMovement = function()
  {
    //arrow keys for left/right movement
    if (keyIsDown(39)) { //RIGHT
      if (this.isGrounded) {this.velocity.x += this.movementSpeed;}
      else {this.velocity.x += this.airMovementSpeed;}
    }
    if (keyIsDown(37)) { //LEFT
      if (this.isGrounded) {this.velocity.x -= this.movementSpeed;}
      else {this.velocity.x -= this.airMovementSpeed;}
    }
    
    //if neither sirection is pressed and on the ground, slow player down
    if (!keyIsDown(39) && !keyIsDown(37) && this.isGrounded)
      {
        //if slowing down would result in moving in the oposite direction. set movement to 0
        if ((this.velocity.x > 0.0 &&
             this.velocity.x - this.movementTraction < 0) ||
           (this.velocity.x < 0.0 &&
            this.velocity.x + this.movementTraction > 0) ||
           this.velocity.x == 0.0)
          {this.velocity.x = 0.0;}
        else if (this.velocity.x > 0)
          {this.velocity.x -= this.movementTraction;}
        else //if (this.velocity.x < 0)
          {this.velocity.x += this.movementTraction;}
      }
    //print("vel: " + this.velocity);
    //if speed too fast, set to max
    if (this.velocity.x > this.maxMovementSpeed)
      {
        this.velocity.x = this.maxMovementSpeed;
      }
    else if (this.velocity.x < -this.maxMovementSpeed)
      {
        this.velocity.x = -this.maxMovementSpeed;
      }
    
    //jumping
    if (spaceWasPressed && this.isGrounded) //Spacebar
    { 
      this.velocity.y -= this.jumpSpeed;
      this.isGrounded = false;
    }

    //wall jumping
    //Right Wall Jump, pushes to left
    //Note that a wall jump and normal jump cannot occur at the same time
    else if (!this.isGrounded && this.prevIsOnRightWall && spaceWasPressed)
      {
        this.velocity.x += this.wallJumpSpeedX; //left speed
        this.velocity.y = -this.wallJumpSpeedY;
      }
    //Left Wall jump, pushes to the right
    else if (!this.isGrounded && this.prevIsOnLeftWall && spaceWasPressed)
      {
        this.velocity.x -= this.wallJumpSpeedX; //right speed
        this.velocity.y = -this.wallJumpSpeedY;
      }
    
    //falling speed, cap if too fast
    //cap is different if sliding down a wall
    // print("on right wall: " + this.prevIsOnRightWall);
    // print("on left wall: " + this.prevIsOnLeftWall);
    // print("Velocity" + this.velocity.y + " | mfall speed: " + this.maxFallSpeed);
    if (this.velocity.y > this.maxWallSlideSpeed && (this.prevIsOnRightWall || this.prevIsOnLeftWall))
      {
        this.velocity.y = this.maxWallSlideSpeed;
      }
    else if (this.velocity.y > this.maxFallSpeed)
      {
        this.velocity.y = this.maxFallSpeed;
      }
  }
  
  this.applyLeniency = function(dTop, dRight, dBottom, dLeft) //applies threshold
  {
    //removes some from left and right to make it less likely to trigger when hitting corners
    dRight -= this.cornerThreshold;
    dLeft -= this.cornerThreshold;
  }
  
  this.testBlockCollision = function(pos)
  {
    //testing collision with all blocks
    let colBlock; //The block this player collides with, if it exists
    let colData; //data of collision. Side of collision, collision depth
    
    //start with not being grounded or on walls
    this.isGrounded = false;
    this.isOnRightWall = false;
    this.isOnLeftWall = false;
    
    for (let i = 0; i < allBlocks.length; i++)
      {
        if (this.collidesWithAdjacent(allBlocks[i]))
          {
            //there's a collision
            
            //check if kill block
            if (allBlocks[i].getBlockType() == BlockType.kill)
              {
                //print(this.spawnPosition);
                
                //teleport player back to spawn
                this.setX(this.spawnPosition.x);
                this.setY(this.spawnPosition.y);
                pos = this.spawnPosition.copy();
                
                //print(this.position);
                
                //reset velocity
                this.velocity = createVector(0.1 * w/scaler,0.1 * w/scaler);
              }
            
            //test which side and the depth
            colData = this.getCollisionData(allBlocks[i]);
            //print(colData);
            //IDEA: halting velocity should only be done if the velocity is moving towards that side of the block. This can prevent losing speed if walking off a cliff where collision may beleave you hit the side.
            
            //moving player based on collision information
            switch(colData[0]) {
            case 1: //TOP
              pos.y -= colData[1]; //adjust player up to top of block
              this.velocity.y = 0.0; //halt veritcal velocity
                this.isGrounded = true; //since on top, on ground
              break;
            case 2: //RIGHT
              pos.x += colData[1]; //adjust player over to right of block
              this.velocity.x = 0.0; //halt horizontal velocity
                this.isOnRightWall = true; //since on right wall
              break;
            case 3: //BOTTOM
              pos.y += colData[1]; //adjust player down to bottom of block
              this.velocity.y = 0.0; //halt veritcal velocity
              break;
            case 4: //LEFT
              pos.x -= colData[1]; //adjust player over to left of block
              this.velocity.x = 0.0; //halt horizontal velocity
                this.isOnLeftWall = true; //since on left wall
              break;
            default:
              //nothing
            }
          }
      }
    
    //if we 
    
  }
    
    this.determineHaltVelocity = function(side) {
      
    }
  
  //Gives extra data on the collision.
  //returns two numbers. The first one represents the side of collision On "other"
  // 1-Top : 2-Right : 3-Bottom : 4-Left
  //Second number is the collision depth, i.e. how far in the collision is. This number can be used to correct the collision
  ///In this overridden version, cornerThreshold is applied
  this.getCollisionData = function(other)
  {
    let side = 0;
    let difference = 0;
    
    //differences  of GameObject opposing sides (references to other)
    let dTop = abs(other.getMinY() - this.getMaxY());
    let dRight = abs(other.getMaxX() - this.getMinX());
    let dBottom = abs(other.getMaxY() - this.getMinY());
    let dLeft = abs(other.getMinX() - this.getMaxX());
    
    //Applying corner Threshhold
    //removes some from left and right to make it less likely to trigger when hitting corners
    //only apply if player is not on wall the previous frame
    let dRightMod = dRight;
    let dTopMod = dTop;
    let dBottomMod = dBottom;
    let dLeftMod = dLeft;
    
    if (!this.prevIsOnRightWall && !this.prevIsOnLeftWall)
      {
        dRightMod = dRight + this.cornerThreshold;
        dLeftMod = dLeft + this.cornerThreshold;
        //print("not on wall");
      }
    else
      {
        dTopMod = dTop + this.cornerThreshold;
        dBottomMod = dBottom + this.cornerThreshold;
        //print("On Wall");
      }
    
    //TODO: MAKE IT SO THAT WHEN SLIDING DOWN WALL, THRESHOLD ISN'T APPLIED
            
    //see which difference is the smallest
    if (dTopMod <= dRightMod && dTopMod <= dBottomMod && dTopMod <= dLeftMod)
      {
        side = 1;
        difference = dTop;
        //print("TOP");
      }
    else if (dRightMod <= dTopMod && dRightMod <= dBottomMod && dRightMod <= dLeftMod)
      {
        side = 2;
        difference = dRight;
        //print("RIGHT");
      }
    else if (dBottomMod <= dTopMod && dBottomMod <= dRightMod && dBottomMod <= dLeftMod)
      {
        side = 3;
        difference = dBottom;
        //print("BOTTOM");
      }
    else //left side is least
      {
        side = 4;
        difference = dLeft;
        //print("LEFT");
      }
    
    //print("dTOP: " + dTop + " | dRIGHT: " + dRight +"dBOTTOM: " + dBottom + " | dLEFT: " + dLeft);
    
    return [side, difference];
  }
  
}
