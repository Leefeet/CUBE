/*
  Platformer 1.9
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-9-2021
  
  Changes Made:
  - Player's attributes now scale with player's size
    - a new scaler variable in player represents the size the player was designer for. When the player's current width is divided by the scaler, it will cause the player's attributes to function the same regardless of size
    - the player will always jump 3 blocks high, even if the blocks appear smaller or larger
    - player variables are now set differently to account for this change
  - Created a new test level
  
  
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    InstanceOf: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    Object Collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    
*/

let player;

let mouseBlock;

let levelData;

//runs actions that may be required before anything it setup() or draw()
function preload()
{
  levelData = []; //an array of all the Levels
  
  levelData.push(loadStrings('assets/level_0.txt'));
}

function setup() {
  createCanvas(sketchWidth, sketchHeight);
  
  frameRate(60);
  smooth();
  
  //setting initial variables
  allObjects = [];
  allBlocks = [];
  backgroundColor = color(120, 120, 120, 255);
        
  //buildLevel1();
  
  buildLevel(0);
}

function draw() {
  background(backgroundColor);

  fill(255);
    
  
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

function buildLevelFromFile(fileName)
{
  
}

//builds a specific level from the levelData[] array
function buildLevel(levelNum)
{
  let level = levelData[levelNum];
  
  //prints contents of level
  //print(levelData[levelNum]);
  
  //determining level block row and column number
  let rows = level.length;
  let cols = level[0].length;
  
  //print("rows: " + rows + " | columns: " + cols);
  
  //we can determine block widths based on sketch size
  //determine whether the level is wider or taller
  let testWidth = width/cols;
  let testHeight = height/rows;
  
  let blockWidth;
  
  if (testWidth < testHeight) {blockWidth = testWidth;}
  else {blockWidth = testHeight;}
  
  //constructing level
  for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let c = level[j][i]; //block data on txt
          
        if (c == '.') // air space, so skip
          {continue;}
        else if (c == 'B') //normal block
          {
            let x = blockWidth*i;
            let y = blockWidth*j;
            let w = blockWidth;
            
            let b = new Block(x,y,w,w);
            allObjects.push(b);
            allBlocks.push(b);
          }
        else if (c == 'P') // player
          {
            let x = blockWidth*i;
            let y = blockWidth*j;
            let w = blockWidth * 0.90;
            
            let p = new Player(x,y,w,w);
            allObjects.push(p);
            
            p.fillColor = color(255, 255, 0); //yellow
          }
      }
  }
  
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








