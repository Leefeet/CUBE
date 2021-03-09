/*
  Platformer 1.2
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-4-2021
  
  Changes Made:
  - implemented Block drawing
  - implemented Block setters and getters
  - implemented GameObject collision (Axis-Aligned Bounding Box, or AABB)
  - GameObjects Update() and Draw() loops for allObjects[] array
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
  myBox = new Box(0, 0, 300, 300);
    
  player = new Player(sketchWidth/2, sketchHeight/2, 25, 25);
  allObjects.push(player);
  
  buildLevel1();
}

function draw() {
  background(backgroundColor);
    myBox.draw();

  fill(255);
  rect(100, 100, 100, 100);
  
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
}

function keyPressed() //activates 1 frame when a keyboard key is pressed down
{

  
}








