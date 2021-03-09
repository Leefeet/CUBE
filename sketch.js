/*
  Platformer 1.42
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 2-26-2021
  
  Changes Made:
  - Removed an extra space in Jumping explanation in Tutorial
  - Added keycode variables for ESC (Escape) and ENTER, usable for a pause screen
  - created isPaused boolean to indicate if the game is paused.
  - started buildPauseMenu() function to place a pause menu over the game level
  - new array, allPauseObjects[], that specifically hold gameObjects of the pause menu. This allows them to be updated separately from the level and easily deleted.
  - New update() and draw() Loops just for allPauseObjects[]. Only run if isPaused = true
  - function clearGameObjects() now also clears out allPauseObjects[]
  - new Function buildPauseMenu() is mostly functional. it implements:
    - a title text saying the game is paused
    - level name and level number
    - The current time and death count
    - Button to Quit Game, which acts identical to the "Main Menu" button on the results screen
    - Button to Resume Game, which destroys the Pause Menu and unpauses the game
    - A slightly transparent block covering the screen to slightly obscure the current level
  - Pause Screen will need to be implemented through buttons


  Ideas:
  - a pause button to freeze the game (and timer) and also options to go back to main menu and restart the level. Maybe information regarding the death count and timer could be shown
  - Add a "quickStylize" function to some Gameobjects like text and buttons that allows multiple formatting within a single function, like fill colors, strokes, hover colors, etc. to reduce the number of lines taken from variable setting.
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
    - Linear Interpolation for respawn animation can be 
     TOD TODO TDOODT DTDO DTODO(*&^%$#@#$%^&*&^%$#$%^&)
     Jumping (gravity) seems consistent, but player movement may need to be updated
    This might help with making movement/jumping consistent even during lag:
    https://www.reddit.com/r/gamemaker/comments/6ffh0k/inconsistent_jump_height_using_delta_timing/
    
*/

let player;

let tutorialLevels;
let easyLevels;
let normalLevels;
let hardLevels;
let masterLevels;
let testLevels;

let completedHard = false;

let currentLevelSet;
let currentLevelSetName = "Null";

let inTutorial = false;

let gameTimer;

let dataTime; //FOR TESTING

let isPaused = false; //whether the game is paused, and thus Update() will be skipped for some gameObjects

//runs actions that may be required before anything it setup() or draw()
function preload() {
  //establishing level sets as arrays
  tutorialLevels = []; //an array of all the Tutorial Levels
  easyLevels = []; //an array of all the easy Levels
  normalLevels = []; //an array of all the normal Levels
  hardLevels = []; //an array of all the hard Levels
  masterLevels = []; //an array of all the master Levels
  testLevels = []; //an array of all testing Levels

  //Loading Level Files:

  //Tutorial Levels
  let numLevels = 12; //number of level files to load
  for (let i = 0; i < numLevels; i++) {
    tutorialLevels.push(loadStrings('assets/TutorialLevel_' + (i + 1) + '.txt'));
  }

  //Easy Levels
  numLevels = 1; //number of level files to load
  for (let i = 0; i < numLevels; i++) {
    easyLevels.push(loadStrings('assets/EasyLevel_' + (i + 1) + '.txt'));
  }

  //Normal Levels
  numLevels = 10; //number of level files to load
  for (let i = 0; i < numLevels; i++) {
    normalLevels.push(loadStrings('assets/NormalLevel_' + (i + 1) + '.txt'));
  }

  //Hard Levels
  numLevels = 1; //number of level files to load
  for (let i = 0; i < numLevels; i++) {
    hardLevels.push(loadStrings('assets/HardLevel_' + (i + 1) + '.txt'));
  }

  //Master Levels
  numLevels = 3; //number of level files to load
  for (let i = 0; i < numLevels; i++) {
    masterLevels.push(loadStrings('assets/MasterLevel_' + (i + 1) + '.txt'));
  }

  //Test Levels
  numLevels = 4; //number of level files to load
  for (let i = 0; i < numLevels; i++) {
    testLevels.push(loadStrings('assets/TestLevel_' + (i + 1) + '.txt'));
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
  allPauseObjects = [];
  backgroundColor = color(50, 50, 50, 255);

  //creating timer for timing levels
  gameTimer = new Timer(0, 0, 0, 0);

  //creating gameObjects for main menu
  //buildMainMenu();

  //DEBUG, load project starting with specific level. Or load a specific screen
  //buildLevel("number of level", "Level Set");
  buildLevel(1, normalLevels);
  //buildTutorialScreen();
  buildPauseMenu();
}

function draw() {
  background(backgroundColor);

  fill(255);

  //reseting mouse cursor
  cursor(ARROW);

  //adjusting deltaTime
  capDeltaTime = deltaTime;
  // cap deltaTime so a frame odesn't skip ahead too far
  if (deltaTime > maxTime) {
    capDeltaTime = maxTime;
  }
  capDeltaSeconds = capDeltaTime / 1000; // milliseconds / 1000 = seconds

  //if level is completed, run function
  if (isLevelComplete) {
    isLevelComplete = false;

    let anotherLevel = loadNextLevel(currentLevelSet);

    if (!anotherLevel) {
      //freeze timer, since we're done
      gameTimer.stop();

      //back to main menu
      buildResultsScreen()
    }
  }

  //updating GameObjects (but only if not paused)
  if (!isPaused) {
    for (let i = 0; i < allObjects.length; i++) {
      allObjects[i].update();

      //if GameObject is set to be destroyed, remove it
      // UNDEFINED shouldn't need to be here, fix it! BandAid fix
      if (allObjects[i] != undefined && allObjects[i].getToDestroy()) {
        //remove the current object
        allObjects.splice(i, 1);

        //subtract 1 from i. Since this object was removed, all future object indexes will be shifted back 1. This will also update length()
        i--;
      }
    }
  }
  else { //is paused, update pause menu gameObjects
    for (let i = 0; i < allPauseObjects.length; i++) {
      allPauseObjects[i].update();
    }
  }
  //updating particles
  for (let i = 0; i < allParticles.length; i++) {
    allParticles[i].update();

    if (allParticles[i].timeAlive >= allParticles[i].maxTime) {
      //remove the current particle
      allParticles.splice(i, 1);

      //subtract 1 from i. Since this particle was removed, all future particle indexes will be shifted back 1. This will also update length()
      i--;
    }
  }
  
  //for testing
  dataTime.displayText = "Time: " + gameTimer.displayText; //FOR TESTING

  //Drawing GameObjects
  for (let i = 0; i < allObjects.length; i++) {
    allObjects[i].draw();
  }

  //drawing particles
  for (let i = 0; i < allParticles.length; i++) {
    allParticles[i].draw();
  }

  //drawing pause menu objects, if pause
  if (isPaused) {
    for (let i = 0; i < allPauseObjects.length; i++) {
      allPauseObjects[i].draw();
  }
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
function buildMainMenu() {
  //creating Title
  let x = width / 2;
  let y = 150 * progScale;
  let s = "Cube";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 200 * progScale;
  allObjects.push(title);

  let buffer = 50 * progScale;

  //tutorial button
  let w = 350 * progScale;
  let h = 75 * progScale;
  x = (width / 2) - w / 2;
  y = 300 * progScale;
  let startTutorial = function() {
    clearGameObjects(); //clearing menu
    buildTutorialScreen(); //showing Tutorial Instructions
  };
  let btnTutorial = new Button(x, y, w, h, startTutorial);
  btnTutorial.displayText = "Play Tutorial";
  btnTutorial.strokeWeight = 0;
  btnTutorial.fillColor = color(0, 255, 255); //light blue
  btnTutorial.hoverColor = color(0, 255 / 2, 255 / 2); //darker
  btnTutorial.textSize = 35 * progScale;
  btnTutorial.textColor = color(0, 0, 0); //black
  btnTutorial.textHoverColor = color(255, 255, 255); //white
  allObjects.push(btnTutorial);

  //general font size for all game buttons
  let fontSize = 35 * progScale;

  //Easy Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) - w - (buffer * progScale);
  y = 450 * progScale;
  let startEasyGame = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = easyLevels; //setting set of levels to load
    currentLevelSetName = "Easy"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnEasy = new Button(x, y, w, h, startEasyGame);
  btnEasy.displayText = "Start Easy Game";
  btnEasy.strokeWeight = 0;
  btnEasy.fillColor = color(0, 255, 0); //green
  btnEasy.hoverColor = color(0, 255 / 2, 0); //darker
  btnEasy.textSize = fontSize;
  btnEasy.textColor = color(0, 0, 0); //black
  btnEasy.textHoverColor = color(255, 255, 255); //white
  allObjects.push(btnEasy);

  //Main Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) + (buffer * progScale);
  y = 450 * progScale;
  let startNormalGame = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = normalLevels; //setting set of levels to load
    currentLevelSetName = "Normal"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnNormal = new Button(x, y, w, h, startNormalGame);
  btnNormal.displayText = "Start Normal Game";
  btnNormal.strokeWeight = 0;
  btnNormal.fillColor = color(255, 255, 0); //Yellow
  btnNormal.hoverColor = color(255 / 2, 255 / 2, 0); //darker
  btnNormal.textSize = fontSize;
  btnNormal.textColor = color(0, 0, 0); //black
  btnNormal.textHoverColor = color(255, 255, 255); //White
  allObjects.push(btnNormal);

  //Hard Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) - w - (buffer * progScale);
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
  btnHard.fillColor = color(255, 100, 100); //Red
  btnHard.hoverColor = color(255 / 2, 100 / 2, 100 / 2); //darker
  btnHard.textSize = fontSize;
  btnHard.textColor = color(0, 0, 0); //black
  btnHard.textHoverColor = color(255, 255, 255); //White
  allObjects.push(btnHard);

  //Master Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) + (buffer * progScale);
  y = 600 * progScale;
  let startMasterGame = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = masterLevels; //setting set of levels to load
    currentLevelSetName = "Master"; //setting name of level set
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnMaster = new Button(x, y, w, h, startMasterGame);
  btnMaster.displayText = "Start Master Game";
  btnMaster.strokeWeight = 0;
  btnMaster.fillColor = color(255, 0, 255); //Purple
  btnMaster.hoverColor = color(255 / 2, 0, 255 / 2); //darker
  btnMaster.textSize = fontSize;
  btnMaster.textColor = color(0, 0, 0); //black
  btnMaster.textHoverColor = color(255, 255, 255); //white
  allObjects.push(btnMaster);


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
  btnTest.fillColor = color(0, 0, 0, 0); //transparent
  btnTest.hoverColor = color(255, 100, 100);
  btnTest.textSize = 30 * progScale;
  btnTest.textColor = color(0, 0, 0, 0); //transparent
  btnTest.textHoverColor = color(0, 0, 0);
  allObjects.push(btnTest);
}

//draw a tutorial screen to explain the controls before the Tutorial Levels
function buildTutorialScreen() {
  //creating tutorial welcome
  let x = width / 2;
  let y = 100 * progScale;
  let s = "Welcome to the Tutorial!";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 70 * progScale;
  allObjects.push(title);

  //Explaining movement

  //sideways movement
  x = width / 2;
  y = 200 * progScale;
  s = "Use these Keyboard Keys for Movement:";
  let textMovement = new DisplayText(x, y, 0, 0, s);
  textMovement.textSize = 45 * progScale;
  allObjects.push(textMovement);

  //sideways movement 2
  x = width / 2;
  y = 275 * progScale;
  s = "A and D  OR  <- and -> Arrow Keys";
  let textAD = new DisplayText(x, y, 0, 0, s);
  textAD.textSize = 45 * progScale;
  textAD.textFont = fontBold;
  allObjects.push(textAD);

  //Jumping
  x = width / 4;
  y = 400 * progScale;
  s = "To Jump, press the:";
  let textjump = new DisplayText(x, y, 0, 0, s);
  textjump.textSize = 45 * progScale;
  allObjects.push(textjump);

  //Jumping 2
  x = width / 4;
  y = 475 * progScale;
  s = "Spacebar";
  let textSpace = new DisplayText(x, y, 0, 0, s);
  textSpace.textSize = 45 * progScale;
  textSpace.textFont = fontBold;
  allObjects.push(textSpace);
  
  //Wall Jumping
  x = width / 1.33;
  y = 450 * progScale;
  s = "You can wall-jump\nby pressing jump\nwhile on a wall";
  let textWallJump = new DisplayText(x, y, 0, 0, s);
  textWallJump.textSize = 30 * progScale;
  allObjects.push(textWallJump);


  //Player and Blocks display
  //Block
  let w = 500 * progScale;
  let h = 50 * progScale;
  x = width / 2 - w / 2;
  y = 700 * progScale;

  let b = new Block(x, y, w, h);
  allObjects.push(b);
  allBlocks.push(b);
  b.setStrokeWeight(0);
  b.setStrokeColor(color(255, 255, 255)); //white stroke

  //Player
  w = h * (0.75);
  x = width/2 - w/2;
  y = y - w - ((w / 0.75) * 0.75/2);

  //adjusting x and y based on w being smaller
  //x += ((w / 0.75) - w) / 2;
  //y += ((w / 0.75) - w) / 2;

  let p = new Player(x, y, w, w);
  allObjects.push(p);
  p.fillColor = color(255, 190, 0); //Orange
  p.spawnStrokeColor = color(255, 190, 0); //Orange
  p.spawnFillColor = color(255, 190, 0, 0); //Orange with transparency
  p.setStrokeWeight(0);

  //tutorial button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) - w / 2;
  y = 800 * progScale;
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
  btnTutorial.displayText = "Let's Try It!";
  btnTutorial.strokeWeight = 0;
  btnTutorial.fillColor = color(0, 255, 255); //light blue
  btnTutorial.hoverColor = color(0, 255 / 2, 255 / 2); //darker
  btnTutorial.textSize = 45 * progScale;
  btnTutorial.textColor = color(0, 0, 0); //black
  btnTutorial.textHoverColor = color(255, 255, 255); //white
  allObjects.push(btnTutorial);

  //About Levels
  x = width / 2;
  y = 912 * progScale;
  s = "The following levels will explain the rest...";
  let textLevels = new DisplayText(x, y, 0, 0, s);
  textLevels.textSize = 30 * progScale;
  allObjects.push(textLevels);
  
}

//draws a pause screen over a game
function buildPauseMenu() {
  //Things to display
    //Title: Game Paused
    //Info: Level Set + Level #
    //Data: Current Time + Death Count
    //Buttons: Quit Game + Resume Game
    //Extra: Background half-transparent rectangle to cover level
  
  //we use allPauseObjects[] to store the pause menu items
  
  //setting isPaused to true
  isPaused = true;
  
  //background
  //using a Block since it will have the same effect
  let bac = new Block(0, 0, width, height);
  allPauseObjects.push(bac);
  bac.setStrokeWeight(0);
  let a = 255/1.15; // some transparency dulls out level
  let c = color(red(backgroundColor), green(backgroundColor), blue(backgroundColor), a); //same as background color, but with transparency
  bac.setFillColor(c);
  
  //Pause Title
  let x = width / 2;
  let y = 100 * progScale;
  let s = "Game Paused";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 100 * progScale;
  allPauseObjects.push(title);
  
  //level information
  x = width / 2;
  y = 300 * progScale;
  s = "" + currentLevelSetName + " — Level " + currentLevel;
  let levelInfo = new DisplayText(x, y, 0, 0, s);
  levelInfo.textSize = 60 * progScale;
  allPauseObjects.push(levelInfo);
  
  //Time Data
  x = width / 2;
  y = 450 * progScale;
  s = "Time: " + gameTimer.displayText;
  dataTime = new DisplayText(x, y, 0, 0, s);
  dataTime.textSize = 50 * progScale;
  allPauseObjects.push(dataTime);
  
  //Death Data
  x = width / 2;
  y = 525 * progScale;
  s = "Deaths: " + numberOfDeaths;
  dataDeaths = new DisplayText(x, y, 0, 0, s);
  dataDeaths.textSize = 50 * progScale;
  allPauseObjects.push(dataDeaths);
  
  //Buttons
  let buffer = 100 * progScale;
  
  //Quit Game (Main Menu) button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) - w - buffer;
  y = 800 * progScale;
  let quitGame = function() {
    clearGameObjects(); //clearing menu
    gameTimer.reset(); //reseting current time on timer
    numberOfDeaths = 0; //reseting death count
    isPaused = false; //unpause the game
    buildMainMenu(); //building the main menu
  };
  let btnQuitGame = new Button(x, y, w, h, quitGame);
  btnQuitGame.displayText = "Quit Game";
  btnQuitGame.strokeWeight = 0;
  btnQuitGame.fillColor = color(255, 0, 0); //red
  btnQuitGame.hoverColor = color(255/2, 0, 0); //darker
  btnQuitGame.textSize = 45 * progScale;
  btnQuitGame.textColor = color(0, 0, 0);
  allPauseObjects.push(btnQuitGame);
  
  //Resume Game button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) + buffer;
  y = 800 * progScale;
  let resumeGame = function() {
    allPauseObjects = []; //clear pause menu objects
    isPaused = false; //unpause the game
  };
  let btnResumeGame = new Button(x, y, w, h, resumeGame);
  btnResumeGame.displayText = "Resume Game";
  btnResumeGame.strokeWeight = 0;
  btnResumeGame.fillColor = color(0, 255, 0); //green
  btnResumeGame.hoverColor = color(0, 255/2, 0); //darker
  btnResumeGame.textSize = 45 * progScale;
  btnResumeGame.textColor = color(0, 0, 0);
  allPauseObjects.push(btnResumeGame);
}

//draws the main menu to the screen
function buildResultsScreen() {
  //creating congratulations message
  let x = width / 2;
  let y = 100 * progScale;
  let s = "Congratulations!";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 100 * progScale;
  allObjects.push(title);

  //creating specific message on level
  x = width / 2;
  y = 250 * progScale;
  s = "You completed the\n" + currentLevelSetName + " levels";
  let message = new DisplayText(x, y, 0, 0, s);
  message.textSize = 60 * progScale;
  allObjects.push(message);

  let gap = 25 * progScale; //gap between data title and data

  //time display  
  x = (width / 2) - gap;
  y = 450 * progScale;
  s = "Your Time:";
  let yourTime = new DisplayText(x, y, 0, 0, s);
  yourTime.textAlignH = RIGHT;
  yourTime.textSize = 50 * progScale;
  allObjects.push(yourTime);

  gameTimer.setY(y);
  gameTimer.setX((width / 2) + gap);
  gameTimer.textSize = 50 * progScale;
  gameTimer.textAlignH = LEFT;
  allObjects.push(gameTimer);

  //Death display  
  x = (width / 2) - gap;
  y = 550 * progScale;
  s = "Deaths:";
  let yourDeaths = new DisplayText(x, y, 0, 0, s);
  yourDeaths.textAlignH = RIGHT;
  yourDeaths.textSize = 50 * progScale;
  allObjects.push(yourDeaths);

  x = (width / 2) + gap;
  s = str(numberOfDeaths);
  let numDeaths = new DisplayText(x, y, 0, 0, s);
  numDeaths.textAlignH = LEFT;
  numDeaths.textSize = 50 * progScale;
  allObjects.push(numDeaths);

  //Main Menu button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) - w / 2;
  y = 800 * progScale;
  let backToMenu = function() {
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

function clearGameObjects() {
  //resetting arrays to blank arrays
  allObjects = [];
  allBlocks = [];
  allParticles = [];
  allPauseObjects = [];
}

//function called when level is complete, will load next level
function loadNextLevel(levelSet) {
  //first, delete everything
  clearGameObjects();

  //increment level display
  currentLevel++;
  //increment level index
  currentLevelIndex++;

  //load next level if it exists
  if (currentLevelIndex < levelSet.length) {
    //load next level
    buildLevel(currentLevelIndex, levelSet);
    return true;
  } else {
    // no more levels
    return false;
  }
}

//builds a specific level from a provided data[] array of levels
function buildLevel(levelIndex, levelSet) {
  let level = levelSet[levelIndex];

  //DEBUG: prints contents of level to console
  //print(level);

  //determining level block row and column number
  let rows = level.length;
  let cols = level[0].length;

  //DEBUG: prints the number of rows and columns to the console
  //print("rows: " + rows + " | columns: " + cols);

  //we can determine block widths based on sketch size
  //determine whether the level is wider or taller
  let buffer = 25 * progScale; //pixel buffer around edge of sketch
  let uiHeight = 100 * progScale; //height of UI background
  let testWidth = (width - buffer) / cols;
  let testHeight = ((height - buffer) - uiHeight) / rows;

  let blockWidth;
  let startX = buffer / 2;
  let startY = (buffer / 2) + uiHeight;

  if (testWidth < testHeight) {
    blockWidth = testWidth;
    startY = ((height - (blockWidth * rows)) / 2) + uiHeight; //centers level vertically
  } else {
    blockWidth = testHeight;
    startX = ((width - (blockWidth * cols)) / 2); //centers level horizontally
  }

  //constructing level
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let c = level[j][i]; //block data on txt

      if (c == '.') // air space, so skip
      {
        continue;
      } else if (c == 'B') //normal block
      {
        let x = startX + blockWidth * i;
        let y = startY + blockWidth * j;
        let w = blockWidth;

        let b = new Block(x, y, w, w);
        allObjects.push(b);
        allBlocks.push(b);

        b.setStrokeWeight(0);
        b.setStrokeColor(color(255, 255, 255)); //white stroke
      } else if (c == 'P') // player
      {
        let x = startX + blockWidth * i;
        let y = startY + blockWidth * j;
        let w = blockWidth * 0.75;

        //adjusting x and y based on w being smaller
        x += (blockWidth - w) / 2;
        y += (blockWidth - w) / 2;

        let p = new Player(x, y, w, w);
        allObjects.push(p);

        p.fillColor = color(255, 190, 0); //Orange
        p.spawnStrokeColor = color(255, 190, 0); //Orange
        p.spawnFillColor = color(255, 190, 0, 0); //Orange with transparency

        p.setStrokeWeight(0);
      } else if (c == "K") //kill block
      {
        let x = startX + blockWidth * i;
        let y = startY + blockWidth * j;
        let w = blockWidth;

        let k = new Block(x, y, w, w);
        allObjects.push(k);
        allBlocks.push(k);

        k.setBlockType(BlockType.kill);
        k.fillColor = color(255, 0, 0); //red
        k.setStrokeWeight(0);
      } else if (c == "E") //end block
      {
        let x = startX + blockWidth * i;
        let y = startY + blockWidth * j;
        let w = blockWidth;

        let e = new Block(x, y, w, w);
        allObjects.push(e);
        allBlocks.push(e);

        e.setBlockType(BlockType.end);
        e.fillColor = color(0, 244, 0); //green
        e.setStrokeWeight(0);
      } else if (c == "S") //bounce block
      {
        let x = startX + blockWidth * i;
        let y = startY + blockWidth * j;
        let w = blockWidth;

        let s = new BounceBlock(x, y, w, w);
        allObjects.push(s);
        allBlocks.push(s);

        s.setBlockType(BlockType.bounce);
        s.fillColor = color(10, 100, 255); //blue
        s.setStrokeWeight(0);
      } else if (c == "C") //Checkpoint block
      {
        let x = startX + blockWidth * i;
        let y = startY + blockWidth * j;
        let w = blockWidth;

        let s = new CheckpointBlock(x, y, w, w);
        allObjects.push(s);
        allBlocks.push(s);

        s.setStrokeWeight(0);
      }
    }
  }

  //merge adjacent blocks together
  // TODO: this may be implemented. Currently does nothing
  mergeBlocks();

  //building UI
  buildLevelUI(levelIndex, uiHeight);
}

function buildLevelUI(levelIndex, uiHeight) {
  //Level Number
  let x = uiHeight / 4;
  let y = uiHeight / 2;
  let s = "Level " + (levelIndex + 1);
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 50 * progScale;
  title.textAlignH = LEFT;
  allObjects.push(title);

  //Level Number
  x = width / 2;
  y = uiHeight / 2;
  s = currentLevelSetName;
  let setName = new DisplayText(x, y, 0, 0, s);
  setName.textSize = 50 * progScale;
  setName.textAlignH = CENTER;
  allObjects.push(setName);

  //placing timer
  x = width / 1.3;
  y = uiHeight / 2;
  gameTimer.setX(x);
  gameTimer.setY(y);
  gameTimer.textSize = 50 * progScale;
  gameTimer.textAlignH = LEFT;
  gameTimer.start();
  allObjects.push(gameTimer);
}

//merges groups of blocks near each other into single rectangles
function mergeBlocks() {
  //uses allBlocks[]
  // THis funciton still needs to be implemented if I ever get to it/need it
}


function keyPressed() //activates 1 frame when a keyboard key is pressed down
{
  if (keyCode === 32) {
    spaceWasPressed = true;
  }
}