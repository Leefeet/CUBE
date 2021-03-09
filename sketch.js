/*
  Platformer 1.14
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-11-2021
  
  Changes Made:
  - Made a few basic first levels, like a tutorial for the mechanics
    - Levels 1-8 all inherently explain game mechanics, including sideways movement, jumping, how high the player can jump, jumping over gaps, wall jumping, end blocks, kill blocks, and bounce blocks
      - level_1.txt teaches movement and encourages touching the End Block
      - level_2.txt shows jumping
      - level_3.txt shows how high you can jump
      - level_4.txt shows you can jump over gaps
      - level_5.txt shows wall jumping
      - level_6.txt shows kill blocks
      - level_7.txt teaches careful aerial movement to not hit the kill blocks
      - level_8.txt shows bounce blocks
  - Level txt loading is more automated, using a 'for' loop
  - Added more introduction levels to teach players how to play
  - Global currentLevel now begins at 1, where the real levels begin
  - New Bounce Blocks push player based on bounce speed
    - BlockType Enum now has a "bounce" member
    - bounceSpeed can be obtained from a Bounce Block
    - an 'S' in a level will create a Bounce Block ('S' stands for "speed" since B is already taken by the normal Block)
    - During block collision, the Player checks if its a BounceBlock and adds the BounceBlock's velocity to its own velocity based on the side it hit (top, left, etc.)
    - When Player uses bounceSpeed, it multiplies it by its width/scaler to ensure it will move the same regardless of how large blocks are rendered

  
  Ideas:
  - When the level is built, have rows and groups of blocks be "merged" to become one larger rectangle. This will improve performance as less blocks would need to be compared.
  - Add mroe block types, like:
    - Blue bounce blocks, bounce the player in a direction based on collision side
  - Upgrades for the player, like
    - Midair Dash
    - Double Jump
    These upgrades ar etemporary per-level and change the color of the player to indicate they are in affect and are usable (change color when used)
  
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
    
  let numLevels = 10;
  for (let i = 0; i < numLevels; i++)
  {
  levelData.push(loadStrings('assets/level_' + i + '.txt'));
  }
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
  
  //buildLevel(0);
  
  loadNextLevel();
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
  let startX = 0.0;
  let startY = 0.0;
  
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
            b.setStrokeColor(color(255, 255, 255)); //white stroke
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
        else if (c == "S") //bounce block
          {
            let x = startX + blockWidth*i;
            let y = startY + blockWidth*j;
            let w = blockWidth;
            
            let s = new BounceBlock(x,y,w,w);
            allObjects.push(s);
            allBlocks.push(s);
            
            s.setBlockType(BlockType.bounce);
            s.fillColor = color(0, 0, 255); //blue
            s.setStrokeWeight(0);
          }
      }
  }
  
  //merge adjacent blocks together
  mergeBlocks();
}

//merges groups of blocks near each other into single rectangles
function mergeBlocks()
{
  //uses allBlocks[]
  
  
  
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








