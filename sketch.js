/*
  Platformer 1.21
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-16-2021
  
  Changes Made:
  - Added placeholder levels for level_9 and level_10, so Player can finish full game loop
  - Added two new tutorial levels that better show how BounceBlocks work
    - New levels show how high bounce blocks bounce the player and how they can be used sideways
    - New levels take the place of Tlevel_8.txt and Tlevel_9.txt
    - previous levels 8 and 9 became Tlevel_10.txt and Tlevel_11.txt
  - Edited final Tutorial Level to be semi-automatic
  
  Ideas:
  - Death animation for the player where they explode into multiple particles
  - Change collision rules with certain blocks
    - When touching a Blue Bounce BLock, the player will bounce if barely touching on the left but won't when on the right. This is because the order the blocks are checked for collision. I need to either A) always check Bounce Blocks First, B) Check for Bounce Blocks Last, or C) acitvate Bounc Block when a certain overlap is acheived. Any of these will make Bounce Block interactions more consistent
  - When the level is built, have rows and groups of blocks be "merged" to become one larger rectangle. This will improve performance as less blocks would need to be compared.
  - Add mroe block types, like:
    - 
  - Upgrades for the player, like
    - Midair Dash (omni-directional)
    - Double Jump
    These upgrades are temporary per-level and change the color of the player to indicate they are in affect and are usable (change color when used)
  
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    InstanceOf: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    Object Collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    
    Problems to Fix:
    - When changing progScale to make game larger, wall sliding on the left-side of blocks doesn't work properly. Something must not be implementing it properly.
     TOD TODO TDOODT DTDO DTODO(*&^%$#@#$%^&*&^%$#$%^&)
    This might help with making movement/jumping consistent even during lag:
    https://www.reddit.com/r/gamemaker/comments/6ffh0k/inconsistent_jump_height_using_delta_timing/
    
*/

let player;

let tutorialLevels;
let levels;

let currentLevelSet;

let inTutorial = false;

//runs actions that may be required before anything it setup() or draw()
function preload()
{
  levels = []; //an array of all the Levels
  tutorialLevels = []; //an array of all the Tutorial Levels
    
  //Tutorial Levels
  let numLevels = 11; //number of level files to load
  for (let i = 0; i < numLevels; i++)
  {
  tutorialLevels.push(loadStrings('assets/Tlevel_' + (i+1) + '.txt'));
  }
  
  //Regular Levels
  numLevels = 10; //number of level files to load
  for (let i = 0; i < numLevels; i++)
  {
  levels.push(loadStrings('assets/level_' + (i+1) + '.txt'));
  }
  
  //loading fonts
  fontRegular = loadFont('assets/pixelmix.ttf');
  fontBold = loadFont('assets/pixelmix_bold.ttf');
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
  
  currentLevel = 1;
  //loadNextLevel();
  buildMainMenu();
  //buildLevel(0, levels);
}

function draw() {
  background(backgroundColor);

  fill(255);
  
  //reseting mouse cursor
  cursor(ARROW);
  
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
      
      let anotherLevel = loadNextLevel(currentLevelSet);
      
      if (!anotherLevel)
        {
          //back to main menu     //TDOD this should go to a results screen
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
  let s = "Cube";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 200 * progScale;
  allObjects.push(title);
  
  //tutorial button
  let w = 475 * progScale;
  let h = 75 * progScale;
  x = (width/2) - w/2;
  y = 300 * progScale;
  let startTutorial = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = tutorialLevels;
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnTutorial = new Button(x, y, w, h, startTutorial);
  btnTutorial.displayText = "Play Tutorial";
  btnTutorial.strokeWeight = 0;
  btnTutorial.fillColor = color(255, 255, 0);
  btnTutorial.hoverColor = color(0, 255, 0);
  btnTutorial.textSize = 50 * progScale;
  btnTutorial.textColor = color(0, 0, 0);
  allObjects.push(btnTutorial);
  
  //Main Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width/2) - w/2;
  y = 450 * progScale;
  let startGame = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = levels;
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnStart = new Button(x, y, w, h, startGame);
  btnStart.displayText = "Start Game";
  btnStart.strokeWeight = 0;
  btnStart.fillColor = color(255, 255, 0);
  btnStart.hoverColor = color(0, 255, 0);
  btnStart.textSize = 60 * progScale;
  btnStart.textColor = color(0, 0, 0);
  allObjects.push(btnStart);
  
}

function clearGameObjects()
{
  allBlocks.splice(0, allBlocks.length);
  allObjects.splice(0, allObjects.length); //remove all elements starting at the first index for the whole length
}

//function called when level is complete, will load next level
function loadNextLevel(levelSet)
{
  //first, delete everything
  clearGameObjects();
  
  //increment level display
  currentLevel++;
  //increment level index
  currentLevelIndex++;
  
  //load next level if it exists
  if (currentLevelIndex < levelSet.length)
    {
      //load next level
      buildLevel(currentLevelIndex, levelSet);
      return true;
    }
  else
    {
      // no more levels
      return false;
    }
}

//builds a specific level from a provided data[] array of levels
function buildLevel(levelIndex, levelSet)
{
  let level = levelSet[levelIndex];
  
  //prints contents of level
  //print(level);
  
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
  
  //building UI
  //Level Number
  let x = uiHeight/4;
  let y = uiHeight/2;
  let s = "Level " + (levelIndex+1);
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 50 * progScale;
  title.textAlignH = LEFT;
  allObjects.push(title);
}

//merges groups of blocks near each other into single rectangles
function mergeBlocks()
{
  //uses allBlocks[]
  
  
  
}


function keyPressed() //activates 1 frame when a keyboard key is pressed down
{
  if (keyCode === 32)
    {
      spaceWasPressed = true;
    }

  
}








