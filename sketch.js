/*
  Platformer 1.4
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-5-2021
  
  Changes Made:
  - created mouseBlock object to help test collisions. This block is attached to the mouse
  - created allBlocks[], which stores specifically physical blocks that the player can collide with
  - simplified collision check by creating getMin() and getMax() functions for GameObject
  - added to player movement
    - different movement speeds for ground and air movement
    - traction to slow down player on ground
    - booleans for whether grounded or on a wall
    - move with arrows keys and jump with spacebar
  - added custom collision checking function to Player that applies a "threshold" when checking blocks. This makes it easier to slide over blocks where the player could get caught on the edges between two blocks

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
  for (let i = 0; i < 15; i++)
    {
      let b = new Block(x,y,w,w);
      allObjects.push(b);
      allBlocks.push(b);
      
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








