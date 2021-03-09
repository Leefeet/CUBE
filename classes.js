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
  this.collidesWith = function(other) {
    if (this.getX() < other.getX() + other.getWidth() &&
      this.getX() + this.getWidth() > other.getX() &&
      this.getY() < other.getY() + other.getHeight() &&
      this.getY() + this.getHeight() > other.getY()) {
      return true; //there is a collision
    } else {
      return false; //there is no collision
    }
  }

  //Object collision with another GameObject including adjacency
  this.collidesWithAdjacent = function(other) {
    if (this.getX() <= other.getX() + other.getWidth() &&
      this.getX() + this.getWidth() >= other.getX() &&
      this.getY() <= other.getY() + other.getHeight() &&
      this.getY() + this.getHeight() >= other.getY()) {
      return true; //there is a collision
    } else {
      return false; //there is no collision
    }
  }

  //gives min and max values
  this.getMinX = function() {
    return this.getX();
  }
  this.getMaxX = function() {
    return this.getX() + this.getWidth();
  }
  this.getMinY = function() {
    return this.getY();
  }
  this.getMaxY = function() {
    return this.getY() + this.getHeight();
  }

  //Gives extra data on the collision.
  //returns two numbers. The first one represents the side of collision On "other"
  // 1-Top : 2-Right : 3-Bottom : 4-Left
  //Second number is the collision depth, i.e. how far in the collision is. This number can be used to correct the collision
  this.getCollisionData = function(other) {
    let side = 0;
    let difference = 0;

    //differences  of GameObject opposing sides (references to other)
    let dTop = abs(other.getMinY() - this.getMaxY());
    let dRight = abs(other.getMaxX() - this.getMinX());
    let dBottom = abs(other.getMaxY() - this.getMinY());
    let dLeft = abs(other.getMinX() - this.getMaxX());

    //see which difference is the smallest
    if (dTop <= dRight && dTop <= dBottom && dTop <= dLeft) {
      side = 1;
      difference = dTop;
      //print("TOP");
    } else if (dRight <= dTop && dRight <= dBottom && dRight <= dLeft) {
      side = 2;
      difference = dRight;
      //print("RIGHT");
    } else if (dBottom <= dTop && dBottom <= dRight && dBottom <= dLeft) {
      side = 3;
      difference = dBottom;
      //print("BOTTOM");
    } else //left side is least
    {
      side = 4;
      difference = dLeft;
      //print("LEFT");
    }

    //print("dTOP: " + dTop + " | dRIGHT: " + dRight +"dBOTTOM: " + dBottom + " | dLEFT: " + dLeft);

    return [side, difference];
  }

  //setters and getters
  this.getPosition = function() {
    return this.position;
  }
  this.getX = function() {
    return this.position.x;
  }
  this.getY = function() {
    return this.position.y;
  }
  this.getWidth = function() {
    return this.width;
  }
  this.getHeight = function() {
    return this.height;
  }

  this.setPosition = function(position) {
    this.position = position;
  }
  this.setX = function(x) {
    this.position.x = x;
  }
  this.setY = function(y) {
    this.position.y = y;
  }
  this.setWidth = function(w) {
    this.width = w;
  }
  this.setHeight = function(h) {
    this.height = h;
  }

}


//ENUM for block type
const BlockType = Object.freeze({
  "normal": 1,
  "kill": 2,
  "end": 3,
  "player": 4,
  "bounce": 5,
  "particle": 6,
});


//Object: Block
//Function: draws a block to the screen
//Inherits: GameObject
function Block(x, y, w, h) {
  GameObject.call(this, x, y, w, h);
  this.fillColor = color(255, 255, 255); //The fill color of the block
  this.strokeColor = color(0, 0, 0); //the block border color
  this.strokeWeight = 1 * progScale; //The width of the block border. Set to <= 0 to have no stroke
  //IDEA: implement strokes as overallping rectangles, so that strokes will be inside block rather than outside

  this.blockType = BlockType.normal; //defaults to normal

  this.update = function() {} //nothing to update

  this.draw = function() {
    fill(this.fillColor);
    //stroke
    if (this.strokeWeight <= 0) {
      noStroke();
    } else {
      stroke(this.strokeColor);
      strokeWeight(this.strokeWeight);
    }
    //block
    rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
  }

  //setter and getters
  this.getFillColor = function() {
    return this.fillColor;
  }
  this.getStrokeColor = function() {
    return this.strokeColor;
  }
  this.getStrokeWeight = function() {
    return this.strokeWeight;
  }
  this.getBlockType = function() {
    return this.blockType;
  }

  this.setFillColor = function(fillColor) {
    this.fillColor = fillColor;
  }
  this.setStrokeColor = function(strokeColor) {
    this.strokeColor = strokeColor;
  }
  this.setStrokeWeight = function(strokeWeight) {
    this.strokeWeight = strokeWeight;
  }
  this.setBlockType = function(blockType) {
    this.blockType = blockType;
  }
}

//a bouncy block that pushes the player
// Child of Block since it uses most of that
function BounceBlock(x, y, w, h) {
  Block.call(this, x, y, w, h);

  this.blockType = BlockType.bounce; //defaults to bounce

  this.bounceSpeed = 0.50; //bounces player away at this speed. About 6 blocks high

  this.getBounceSpeed = function() {
    return this.bounceSpeed;
  }
  this.setBounceSpeed = function(bounceSpeed) {
    this.bounceSpeed = bounceSpeed;
  }

}

//Object: Particle
//Function: draws a particle to the screen that have velocity and gravity
//Inherits: Block (for drawing)
function Particle(x, y, w, h, c, scale, dir) {
  Block.call(this, x, y, w, h);

  let scaler = scale; //helps adjust movement-variables for different screen sizes
  let direction = dir; //this can determine the general direction this particle will fly

  this.fillColor = c;
  this.blockType = BlockType.particle; //defaults to particle

  this.velocity = null; //starts null, will be set

  this.gravity = 0.00060 * scaler; //particle falling down
  this.traction = 0.00005 * scaler; //particle slowing down sideways
  this.maxFallSpeed = 0.50 * scaler;

  this.maxTime = 2.0; //amount of time this particle will live
  this.timeAlive = 0.0; //amount of time this particle has existed


  //setting initial velocity
  let velStartMin = 0.0 * scaler;
  let velStartMax = 0.2 * scaler;
  let multiplier = 2; //amplifies, so for directions
  //print("velMax: " + velStartMax);
  let rX;
  let rY;
  switch (direction) {
    case 1: //TOP
      rX = random(-velStartMax, velStartMax);
      rY = random(-velStartMax * multiplier, velStartMin); //remeber, negative is up
      this.velocity = createVector(rX, rY);
      break;
    case 2: //RIGHT
      rX = random(velStartMin, velStartMax * multiplier);
      rY = random(-velStartMax, velStartMax);
      this.velocity = createVector(rX, rY);
      break;
    case 3: //BOTTOM
      rX = random(-velStartMax, velStartMax);
      rY = random(velStartMin, velStartMax * multiplier); //positive is down
      this.velocity = createVector(rX, rY);
      break;
    case 4: //LEFT
      rX = random(-velStartMax * multiplier, velStartMin);
      rY = random(-velStartMax, velStartMax);
      this.velocity = createVector(rX, rY);
      break;
    default: //no direction specified, so any way
      rX = random(-velStartMax, velStartMax);
      //print("rX: " + rX);
      rY = random(-velStartMax, velStartMax);
      //print("rY: " + rY);
      this.velocity = createVector(rX, rY);
  }
  //print(this.velocity);

  this.update = function() {
    //increase timer
    this.timeAlive += capDeltaTime * 0.001; //convert deltaTime to miliseconds

    //particles need to move and have gravity applied.
    this.velocity.y += this.gravity * capDeltaTime;

    //EDIT WHAT"S BELOW
    //add/remove traction depending on direction and speed
    if ((this.velocity.x > 0.0 && this.velocity.x - this.traction < 0) ||
      (this.velocity.x < 0.0 && this.velocity.x + this.traction > 0) ||
      this.velocity.x == 0.0) {
      this.velocity.x = 0.0;
    } else if (this.velocity.x > 0) {
      this.velocity.x -= this.traction * capDeltaTime;
    } else //if (this.velocity.x < 0)
    {
      this.velocity.x += this.traction * capDeltaTime;
    }


    let pos = this.getPosition().copy();
    let vel = this.velocity.copy();

    vel.mult(capDeltaTime); //as unit of deltaTime

    pos.add(vel); //moving particle pos based on Velocity

    this.setPosition(pos); //applying new position to particle
  }

}

//movable object for player user
// child of Block for now so it can reuse drawing code
function Player(x, y, w, h) {
  Block.call(this, x, y, w, h);

  let scaler = 25; //this is the width/height that the player was built for. This allows the player to have its attributes adjusted based on its size

  this.spawnPosition = createVector(x, y);

  this.velocity = createVector(0.0 * w / scaler, 0.1 * w / scaler);
  this.initialVelocity = this.velocity.copy();
  this.forces = createVector(0.0, 0.0);
  this.gravity = 0.00060 * w / scaler; //0.01 without capDeltaTime
  this.maxFallSpeed = 0.50 * w / scaler;
  this.gravityWallSlide = 0.00015 * w / scaler; //0.0025 without capDeltaTime
  this.maxWallSlideSpeed = 0.20 * w / scaler;
  this.wallSlideThreshold = 0.000001; // if distance between wall is less than this, will consider player on wall

  this.movementSpeed = 0.01 * w / scaler;
  this.airMovementSpeed = 0.005 * w / scaler;
  this.maxMovementSpeed = 0.25 * w / scaler;
  this.movementTraction = 0.010 * w / scaler;
  this.cornerThreshold = 2.0 * w / scaler; //provides a leniency for whether the player will hit the side or top/bottom of a block. This will allow the player to run smoothly over blocks that are next to each other and avoid getting stopped.

  this.jumpSpeed = 0.360 * w / scaler;
  this.wallJumpSpeedX = 0.20 * w / scaler;
  this.wallJumpSpeedY = 0.3 * w / scaler;
  this.isGrounded = true;
  this.isOnRightWall = false;
  this.isOnLeftWall = false;
  //previous frame
  this.prevIsGrounded = false;
  this.prevIsOnRightWall = false;
  this.prevIsOnLeftWall = false;

  this.blockType = BlockType.player;

  //timing for death
  this.isDead = false;
  this.maxDeadTime = 0.5; //amount of time this particle will live
  this.timeDead = 0.0; //amount of time this particle has existed

  this.death = function() {
    //increment death counter
    numberOfDeaths++;
    
    //creating particles at current position
    let seg = 5;
    for (let a = 0; a < seg; a++) {
      for (let b = 0; b < seg; b++) {
        let part = new Particle(this.getX() + (this.getWidth() / seg) * a, this.getY() + (this.getWidth() / seg) * b, this.getWidth() / seg, w / seg, this.getFillColor(), this.getWidth() / scaler, 0);
        allParticles.push(part);
        part.setStrokeWeight(0);
      }
    }

    //teleport player back to spawn
    this.setX(this.spawnPosition.x);
    this.setY(this.spawnPosition.y);
    pos = this.spawnPosition.copy();

    //print(this.position);

    //reset velocity
    this.velocity = this.initialVelocity.copy();


    this.isDead = true; //setting player to dead
    
  }
  
  //same, but included input for particle direction
  this.death = function(direction) {
    //increment death counter
    numberOfDeaths++;
    
    //creating particles at current position
    let seg = 5;
    for (let a = 0; a < seg; a++) {
      for (let b = 0; b < seg; b++) {
        let part = new Particle(this.getX() + (this.getWidth() / seg) * a, this.getY() + (this.getWidth() / seg) * b, this.getWidth() / seg, w / seg, this.getFillColor(), this.getWidth() / scaler, direction);
        allParticles.push(part);
        part.setStrokeWeight(0);
      }
    }

    //teleport player back to spawn
    this.setX(this.spawnPosition.x);
    this.setY(this.spawnPosition.y);
    pos = this.spawnPosition.copy();

    //print(this.position);

    //reset velocity
    this.velocity = this.initialVelocity.copy();


    this.isDead = true; //setting player to dead
    
  }

  this.draw = function() {
    //only draw if alive
    if (!this.isDead) {
      fill(this.fillColor);
      //stroke
      if (this.strokeWeight <= 0) {
        noStroke();
      } else {
        stroke(this.strokeColor);
        strokeWeight(this.strokeWeight);
      }
      //block
      rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
    }
  }

  this.update = function() {

    //only update movement if alive
    if (this.isDead) {
      //increment timer
      this.timeDead += capDeltaTime * 0.001; //convert deltaTime to miliseconds

      //respawn player if time is over
      if (this.timeDead >= this.maxDeadTime) {
        this.isDead = false;
        this.timeDead = 0.0;
      }
    } else {
      this.playerMovement();

      //adding gravity
      //different gravity is sliding down a wall
      //must also make sure player is falling and not rising
      if (this.velocity.y > 0 && (this.isOnRightWall || this.isOnLeftWall)) {
        this.velocity.y += this.gravityWallSlide * capDeltaTime;
      } else {
        this.velocity.y += this.gravity * capDeltaTime;
      }

      let pos = this.getPosition().copy();
      let vel = this.velocity.copy();

      //print("onLeft: " + this.isOnLeftWall);
      //print("onRight: " + this.isOnRightWall);

      vel.mult(capDeltaTime); //as unit of deltaTime

      pos.add(vel); //moving player pos based on Velocity

      this.setPosition(pos); //applying new position to player

      //printing player's left position
      //print("player right: " + this.getMaxX());

      this.testBlockCollision(pos); //testing if hit something and position/velocity needs adjustment

      this.setPosition(pos); //applying new position to player

      // kill player if out of bounds
      //if player is below screen, kill player
      if (this.position.y > height) {
        this.death(1); //particles up
      }
      else if (this.position.x > width) //right side
        {
          this.death(4); //particles left
        }
      else if (this.position.x + this.getWidth() < 0.0) //left side
        {
          this.death(2); //particles right
        }
      //for now, don't kill off top
    }

    //updating variables
    this.prevIsGrounded = this.isGrounded;
    this.prevIsOnRightWall = this.isOnRightWall;
    this.prevIsOnLeftWall = this.isOnLeftWall;
  }

  this.playerMovement = function() {
    //arrow keys for left/right movement
    if (keyIsDown(keyRight) || keyIsDown(keyD)) { //RIGHT
      if (this.isGrounded && this.velocity.x < 0.0) { //stop quicker
        this.velocity.x += this.movementSpeed;
        this.velocity.x += this.movementTraction;
      }
      //move to right normally, but only if below maxSpeed
      else if (this.isGrounded && this.velocity.x < this.maxMovementSpeed) {
        //cap to max speed if adding speed would overshoot maxSpeed
        if (this.velocity.x + this.movementSpeed > this.maxMovementSpeed) {
          let dif = this.maxMovementSpeed - this.velocity.x;
          this.velocity.x += dif;
        } else {
          this.velocity.x += this.movementSpeed;
        }
      }
      //arial movement
      else if (!this.isGrounded && this.velocity.x < this.maxMovementSpeed) {
        //cap to max speed if adding speed would overshoot maxSpeed
        if (this.velocity.x + this.airMovementSpeed > this.maxMovementSpeed) {
          let dif = this.maxMovementSpeed - this.velocity.x;
          this.velocity.x += dif;
        } else {
          this.velocity.x += this.airMovementSpeed;
        }
      }
    }
    if (keyIsDown(keyLeft) || keyIsDown(keyA)) { //LEFT
      if (this.isGrounded && this.velocity.x > 0.0) { //stop quicker
        this.velocity.x -= this.movementSpeed;
        this.velocity.x -= this.movementTraction;
      }
      //move to left normally, but only if below maxSpeed
      else if (this.isGrounded && this.velocity.x > -this.maxMovementSpeed) {
        //cap to max speed if adding speed would overshoot maxSpeed
        if (this.velocity.x - this.movementSpeed < -this.maxMovementSpeed) {
          let dif = -this.maxMovementSpeed - this.velocity.x;
          this.velocity.x += dif;
        } else {
          this.velocity.x -= this.movementSpeed;
        }
      }
      //arial movement
      else if (!this.isGrounded && this.velocity.x > -this.maxMovementSpeed) {
        //cap to max speed if adding speed would overshoot maxSpeed
        if (this.velocity.x - this.airMovementSpeed < -this.maxMovementSpeed) {
          let dif = -this.maxMovementSpeed - this.velocity.x;
          this.velocity.x += dif;
        } else {
          this.velocity.x -= this.airMovementSpeed;
        }



      }
    }

    //if neither sirection is pressed and on the ground, slow player down
    if (!keyIsDown(keyRight) && !keyIsDown(keyLeft) &&
      !keyIsDown(keyD) && !keyIsDown(keyA) && this.isGrounded) {
      //if slowing down would result in moving in the oposite direction. set movement to 0
      if ((this.velocity.x > 0.0 &&
          this.velocity.x - this.movementTraction < 0) ||
        (this.velocity.x < 0.0 &&
          this.velocity.x + this.movementTraction > 0) ||
        this.velocity.x == 0.0) {
        this.velocity.x = 0.0;
      } else if (this.velocity.x > 0) {
        this.velocity.x -= this.movementTraction;
      } else //if (this.velocity.x < 0)
      {
        this.velocity.x += this.movementTraction;
      }
    }
    //if faster than movement speed
    else if (this.isGrounded && abs(this.velocity.x) > this.maxMovementSpeed) {
      if (this.velocity.x > this.maxMovementSpeed) //moving right
      {
        this.velocity.x -= this.movementTraction;
      } else //moving left
      {
        this.velocity.x += this.movementTraction;
      }
    }


    //This is now handled within movement checks
    //if speed too fast, set to max
    // if (this.velocity.x > this.maxMovementSpeed)
    //   {
    //     this.velocity.x = this.maxMovementSpeed;
    //   }
    // else if (this.velocity.x < -this.maxMovementSpeed)
    //   {
    //     this.velocity.x = -this.maxMovementSpeed;
    //   }

    //jumping
    if (spaceWasPressed && this.isGrounded) //Spacebar
    {
      this.velocity.y -= this.jumpSpeed;
      this.isGrounded = false;
    }

    //wall jumping
    //Right Wall Jump, pushes to left
    //Note that a wall jump and normal jump cannot occur at the same time
    else if (!this.isGrounded && this.prevIsOnRightWall && spaceWasPressed) {
      this.velocity.x += this.wallJumpSpeedX; //left speed
      this.velocity.y = -this.wallJumpSpeedY;
    }
    //Left Wall jump, pushes to the right
    else if (!this.isGrounded && this.prevIsOnLeftWall && spaceWasPressed) {
      this.velocity.x -= this.wallJumpSpeedX; //right speed
      this.velocity.y = -this.wallJumpSpeedY;
    }

    //falling speed, cap if too fast
    //cap is different if sliding down a wall
    // print("on right wall: " + this.prevIsOnRightWall);
    // print("on left wall: " + this.prevIsOnLeftWall);
    // print("Velocity" + this.velocity.y + " | mfall speed: " + this.maxFallSpeed);
    if (this.velocity.y > this.maxWallSlideSpeed && (this.prevIsOnRightWall || this.prevIsOnLeftWall)) {
      this.velocity.y = this.maxWallSlideSpeed;
    } else if (this.velocity.y > this.maxFallSpeed) {
      this.velocity.y = this.maxFallSpeed;
    }
  }

  this.applyLeniency = function(dTop, dRight, dBottom, dLeft) //applies threshold
  {
    //removes some from left and right to make it less likely to trigger when hitting corners
    dRight -= this.cornerThreshold;
    dLeft -= this.cornerThreshold;
  }

  this.testBlockCollision = function(pos) {
    //testing collision with all blocks
    let colBlock; //The block this player collides with, if it exists
    let colData; //data of collision. Side of collision, collision depth

    //start with not being grounded or on walls
    this.isGrounded = false;
    this.isOnRightWall = false;
    this.isOnLeftWall = false;

    for (let i = 0; i < allBlocks.length; i++) {
      if (this.collidesWithAdjacent(allBlocks[i])) {
        //there's a collision

        //check if kill block
        if (allBlocks[i].getBlockType() == BlockType.kill) {
          //spawn particles and do death-related changes
          this.death();
          
          //skip rest of collision
          break;
        }
        //check if end block
        if (allBlocks[i].getBlockType() == BlockType.end) {
          //flip boolean to load next level / end game
          isLevelComplete = true;

          //skip rest of collision
          break;
        }

        //test which side and the depth
        colData = this.getCollisionData(allBlocks[i]);
        //print(colData);
        //IDEA: halting velocity should only be done if the velocity is moving towards that side of the block. This can prevent losing speed if walking off a cliff where collision may beleave you hit the side.

        //moving player based on collision information
        switch (colData[0]) {
          case 1: //TOP
            pos.y -= colData[1]; //adjust player up to top of block
            this.velocity.y = 0.0; //halt veritcal velocity
            this.isGrounded = true; //since on top, on ground
            //if bounce block, apply bounce velocity
            if (allBlocks[i].getBlockType() == BlockType.bounce) {
              this.velocity.y -= allBlocks[i].bounceSpeed * this.width / scaler;
            }
            break;
          case 2: //RIGHT
            pos.x += colData[1]; //adjust player over to right of block
            this.velocity.x = 0.0; //halt horizontal velocity
            this.isOnRightWall = true; //since on right wall
            //if bounce block, apply bounce velocity
            if (allBlocks[i].getBlockType() == BlockType.bounce) {
              this.velocity.x += allBlocks[i].bounceSpeed * this.width / scaler;
            }
            break;
          case 3: //BOTTOM
            pos.y += colData[1]; //adjust player down to bottom of block
            this.velocity.y = 0.0; //halt veritcal velocity
            //if bounce block, apply bounce velocity
            if (allBlocks[i].getBlockType() == BlockType.bounce) {
              this.velocity.y += allBlocks[i].bounceSpeed * this.width / scaler;
            }
            break;
          case 4: //LEFT
            pos.x -= colData[1]; //adjust player over to left of block
            this.velocity.x = 0.0; //halt horizontal velocity
            this.isOnLeftWall = true; //since on left wall
            //if bounce block, apply bounce velocity
            if (allBlocks[i].getBlockType() == BlockType.bounce) {
              this.velocity.x -= allBlocks[i].bounceSpeed * this.width / scaler;
            }
            break;
          default:
            //nothing
        }

        /*
        
        This will have to be implemented differently to work as intended.
        With it as it is, it will never check a block unless it's being touched
        
        //new, extra check for wall adjacency
        //to prevent a rare issue where adjaceny is very, very slightly off, do a check to set wallClinging status anyway
        // if the distancec between the edgages is less than the threshold, consider the player on the wall
        if (colData[0] != 1 && colData[0] != 3) //not top or bottom collision
        {
          let dLeft = abs(this.getMinX() - allBlocks[i].getMaxX()); //left of player to right of block
          let dRight = abs(allBlocks[i].getMinX() - this.getMaxX()); //left of block to right of player
          //print("dLeft: " + dLeft);
          print("dRight: " + dRight);
          // print("left: " + dRight < this.wallSlideThreshold);
          // print("right: " + dRight);
          // print(this.wallSlideThreshold);
          if (dRight < this.wallSlideThreshold) //Right Wall Cling
            {
              print("RIGHT");
              this.isOnLeftWall = true;
            }
          else if (dLeft < this.wallSlideThreshold) //Left Wall Cling
            {
              print("LEFT");
              this.isOnRightWall = true;
            }
        }*/
      }
    }
    // TODO THIS

    //if we 

  }

  this.determineHaltVelocity = function(side) {

  }

  //Gives extra data on the collision.
  //returns two numbers. The first one represents the side of collision On "other"
  // 1-Top : 2-Right : 3-Bottom : 4-Left
  //Second number is the collision depth, i.e. how far in the collision is. This number can be used to correct the collision
  ///In this overridden version, cornerThreshold is applied
  this.getCollisionData = function(other) {
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

    if (!this.prevIsOnRightWall && !this.prevIsOnLeftWall) {
      dRightMod = dRight + this.cornerThreshold;
      dLeftMod = dLeft + this.cornerThreshold;
      //print("not on wall");
    } else {
      dTopMod = dTop + this.cornerThreshold;
      dBottomMod = dBottom + this.cornerThreshold;
      //print("On Wall");
    }

    //TODO: MAKE IT SO THAT WHEN SLIDING DOWN WALL, THRESHOLD ISN'T APPLIED

    //see which difference is the smallest
    if (dTopMod <= dRightMod && dTopMod <= dBottomMod && dTopMod <= dLeftMod) {
      side = 1;
      difference = dTop;
      //print("TOP");
    } else if (dRightMod <= dTopMod && dRightMod <= dBottomMod && dRightMod <= dLeftMod) {
      side = 2;
      difference = dRight;
      //print("RIGHT");
    } else if (dBottomMod <= dTopMod && dBottomMod <= dRightMod && dBottomMod <= dLeftMod) {
      side = 3;
      difference = dBottom;
      //print("BOTTOM");
    } else //left side is least
    {
      side = 4;
      difference = dLeft;
      //print("LEFT: " + other.getMinX());
    }

    //print("dTOP: " + dTop + " | dRIGHT: " + dRight +"dBOTTOM: " + dBottom + " | dLEFT: " + dLeft);

    return [side, difference];
  }

}

function Button(x, y, w, h, onClick) {
  GameObject.call(this, x, y, w, h);
  this.fillColor = color(255, 255, 255); //The fill color of the button
  this.hoverColor = color(255, 255, 0); //the fill color when mouse hovers
  this.strokeColor = color(0, 0, 0); //the button outline color
  this.strokeWeight = 1 * progScale; //The width of the button border. Set to <= 0 to have no stroke

  this.onClick = onClick; //What the button does when clicked

  this.displayText = ""; //the text displayed within the button
  this.textSize = 10 * progScale; //size of font
  this.textColor = color(255, 255, 255);
  this.textHoverColor = color(255, 255, 255);
  this.textFont = fontRegular; //the font

  this.isHovering = false; //whether mouse is hovering over


  this.update = function() {
    if (this.isMouseHovering()) {
      this.isHovering = true;
      //change mouse cursor to pointer
      cursor("pointer");
      //if click, activate
      if (mouseWasClickedLeft) {
        this.onClick();
      }
    } else {
      this.isHovering = false;
    }
  }


  this.draw = function() {
    //fill color changes if hovering
    if (this.isHovering) {
      fill(this.hoverColor);
    } else {
      fill(this.fillColor);
    }

    if (this.strokeWeight <= 0) {
      noStroke();
    } else {
      stroke(this.strokeColor);
      strokeWeight(this.strokeWeight);
    }

    rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());

    //fill color changes if hovering
    if (this.isHovering) {
      fill(this.textHoverColor);
    } else {
      fill(this.textColor);
    }
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(this.textSize);
    textFont(this.textFont);
    var textX = this.getX() + this.getWidth() / 2;
    var textY = this.getY() + this.getHeight() / 2;
    text(this.displayText, textX, textY);

  }

  this.isMouseHovering = function() {
    if (mouseX >= this.getX() && mouseX <= this.getX() + this.getWidth() &&
      mouseY >= this.getY() && mouseY <= this.getY() + this.getHeight()) {
      return true;
    } else {
      return false;
    }
  }
}

function DisplayText(x, y, w, h, s) {
  GameObject.call(this, x, y, w, h);
  this.strokeColor = color(0, 0, 0); //the text outline color
  this.strokeWeight = 1 * progScale; //The width of the text border. Set to <= 0 to have no stroke

  this.displayText = s; //the text displayed
  this.textSize = 10 * progScale; //size of font
  this.textColor = color(255, 255, 255);
  this.textAlignH = CENTER; //Horizontal align to coordinate
  this.textAlignV = CENTER; //Vertical align to coordinate
  this.textFont = fontRegular; //the font

  this.update = function() {}

  this.draw = function() {
    //stroke
    if (this.strokeWeight <= 0) {
      noStroke();
    } else {
      stroke(this.strokeColor);
      strokeWeight(this.strokeWeight);
    }

    fill(this.textColor);
    noStroke();
    textAlign(this.textAlignH, this.textAlignV);
    textSize(this.textSize);
    textFont(this.textFont);
    var textX = this.getX() + this.getWidth() / 2;
    var textY = this.getY() + this.getHeight() / 2;
    text(this.displayText, textX, textY);

  }

}

//Object: Timer
//Function: keeps track of game time and displays it to screen
//Inherits: DisplayText
function Timer(x, y, w, h) {
  DisplayText.call(this, x, y, w, h, "00:00:000");
  
  this.milliseconds = 0; //number of milliseconds that have passed
  
  //this.displayText = s; //the text displayed
  
  this.isCounting = false; //whether timer will continue to count or not
  
  this.update = function() {
    //add to timer if counting
    if (this.isCounting)
      {
    this.milliseconds += capDeltaTime; //deltaTime is in milliseconds, which works well for this
      }    
    
    //building time text
    //get minutes, seconds, and milliseconds
    let min = this.getMinutes();
    let sec = this.getSeconds();
    let mil = this.getMilliseconds();
    
    //construct strings and add 0s if needed
    let strMin;
    let strSec;
    let strMil;
    
    if (min < 10) { strMin = "0" + str(min); }
    else { strMin = str(min); }
    
    if (sec < 10) { strSec = "0" + str(sec); }
    else { strSec = str(sec); }
    
    if (mil < 10) { strMil = "00" + str(mil); }
    else if (mil < 100) { strMil = "0" + str(mil); }
    else { strMil = str(mil); }
    
    this.displayText = strMin + ":" + strSec + ":" + strMil;
  }
  
  this.getMinutes = function() {
    //60000 milliseconds in a minute
    return int(this.milliseconds/60000);
  }
  
  this.getSeconds = function() {
        //1000 milliseconds in a second
    // modulo 60 since we want seconds between 0-59 (minutes)
    return int((this.milliseconds/1000) % 60);
  }
  
  this.getMilliseconds = function() {
    // modulo 1000 to get milliseconds absent of seconds and minutes
    return int(this.milliseconds % 1000);
  }
  
  this.reset = function()
  {
    this.milliseconds = 0;
    this.isCounting = false;
  }
  
  this.start = function() {this.isCounting = true;}
  this.stop = function() {this.isCounting = false;}
  
}