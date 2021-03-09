/*
  Platformer
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-4-2021
  
  Changes Made:
  - Testing how inheritance works best in JavaScript
  - Tested input methods through keyboard
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    
*/

let c = 0;

function setup() {
  createCanvas(400, 400);
  
  let myObject = new GameObject(5);
  myObject.printX();
  
  let myChild = new Inherit(7);
  myChild.printX();
  
  let multiChild = new DoubleChild(9);
  multiChild.printX();
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
  
  fill(c);
  rect(100, 100, 100, 100);
}


function GameObject(x)
{
  this.x = x;
  
  this.printX = function()
  {
    print(this.x);
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







