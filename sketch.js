/*
  Platformer 1.12
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-9-2021
  
  Changes Made:
  - Implemented "end" blocks, which advance to the next level if touched
    - When an 'E' is found, it places an End Block
  - New function and logic to End a level and start another one
    - A new level was created (level_1.txt) and loaded into levelData[] to illustrate this effect
    - New global variables for the currentLevel number and a boolean for whether the level is completed. This indicates when the next level needs to be loaded
    - loadNextLevel() function clears allObjects[] and allBlocks[], increments the level count, and loads the next level if it exists
  - Changed player color to Orange, rather than yellow
  - Level will now be "centered on screen", whether it is centered tall or wide
  - Constant variables for movement keys were created to make 'if' statements more readable
  - the 'A' and 'D' keys can now be used instead of the Left and Right Arrow keys (either can be used based on Player preference)
  - The visual style has been dramatically changed
    - All blocks, including the player, no longer have borders. This gives a very smooth, blocky look as adjacent blocks blend together
    - The background was made much darker (almost pure black) to contrast the mostly white blocks
  - Player Movement has been adjusted
    - Jump speed has been slightly increased
    - Traction has been doubled
    - When on the ground and moving in a direction, then moving in the opposite direction will also apply traction to make the player stop much quicker
    - If player collides with End Block, isLevelComplete boolean will be set to true
  - A new "ideas" comment section has been created. This includes things I could implement, but aren't required
  
  
  Ideas:
  - When the level is built, have rows and groups of blocks be "merged" to become one larger rectangle. This will improve performance as less blocks would need to be compared.
  
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
  levelData.push(loadStrings('assets/level_1.txt'));
}

function setup() {
  createCanvas(sketchWidth, sketchHeight);
  
  frameRate(60);
  smooth();
  
  //setting initial variables
  allObjects = [];
  allBlocks = [];
  backgroundColor = color(10, 10, 10, 255);
        
  //buildLevel1();
  
  buildLevel(0);
}

function draw() {
  background(backgroundColor);

  fill(255);
  
  //adjusting deltaTime
  capDeltaTime = deltaTime;
  if(deltaTime > maxTime) {
    capDeltaTime = maxTime;
    //print("capped");
    }
  
  //if level is completed, run function
  if (isLevelComplete)
    {
      isLevelComplete = false;
      loadNextLevel();
    }
  
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

//function called when level is complete, will load next level
function loadNextLevel()
{
  //first, delete everything
  allBlocks.splice(0, allBlocks.length);
  allObjects.splice(0, allObjects.length); //remove all elements starting at the first index for the whole length
  
  //increment level
  currentLevel++;
  
  //load next level if it exists
  if (currentLevel < levelData.length)
    {
      //load next level
      buildLevel(currentLevel);
    }
  else
    {
      // no more levels
    }
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
  let startX = 0;
  let startY = 0;
  
  if (testWidth < testHeight) {
    blockWidth = testWidth;
    startY = (height - (blockWidth*rows))/2; //centers level vertically
    //print("Wide");
  }
  else {
    blockWidth = testHeight;
    startX = (width - (blockWidth*cols))/2; //centers level horizontally
    //print(startY);
  }
  
  //constructing level
  for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let c = level[j][i]; //block data on txt
          
        if (c == '.') // air space, so skip
          {continue;}
        else if (c == 'B') //normal block
          {
            let x = startX + blockWidth*i;
            let y = startY + blockWidth*j;
            let w = blockWidth;
            
            let b = new Block(x,y,w,w);
            allObjects.push(b);
            allBlocks.push(b);
            
            b.setStrokeWeight(0);
          }
        else if (c == 'P') // player
          {
            let x = startX + blockWidth*i;
            let y = startY + blockWidth*j;
            let w = blockWidth * 0.75;
            
            let p = new Player(x,y,w,w);
            allObjects.push(p);
            
            p.fillColor = color(255, 190, 0); //Orange
            
            p.setStrokeWeight(0);
          }
        else if (c == "K") //kill block
          {
            let x = startX + blockWidth*i;
            let y = startY + blockWidth*j;
            let w = blockWidth;
            
            let k = new Block(x,y,w,w);
            allObjects.push(k);
            allBlocks.push(k);
            
            k.setBlockType(BlockType.kill);
            k.fillColor = color(255, 0, 0); //red
            k.setStrokeWeight(0);
          }
        else if (c == "E") //end block
          {
            let x = startX + blockWidth*i;
            let y = startY + blockWidth*j;
            let w = blockWidth;
            
            let e = new Block(x,y,w,w);
            allObjects.push(e);
            allBlocks.push(e);
            
            e.setBlockType(BlockType.end);
            e.fillColor = color(0, 244, 0); //green
            e.setStrokeWeight(0);
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








