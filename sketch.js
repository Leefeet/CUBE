/*
  Platformer 1.6
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-5-2021
  
  Changes Made:
  - Added one extra block in testing environment to test jumping on the ground when adjacent to a wall at the same time
  - Created new collision function in GameObject: collidesWithAdjacent(). This will return true if the two GameObjects are adjacent to each other, unlike the other function which will return false. This is very useful for wall sliding
  - reduced player's air movement speed to prevent explioting wall jumps off the same wall
  - added new player variables for wall jumping, speeds in the X and Y direction
  - new boolean variables tracking whether the player was on the ground or a wall on the previous frame
  - the player can now wall jump when in the air and on a wall
    - When the player is both on the ground and on the wall, normal ground jumping will take priority
  - player's wall sliding speed cap now uses the boolean variables for the previous frames
  - player now uses adjacency collision check for block collisions
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    InstanceOf: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    Object Collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    
*/

let player;

let mouseBlock;

function setup() {
  createCanvas(sketchWidth, sketchHeight);
  
  frameRate(60);
  smooth();
  
  //setting initial variables
  allObjects = [];
  allBlocks = [];
  backgroundColor = color(120, 120, 120, 255);
    
  player = new Player(100, 250, 25, 25);
  player.fillColor = color(255, 255, 0);
  allObjects.push(player);
  
  mouseBlock = new Block(0,0,50,50);
  allObjects.push(mouseBlock);
  allBlocks.push(mouseBlock);
  
  buildLevel1();
}

function draw() {
  background(backgroundColor);

  fill(255);
  
  mouseBlock.setPosition(createVector(mouseX-mouseBlock.getWidth()/2, mouseY-mouseBlock.getHeight()/2));
  
  
  //print("blocks: " + allBlocks.length);
  //updating GameObjects
  for (let i = 0; i < allObjects.length; i++)
    {
      allObjects[i].update(); 
    }
  //Drawing GameObjects
  for (let i = 0; i < allObjects.length; i++)
    {
      allObjects[i].draw();
    }
  
  //resetting Key Pressed Booleans
  spaceWasPressed = false;
}

function buildLevel1()
{
  //creating 5 blocks
  let x = 50 * progScale;
  let y = sketchHeight -100*progScale;
  let w = 50 * progScale;
  for (let i = 0; i < 17; i++)
    {
      let b = new Block(x,y,w,w);
      allObjects.push(b);
      allBlocks.push(b);
      
      let c = new Block(y,x,w,w);
      allObjects.push(c);
      allBlocks.push(c);
      
      //move position for next
      x += w;
    }
  
  //print("player X: " + player.getX() + " | Y: " + player.getY());
}

function keyPressed() //activates 1 frame when a keyboard key is pressed down
{
  if (keyCode === 32)
    {
      spaceWasPressed = true;
    }

  
}








