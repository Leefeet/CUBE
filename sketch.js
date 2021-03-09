/*
  Platformer 1.3
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-4-2021
  
  Changes Made:
  - implement test Player object to test collision
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    InstanceOf: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    Object Collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    
*/

let player;

function setup() {
  createCanvas(sketchWidth, sketchHeight);
  
  frameRate(60);
  smooth();
  
  //setting initial variables
  allObjects = [];
  backgroundColor = color(120, 120, 120, 255);
    
  player = new Player(100, 100, 25, 25);
  allObjects.push(player);
  
  buildLevel1();
}

function draw() {
  background(backgroundColor);

  fill(255);
  //rect(100, 100, 100, 100);
  print("player X: " + player.getX() + " | Y: " + player.getY());
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
}

function buildLevel1()
{
  //creating 5 blocks
  let x = 50 * progScale;
  let y = sketchHeight -100*progScale;
  let w = 50 * progScale;
  for (let i = 0; i < 5; i++)
    {
      let b = new Block(x,y,w,w);
      allObjects.push(b);
      
      //move position for next
      x += w;
    }
  
  print("player X: " + player.getX() + " | Y: " + player.getY());
}

function keyPressed() //activates 1 frame when a keyboard key is pressed down
{

  
}








