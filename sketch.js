/*
  Platformer 1.16
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-11-2021
  
  Changes Made:
  - Added mouseWasClickedLeft variable. Updates to true on frame when left click was released
  - Created new Button Object
    - Rectangular button with text
    - Detects if mouse is hovering over itself
    - Button will change color if mouse is hovering
    - Clicking button will activate its onClick() function
  - Main menu prototype leads to levels. Built with buildMainMenu()
  - When there's no new level, returns to main menu
  
  Ideas:
  - When the level is built, have rows and groups of blocks be "merged" to become one larger rectangle. This will improve performance as less blocks would need to be compared.
  - Add mroe block types, like:
    - Blue bounce blocks, bounce the player in a direction based on collision side
  - Upgrades for the player, like
    - Midair Dash (omni-directional)
    - Double Jump
    These upgrades are temporary per-level and change the color of the player to indicate they are in affect and are usable (change color when used)
  
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
  
  currentLevel = 0;
  //loadNextLevel();
  buildMainMenu();
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
      anotherLevel = loadNextLevel();
      if (!anotherLevel)
        {
          //main menu again
          buildMainMenu();
        }
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
  
  //ressetting mouseWasClickedLeft
  mouseWasClickedLeft = false;
}

function mouseClicked() {
  if (mouseButton === LEFT) {
    mouseWasClickedLeft = true;
  }
}

//draws the main menu to the screen
function buildMainMenu()
{
  //creating Title
  let x = width/2;
  let y = 150 * progScale;
  let blank = function() {return;}
  let title = new Button(x, y, 0, 0, blank);
  title.displayText = "Cube";
  title.textSize = 200 * progScale;
  allObjects.push(title);
  
  //tutorial button
  let w = 600 * progScale;
  let h = 125 * progScale;
  x = (width/2) - w/2;
  y = 300 * progScale;
  let startTutorial = function() {
    clearGameObjects(); //clearing menu
    loadNextLevel(); //starting level
  };
  let btnTutorial = new Button(x, y, w, h, startTutorial);
  btnTutorial.displayText = "Play Tutorial";
  btnTutorial.strokeWeight = 0;
  btnTutorial.fillColor = color(255, 255, 0);
  btnTutorial.hoverColor = color(0, 255, 0);
  btnTutorial.textSize = 100 * progScale;
  btnTutorial.textColor = color(0, 0, 0);
  allObjects.push(btnTutorial);
  
}

function buildLevelFromFile(fileName)
{
  
}

function clearGameObjects()
{
  allBlocks.splice(0, allBlocks.length);
  allObjects.splice(0, allObjects.length); //remove all elements starting at the first index for the whole length
}

//function called when level is complete, will load next level
function loadNextLevel()
{
  //first, delete everything
  clearGameObjects();
  
  //increment level
  currentLevel++;
  
  //load next level if it exists
  if (currentLevel < levelData.length)
    {
      //load next level
      buildLevel(currentLevel);
      return true;
    }
  else
    {
      // no more levels
      return false;
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
  let buffer = 25 * progScale; //pixel buffer around edge of sketch
  let uiHeight = 100 * progScale; //height of UI background
  let testWidth = (width-buffer)/cols;
  let testHeight = ((height-buffer) - uiHeight)/rows;
  
  let blockWidth;
  let startX = buffer/2;
  let startY = (buffer/2) + uiHeight;
  
  if (testWidth < testHeight) {
    blockWidth = testWidth;
    startY = ((height - (blockWidth*rows))/2) + uiHeight; //centers level vertically
    //print("Wide");
  }
  else {
    blockWidth = testHeight;
    startX = ((width - (blockWidth*cols))/2); //centers level horizontally
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
            s.fillColor = color(10, 100, 255); //blue
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








