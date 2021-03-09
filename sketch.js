/*
  Platformer
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-4-2021
  
  Changes Made:
  - Classes can now exist in seperate files, cleaning up space in JS files
  - implementing inheritance
  - Created basic GameObject class
  - Created test Box class
  - Added frameRate() and smooth() calls in setup()
  - Decided not to use WebGL since implementation seems unecessary
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    InstanceOf: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    Object Collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    
*/

let allObjects; //a collection of all existing GameObjects

function setup() {
  createCanvas(400, 400);
  
  frameRate(60);
  smooth();
  
  myBox = new Box(0, 0, 300, 300);
      
}

function keyPressed() {
  if (c === 0) {
    c = 255;
  } else {
    c = 0;
  }
}

function draw() {
  background(150);
    myBox.draw();

  fill(c);
  rect(100, 100, 100, 100);
  
}










