/*
  Platformer 1.38
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-24-2021
  
  Changes Made:
  - Added checkpoints to Hard Levels 1 and 2 to make them less unforgiving.
  - On Hard Level 2, added an extra bounce block to make a specific jump more consistent, as sometimes hitting it would be impossible
  - Added an outline for the Player's current spawnpoint. A simple stroke around an invisible rectangle. This will update when a player reaches a checkpoint.
  - New animation during respawn. Respawn indicator slowly becomes less transparent with the same color as player. By the time the player respawns, the fill will be solid, so it looks like the player is coming out from the outline.
  - Player now spawns "dead" so the level can begin with the respawn animation. This will not affect the player's death count
  - Added a new Tutorial Level (inserted as level 8) that showcases Checkpoint Blocks
  

  
  Ideas:
  - a pause button to freeze the game (and timer) and also options to go back to main menu and restart the level. Maybe information regarding the death count and timer could be shown
  - a death counter on the level UI
  - for the particle explosion, the velocity of the player influences the particles velocity
  - For death animation, particles will eventually come back to spawn to reform player?
  - Change collision rules with certain blocks
    - Maybe acitvate Bounc Block when a certain overlap is acheived. Like, the player will bounce on a bounce block, that is inline with the ground, as soon as a single pixel of the player overlaps. This may be left intentionally
  - When the level is built, have rows and groups of blocks be "merged" to become one larger rectangle. This will improve performance as less blocks would need to be compared. It can also prevent poor collision when a player lands between two blocks, or on the corner of a bounce block
  - Add mroe block types, like:
    - Checkpoint Block. When touched, explodes and becomes the new spawnpoint for the player. Color could be Pink
  - Upgrades for the player, like
    - Midair Dash (omni-directional)
    - Double Jump
    These upgrades are temporary per-level and change the color of the player to indicate they are in affect and are usable (change color when used)
  
*/

/*
    Helpful link for inheritance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
    InstanceOf: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
    Object Collision: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    
    Maybe some good information on stopping players from getting stuck between blocks:
    https://stackoverflow.com/questions/3902492/sliding-aabb-collision-getting-stuck-on-edges
    https://www.reddit.com/r/gamedev/comments/1w92dm/2d_collision_detection_and_resolution_solving_the/
    
    DeltaTime may need to be applied twice: https://answers.unity.com/questions/216396/playing-with-gravity.html
    Also: https://www.reddit.com/r/gamemaker/comments/5vvxmr/platformer_gravity_with_delta_time/
    
    Problems to Fix:
    - When finishing a level set and returning to the main menu, the game will crash claiming that "allObjects[i] is undefined" in update loops.
    - When changing progScale to make game larger, wall sliding on the left-side of blocks doesn't work properly. Something must not be implementing it properly.
     TOD TODO TDOODT DTDO DTODO(*&^%$#@#$%^&*&^%$#$%^&)
     Jumping (gravity) seems consistent, but player movement may need to be updated
    This might help with making movement/jumping consistent even during lag:
    https://www.reddit.com/r/gamemaker/comments/6ffh0k/inconsistent_jump_height_using_delta_timing/
    
*/
let TEST = false;
let player;

let tutorialLevels;
let levels;
let hardLevels;
let testLevels;

let completedHard = false;

let currentLevelSet;
let currentLevelSetName = "Null";

let inTutorial = false;

let gameTimer;

//runs actions that may be required before anything it setup() or draw()
function preload()
{
  levels = []; //an array of all the Levels
  tutorialLevels = []; //an array of all the Tutorial Levels
  hardLevels = []; //an array of all the hard Levels
  testLevels = []; //an array of all testing Levels
    
  //Tutorial Levels
  let numLevels = 12; //number of level files to load
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
  
  //Hard Levels
  numLevels = 3; //number of level files to load
  for (let i = 0; i < numLevels; i++)
  {
  hardLevels.push(loadStrings('assets/Hlevel_' + (i+1) + '.txt'));
  }
  
  //test Levels
  numLevels = 4; //number of level files to load
  for (let i = 0; i < numLevels; i++)
  {
  testLevels.push(loadStrings('assets/test_' + (i+1) + '.txt'));
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
  allParticles = [];
  backgroundColor = color(50, 50, 50, 255);
  
  gameTimer = new Timer(0, 0, 0, 0);
        
  //buildLevel1();
  
  //buildLevel(0);
  
  currentLevel = 1;
  //loadNextLevel();
  buildMainMenu();
  //buildLevel(2, hardLevels);
  //buildResultsScreen();

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
  capDeltaSeconds = capDeltaTime / 1000; // milliseconds / 1000 = seconds
  //print("capDeltaTime: " + capDeltaTime + " | capDeltaSeconds: " + capDeltaSeconds);
  //if level is completed, run function
  if (isLevelComplete)
    {
      isLevelComplete = false;
      
      let anotherLevel = loadNextLevel(currentLevelSet);
      
      if (!anotherLevel)
        {
          //freeze timer, since we're done
          gameTimer.stop();
          
          //back to main menu
          buildResultsScreen()
        }
    }
  
  
  //TESTING
  //if (TEST) {print("hello"); print(allObjects); TEST = false;}
  
  
  //print("blocks: " + allBlocks.length);
  //updating GameObjects
  for (let i = 0; i < allObjects.length; i++)
    {
      //print(allObjects[i].getX());
      
      allObjects[i].update();
            
      //if GameObject is set to be destroyed, remove it
      // UNDEFINED shouldn't need to be here, fix it! BandAid fix
      if (allObjects[i] != undefined && allObjects[i].getToDestroy())
        {
          //remove the current object
          allObjects.splice(i, 1);
          
          //subtract 1 from i. Since this object was removed, all future object indexes will be shifted back 1. This will also update length()
          i--;
        }
    }
  //updating particles
  for (let i = 0; i < allParticles.length; i++)
    {
      allParticles[i].update();
      
      //if (i == 0) {print("SPEED -- x: " + allParticles[i].velocity.x + " | y: " + allParticles[i].velocity.y);}
      //if (i == 0) {print("POSITION -- x: " + allParticles[i].getX() + " | y: " + allParticles[i].getY());}
      
      if (allParticles[i].timeAlive >= allParticles[i].maxTime)
        {
          //remove the current particle
          allParticles.splice(i, 1);
          
          //subtract 1 from i. Since this particle was removed, all future particle indexes will be shifted back 1. This will also update length()
          i--;
        }
    }
  //Drawing GameObjects
  for (let i = 0; i < allObjects.length; i++)
    {
      allObjects[i].draw();
    }
  //drawing particles
  for (let i = 0; i < allParticles.length; i++)
    {
      allParticles[i].draw();
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
    currentLevelSet = tutorialLevels; //setting set of levels to load
    currentLevelSetName = "Tutorial"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
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
    currentLevelSet = levels; //setting set of levels to load
    currentLevelSetName = "Normal"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
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
  
  //Hard Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width/2) - w/2;
  y = 600 * progScale;
  let startHardGame = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = hardLevels; //setting set of levels to load
    currentLevelSetName = "Hard"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnHard = new Button(x, y, w, h, startHardGame);
  btnHard.displayText = "Start Hard Game";
  btnHard.strokeWeight = 0;
  btnHard.fillColor = color(255, 100, 100);
  btnHard.hoverColor = color(100, 255, 100);
  btnHard.textSize = 40 * progScale;
  btnHard.textColor = color(0, 0, 0);
  allObjects.push(btnHard);
  
  
  //Secret Test Levels Button
  w = 250 * progScale;
  h = 50 * progScale;
  x = 1000 * progScale;
  y = 875 * progScale;
  let startTestLevels = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = testLevels; //setting set of levels to load
    currentLevelSetName = "Testing"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnTest = new Button(x, y, w, h, startTestLevels);
  btnTest.displayText = "Test Levels";
  btnTest.strokeWeight = 0;
  btnTest.fillColor = backgroundColor;
  btnTest.hoverColor = color(255, 100, 100);
  btnTest.textSize = 30 * progScale;
  btnTest.textColor = backgroundColor;
  btnTest.textHoverColor = color(0, 0, 0);
  allObjects.push(btnTest);
  
}

//draws the main menu to the screen
function buildResultsScreen()
{
  //creating congratulations message
  let x = width/2;
  let y = 100 * progScale;
  let s = "Congratulations!";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 100 * progScale;
  allObjects.push(title);
  
  //creating specific message on level
  x = width/2;
  y = 250 * progScale;
  s = "You completed the\n" + currentLevelSetName + " levels";
  let message = new DisplayText(x, y, 0, 0, s);
  message.textSize = 60 * progScale;
  allObjects.push(message);
  
  let gap = 25 * progScale; //gap between data title and data
  
  //time display  
  x = (width/2) - gap;
  y = 450 * progScale;
  s = "Your Time:";
  let yourTime = new DisplayText(x, y, 0, 0, s);
  yourTime.textAlignH = RIGHT;
  yourTime.textSize = 50 * progScale;
  allObjects.push(yourTime);
  
  gameTimer.setY(y);
  gameTimer.setX((width/2) + gap);
  gameTimer.textSize = 50 * progScale;
  gameTimer.textAlignH = LEFT;
  allObjects.push(gameTimer);
  
  //Death display  
  x = (width/2) - gap;
  y = 550 * progScale;
  s = "Deaths:";
  let yourDeaths = new DisplayText(x, y, 0, 0, s);
  yourDeaths.textAlignH = RIGHT;
  yourDeaths.textSize = 50 * progScale;
  allObjects.push(yourDeaths);
  
  x = (width/2) + gap;
  s = str(numberOfDeaths);
  let numDeaths = new DisplayText(x, y, 0, 0, s);
  numDeaths.textAlignH = LEFT;
  numDeaths.textSize = 50 * progScale;
  allObjects.push(numDeaths);
  
  //Main Menu button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width/2) - w/2;
  y = 800 * progScale;
  let backToMenu = function() {
        TEST = true; //RMOVE THIS LATER
clearGameObjects(); //clearing menu
    gameTimer.reset(); //reseting current time on timer
    numberOfDeaths = 0; //reseting death count
    buildMainMenu(); //building the main menu
  };
  let btnMenu = new Button(x, y, w, h, backToMenu);
  btnMenu.displayText = "Main Menu";
  btnMenu.strokeWeight = 0;
  btnMenu.fillColor = color(255, 255, 0);
  btnMenu.hoverColor = color(0, 255, 0);
  btnMenu.textSize = 60 * progScale;
  btnMenu.textColor = color(0, 0, 0);
  allObjects.push(btnMenu);
  
}

function clearGameObjects()
{
  //resetting arrays to blank arrays
  allObjects = [];
  allBlocks = [];
  allParticles = [];
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
            
            //adjusting x and y based on w being smaller
            x += (blockWidth - w)/2;
            y += (blockWidth - w)/2;
            
            let p = new Player(x,y,w,w);
            allObjects.push(p);
            
            p.fillColor = color(255, 190, 0); //Orange
            p.spawnStrokeColor = color(255, 190, 0); //Orange
            p.spawnFillColor = color(255, 190, 0, 0); //Orange with transparency
            
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
        else if (c == "C") //Checkpoint block
          {
            let x = startX + blockWidth*i;
            let y = startY + blockWidth*j;
            let w = blockWidth;
            
            let s = new CheckpointBlock(x,y,w,w);
            allObjects.push(s);
            allBlocks.push(s);
            
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
  
  //Level Number
  x = width/2;
  y = uiHeight/2;
  s = currentLevelSetName;
  let setName = new DisplayText(x, y, 0, 0, s);
  setName.textSize = 50 * progScale;
  setName.textAlignH = CENTER;
  allObjects.push(setName);
  
  //placing timer
  x = width/1.3;
  y = uiHeight/2;
  gameTimer.setX(x);
  gameTimer.setY(y);
  gameTimer.textSize = 50 * progScale;
  gameTimer.textAlignH = LEFT;
  gameTimer.start();
  allObjects.push(gameTimer);
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








