/*
  Platformer 1.65
  Created By: Lee Thibodeau
  Started: 2-4-2021
  Edited: 3-21-2021
  
  Changes Made:
  - 
  
  
  Ideas:
  - LevelSet object could store a levelSetColor that could be used for various things, like buttons or colored text. May not be intuitive, but maybe it could be. Could also help make function parameters simplier that want a LevelSet objects and a color.
  - Create Easy Levels
  - Create Hard Levels
  - in a local session, store the player's best times and least deaths. Show this maybe on a screen before a game starts
  - Store and display my best times/deaths on a screen before a game start, as something like "Developer Times"
  - Store player's records/progress. Maybe through password or browser memory (cookies?) if possible
    - Find a way to store player data outside of a single browser session. Like the records persist regardless of what URL and session is being used
  - Particle effects for specific interactions
    - Wall-Sliding
  - Add some sort of level-clear animation (timer would be temporarily stopped)
  - Add a "quickStylize" function to some Gameobjects like text and buttons that allows multiple formatting within a single function, like fill colors, strokes, hover colors, etc. to reduce the number of lines taken from variable setting.
  - a death counter on the level UI
  - for the particle explosion, the velocity of the player influences the particles velocity
  - For death animation, particles will eventually come back to spawn to reform player?
  - Change collision rules with certain blocks
    - Maybe acitvate Bounc Block when a certain overlap is acheived. Like, the player will bounce on a bounce block, that is inline with the ground, as soon as a single pixel of the player overlaps. This may be left intentionally
  - When the level is built, have rows and groups of blocks be "merged" to become one larger rectangle. This will improve performance as less blocks would need to be compared. It can also prevent poor collision when a player lands between two blocks, or on the corner of a bounce block
  - Add more block types, like:
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
    https://forums.tigsource.com/index.php?topic=45567.0
    
    DeltaTime may need to be applied twice: https://answers.unity.com/questions/216396/playing-with-gravity.html
    Also: https://www.reddit.com/r/gamemaker/comments/5vvxmr/platformer_gravity_with_delta_time/
    
    information on saving data:
https://stackoverflow.com/questions/58490119/save-read-cookies-in-js

    information on removing scroll-bars on side: https://discourse.processing.org/t/solved-when-maximized-the-background-is-slightly-too-large/6602
    Centering game within Canvas/iframe: https://stackoverflow.com/questions/5127937/how-to-center-canvas-in-html5
    
    How to deep copy a P5.color object: https://discourse.processing.org/t/copying-a-color/12312
    
    How to use Cookies: https://www.w3schools.com/js/js_cookies.asp
    
    more on Local Storage: https://javascript.plainenglish.io/everything-you-need-to-know-about-html5-local-storage-and-session-storage-479c63415c0a
    
    Problems to Fix:
    - Player sometimes gets stuck on the corner between two blocks. This is uncommon but affects gameplay. This could be fixed with an update to the collision detection and/or how blocks are placed.
    - When finishing a level set and returning to the main menu, the game will crash claiming that "allObjects[i] is undefined" in update loops.
    - When changing progScale to make game larger, wall sliding on the left-side of blocks doesn't work properly. Something must not be implementing it properly.
     TOD TODO TDOODT DTDO DTODO(*&^%$#@#$%^&*&^%$#$%^&)
     Jumping (gravity) seems consistent during lag, but player movement may need to be updated
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

let currentLevelSet;
let currentLevelSetName = "Null";

let gameTimer;

let isPaused = false; //whether the game is paused, and thus Update() will be skipped for some gameObjects

//record variables for developer times and death counts
//best times (in milliseconds)
const developerTimeEasy = 1111;
const developerTimeNormal = null;
const developerTimeHard = null;
const developerTimeMaster = 222650; // 3 min, 42 sec, 650 milli
//least deaths
const developerDeathEasy = 1;
const developerDeathNormal = null;
const developerDeathHard = null;
const developerDeathMaster = 127;

//runs actions that may be required before anything in setup() or draw()
function preload() {
  //establishing level sets as LevelSet objects
  tutorialLevels = new LevelSet(); //contains an array of all the Tutorial Levels
  easyLevels = new LevelSet(); //contains an array of all the easy Levels
  normalLevels = new LevelSet(); //contains an array of all the normal Levels
  hardLevels = new LevelSet(); //contains an array of all the hard Levels
  masterLevels = new LevelSet(); //contains an array of all the master Levels
  testLevels = new LevelSet(); //contains an array of all testing Levels
  
  //Loading Level Files:

  //Tutorial Levels
  tutorialLevels.numLevels = 12; //number of level files to load
  for (let i = 0; i < tutorialLevels.numLevels; i++) {
    tutorialLevels.levelData.push(loadStrings('assets/TutorialLevel_' + (i + 1) + '.txt'));
  }

  //Easy Levels
  easyLevels.numLevels = 1; //number of level files to load
  for (let i = 0; i < easyLevels.numLevels; i++) {
    easyLevels.levelData.push(loadStrings('assets/EasyLevel_' + (i + 1) + '.txt'));
  }

  //Normal Levels
  normalLevels.numLevels = 10; //number of level files to load
  for (let i = 0; i < normalLevels.numLevels; i++) {
    normalLevels.levelData.push(loadStrings('assets/NormalLevel_' + (i + 1) + '.txt'));
  }

  //Hard Levels
  hardLevels.numLevels = 1; //number of level files to load
  for (let i = 0; i < hardLevels.numLevels; i++) {
    hardLevels.levelData.push(loadStrings('assets/HardLevel_' + (i + 1) + '.txt'));
  }

  //Master Levels
  masterLevels.numLevels = 3; //number of level files to load
  for (let i = 0; i < masterLevels.numLevels; i++) {
    masterLevels.levelData.push(loadStrings('assets/MasterLevel_' + (i + 1) + '.txt'));
  }

  //Test Levels
  testLevels.numLevels = 5; //number of level files to load
  for (let i = 0; i < testLevels.numLevels; i++) {
    testLevels.levelData.push(loadStrings('assets/TestLevel_' + (i + 1) + '.txt'));
  }

  //loading fonts
  fontRegular = loadFont('assets/pixelmix.ttf');
  fontBold = loadFont('assets/pixelmix_bold.ttf');
  
  //loading records from LocalStorage
    //If any of these don't exist, they will become "null", which is expected
  let easyTimeKey = "bestTimeEasy";
  let easyDeathKey = "bestDeathEasy";
  let normalTimeKey = "bestTimeNormal";
  let normalDeathKey = "bestDeathNormal";
  let hardTimeKey = "bestTimeHard";
  let hardDeathKey = "bestDeathHard";
  let masterTimeKey = "bestTimeMaster";
  let masterDeathKey = "bestDeathMaster";
  
  //save keys to LevelSet objects
  easyLevels.playerBestTimeStorageKey = easyTimeKey;
  easyLevels.playerBestDeathStorageKey = easyDeathKey;
  normalLevels.playerBestTimeStorageKey = normalTimeKey;
  normalLevels.playerBestDeathStorageKey = normalDeathKey;
  hardLevels.playerBestTimeStorageKey = hardTimeKey;
  hardLevels.playerBestDeathStorageKey = hardDeathKey;
  masterLevels.playerBestTimeStorageKey = masterTimeKey;
  masterLevels.playerBestDeathStorageKey = masterDeathKey;
  
  //Best Times (in milliseconds)
  easyLevels.playerBestTime = getItem(easyTimeKey);
  normalLevels.playerBestTime = getItem(normalTimeKey);
  hardLevels.playerBestTime = getItem(hardTimeKey);
  masterLevels.playerBestTime = getItem(masterTimeKey);
  //least deaths
  easyLevels.playerBestDeath = getItem(easyDeathKey);
  normalLevels.playerBestDeath = getItem(normalDeathKey);
  hardLevels.playerBestDeath = getItem(hardDeathKey);
  masterLevels.playerBestDeath = getItem(masterDeathKey);
  //these level sets don't have/store records
  tutorialLevels.allowRecords = false;
  testLevels.allowRecords = false;
}

function setup() {
  //determining canvas width and height, fitting within the aspect ratio we want
  //figure out whether the width or height fills the screen
  let testWidth = sketchWidth / ratioW; //
  let testHeight = sketchHeight / ratioH; //
  let startW = sketchWidth;
  let startH = sketchHeight;
  
  if (testWidth > testHeight) { //actualH stays
    sketchWidth = sketchHeight * (ratioW/ratioH);
    progScale = sketchWidth/baseSketchWidth;
  } else { //actualW stays
    sketchHeight = sketchWidth * (ratioH/ratioW);
    progScale = sketchHeight/baseSketchHeight;
  }
  //progScale = 1/2;
  //print(progScale); // this value should be roughly 1/2 in the P5.js editor
  createCanvas(sketchWidth, sketchHeight); //creating canvas display

  frameRate(60);
  smooth();
  
  disableKeyScrolling();

  //setting initial variables
  allObjects = [];
  allBlocks = [];
  allParticles = [];
  allPauseObjects = [];
  backgroundColor = color(50, 50, 50, 255);
  
  //setting LevelSet names
  tutorialLevels.levelSetName = "Tutorial";
  easyLevels.levelSetName = "Easy";
  normalLevels.levelSetName = "Normal";
  hardLevels.levelSetName = "Hard";
  masterLevels.levelSetName = "Master";
  testLevels.levelSetName = "Test";
  
  //setting developer records for LevelSets
  //Best Times (in milliseconds)
  easyLevels.developerBestTime = developerTimeEasy;
  normalLevels.developerBestTime = developerTimeNormal;
  hardLevels.developerBestTime = developerTimeHard;
  masterLevels.developerBestTime = developerTimeMaster;
  //least deaths
  easyLevels.developerBestDeath = developerDeathEasy;
  normalLevels.developerBestDeath = developerDeathNormal;
  hardLevels.developerBestDeath = developerDeathHard;
  masterLevels.developerBestDeath = developerDeathMaster;

  //creating timer for timing levels
  gameTimer = new Timer(0, 0, 0, 0);
  
  //creating gameObjects for main menu
  //buildMainMenu();

  //DEBUG, load project starting with specific level. Or load a specific screen
  //buildLevel("number of level - 1", "Level Set");
  //buildLevel(0, easyLevels);
  //buildTutorialScreen();
  //buildPauseMenu();
  //buildPreGameMenu(easyLevels, "Easy", color(0, 255, 0), bestTimeEasy, bestDeathEasy);
  
  
  //gameTimer.milliseconds = 111111;
  //numberOfDeaths = 5;
  //masterLevels.playerBestTime = 111110;
  //masterLevels.playerBestDeath = 4;
  
  
  buildResultsScreen(masterLevels);
}

function draw() {
  background(backgroundColor);

  fill(255);

  //reseting mouse cursor to normal arrow
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

      //show player results
      buildResultsScreen(currentLevelSet)
    }
  }

  //testing for keyboard input to pause the game
  if (currentLevelIndex != -1) { // If there is a current Level
    // intial press: if key is down but wan't pressed on previous frame
    if ((keyIsDown(ESCAPE) && !wasESC) || (keyIsDown(ENTER) && !wasEnter)) {
      //check if paused
      if (isPaused) { //unpause the game
        unpauseGame();
      } else { //pause the game
        pauseGame();
      }
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
  } else { //is paused, update pause menu gameObjects
    for (let i = 0; i < allPauseObjects.length; i++) {
      allPauseObjects[i].update();
    }
  }
  //updating particles (but only if not paused)
  if (!isPaused) {
    for (let i = 0; i < allParticles.length; i++) {
      allParticles[i].update();

      if (allParticles[i].timeAlive >= allParticles[i].maxTime) {
        //remove the current particle
        allParticles.splice(i, 1);

        //subtract 1 from i. Since this particle was removed, all future particle indexes will be shifted back 1. This will also update length()
        i--;
      }
    }
  }

  //for testing
  // /dataTime.displayText = "Time: " + gameTimer.displayText; //FOR TESTING

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

  //resetting other keys
  updateKeys();
}

function pauseGame() {
  isPaused = true;
  buildPauseMenu();
}

function unpauseGame() {
  isPaused = false;
  allPauseObjects = []; //clear array of pause gameObjects
}

function mouseClicked() {
  if (mouseButton === LEFT) {
    mouseWasClickedLeft = true;
  }
}

//updates boolean variables for key presses
function updateKeys() {
  if (keyIsDown(ESCAPE)) {
    wasESC = true;
  } else {
    wasESC = false;
  }
  if (keyIsDown(ENTER)) {
    wasEnter = true;
  } else {
    wasEnter = false;
  }
}

function keyPressed() {
  return false; // prevent any default webpage behavior
}

function keyReleased() {
  return false; // prevent any default webpage behavior
}

function keyTyped() {
  return false; // prevent any default webpage behavior
}

function disableKeyScrolling() {
  //borrowed from https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
  window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);
}

//draws the main menu to the screen
function buildMainMenu() {
  //creating Title
  let x = width / 2;
  let y = 150 * progScale;
  let s = "CUBE";
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
  let cEasy = color(0, 255, 0); //green
  let startEasyGame = function() {
    buildPreGameMenu(easyLevels, cEasy);
  };
  let btnEasy = new Button(x, y, w, h, startEasyGame);
  btnEasy.displayText = "Start Easy Game";
  btnEasy.strokeWeight = 0;
  btnEasy.fillColor = cEasy; //green
  btnEasy.hoverColor = color(0, 255 / 2, 0); //darker
  btnEasy.textSize = fontSize;
  btnEasy.textColor = color(0, 0, 0); //black
  btnEasy.textHoverColor = color(255, 255, 255); //white
  allObjects.push(btnEasy);
  btnEasy.isDisabled = false; //Disabled button, cannot be used

  //Normal Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) + (buffer * progScale);
  y = 450 * progScale;
  cNormal = color(255, 255, 0); //Yellow
  let startNormalGame = function() {
    buildPreGameMenu(normalLevels, cNormal);
  };
  let btnNormal = new Button(x, y, w, h, startNormalGame);
  btnNormal.displayText = "Start Normal Game";
  btnNormal.strokeWeight = 0;
  btnNormal.fillColor = cNormal; //Yellow
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
  cHard = color(255, 100, 100); //Red
  let startHardGame = function() {
    buildPreGameMenu(hardLevels, cHard);
  };
  let btnHard = new Button(x, y, w, h, startHardGame);
  btnHard.displayText = "Start Hard Game";
  btnHard.strokeWeight = 0;
  btnHard.fillColor = cHard; //Red
  btnHard.hoverColor = color(255 / 2, 100 / 2, 100 / 2); //darker
  btnHard.textSize = fontSize;
  btnHard.textColor = color(0, 0, 0); //black
  btnHard.textHoverColor = color(255, 255, 255); //White
  allObjects.push(btnHard);
  btnHard.isDisabled = true; //Disabled button, cannot be used

  //Master Game button
  w = 475 * progScale;
  h = 100 * progScale;
  x = (width / 2) + (buffer * progScale);
  y = 600 * progScale;
  cMaster = color(255, 0, 255); //Purple
  let startMasterGame = function() {
    buildPreGameMenu(masterLevels, cMaster);
  };
  let btnMaster = new Button(x, y, w, h, startMasterGame);
  btnMaster.displayText = "Start Master Game";
  btnMaster.strokeWeight = 0;
  btnMaster.fillColor = cMaster; //Purple
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
  
  //Created By message
  x = width / 2;
  y = 925 * progScale;
  s = "Created and Programmed by Lee Thibodeau ©2021";
  let createdBy = new DisplayText(x, y, 0, 0, s);
  createdBy.textSize = 20 * progScale;
  allObjects.push(createdBy);
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
  y = 400 * progScale;
  s = "You can wall-jump\nby pressing jump\nwhile on a wall";
  let textWallJump = new DisplayText(x, y, 0, 0, s);
  textWallJump.textSize = 30 * progScale;
  allObjects.push(textWallJump);
  
  //Pause message
  x = width / 1.33;
  y = 525 * progScale;
  s = "Press ESC or ENTER\nto Pause the game";
  let pauseMessage = new DisplayText(x, y, 0, 0, s);
  pauseMessage.textSize = 25 * progScale;
  pauseMessage.textAlignH = CENTER;
  allObjects.push(pauseMessage);


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
  x = width / 2 - w / 2;
  y = y - w - ((w / 0.75) * 0.75 / 2);

  //adjusting x and y based on w being smaller
  //x += ((w / 0.75) - w) / 2;
  //y += ((w / 0.75) - w) / 2;

  let p = new Player(x, y, w, w);
  allObjects.push(p);
  p.fillColor = color(255, 190, 0); //Orange
  p.spawnStrokeColor = color(255, 190, 0); //Orange
  p.spawnFillColor = color(255, 190, 0, 0); //Orange with transparency
  p.setStrokeWeight(0);

  
  //Continue message
  x = width/2;
  y = 775 * progScale;
  s = "Click this Button to continue";
  let continueMessage = new DisplayText(x, y, 0, 0, s);
  continueMessage.textSize = 25 * progScale;
  continueMessage.textAlignH = CENTER;
  allObjects.push(continueMessage);
  
  //tutorial button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) - w / 2;
  y = 800 * progScale;
  let startTutorial = function() {
    clearGameObjects(); //clearing menu
    currentLevelSet = tutorialLevels; //setting set of levels to load
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    numberOfDeaths = 0; //so practice deaths don't count
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
  //Buttons: Quit Game + Resume Game + Respawn
  //Extra: Background half-transparent rectangle to cover level

  //we use allPauseObjects[] to store the pause menu items

  //setting isPaused to true
  isPaused = true;

  //background
  //using a Block since it will have the same effect
  let bac = new Block(0, 0, width, height);
  allPauseObjects.push(bac);
  bac.setStrokeWeight(0);
  let a = 255 / 1.15; // some transparency dulls out level
  let c = color(backgroundColor.levels); //same as background color...
  c.setAlpha(a); //...but with transparency
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
  s = "" + currentLevelSet.levelSetName + " — Level " + currentLevel;
  let levelInfo = new DisplayText(x, y, 0, 0, s);
  levelInfo.textSize = 60 * progScale;
  allPauseObjects.push(levelInfo);

  //Time Data
  x = width / 2;
  y = 450 * progScale;
  s = "Time: " + gameTimer.displayText;
  let dataTime = new DisplayText(x, y, 0, 0, s);
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
  
  //Respawn (Retry) button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) - w/2;
  y = 650 * progScale;
  let respawnPlayer = function() {
    player.death(); //this will reset the player, at the cost of a death
    unpauseGame(); //resume the game
  };
  let btnRespawnPlayer = new Button(x, y, w, h, respawnPlayer);
  btnRespawnPlayer.displayText = "Respawn";
  btnRespawnPlayer.strokeWeight = 0;
  btnRespawnPlayer.fillColor = color(255, 255, 0); //yellow
  btnRespawnPlayer.hoverColor = color(255 / 2, 255/2, 0); //darker
  btnRespawnPlayer.textSize = 45 * progScale;
  btnRespawnPlayer.textColor = color(0, 0, 0);
  allPauseObjects.push(btnRespawnPlayer);
  //if player is currently dead (or doesn't exist), disable button
  if (player == undefined || player.isDead) {btnRespawnPlayer.isDisabled = true;}
  
  //Respawn information
  x = width / 2;
  y = 625 * progScale;
  s = "This will count as a death";
  let respawnInfo = new DisplayText(x, y, 0, 0, s);
  respawnInfo.textSize = 25 * progScale;
  allPauseObjects.push(respawnInfo);

  //Quit Game (Main Menu) button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) - w - buffer;
  y = 800 * progScale;
  let quitGame = function() {
    clearGameObjects(); //clearing menu
    gameTimer.reset(); //reseting current time on timer
    numberOfDeaths = 0; //reseting death count
    unpauseGame(); //unpause the game
    currentLevelIndex = -1; //reseting index to indicate no level loaded
    buildMainMenu(); //building the main menu
  };
  let btnQuitGame = new Button(x, y, w, h, quitGame);
  btnQuitGame.displayText = "Main Menu";
  btnQuitGame.strokeWeight = 0;
  btnQuitGame.fillColor = color(255, 0, 0); //red
  btnQuitGame.hoverColor = color(255 / 2, 0, 0); //darker
  btnQuitGame.textSize = 45 * progScale;
  btnQuitGame.textColor = color(0, 0, 0);
  allPauseObjects.push(btnQuitGame);

  //Resume Game button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) + buffer;
  y = 800 * progScale;
  let resumeGame = function() {
    unpauseGame(); //unpause the game
  };
  let btnResumeGame = new Button(x, y, w, h, resumeGame);
  btnResumeGame.displayText = "Resume Game";
  btnResumeGame.strokeWeight = 0;
  btnResumeGame.fillColor = color(0, 255, 0); //green
  btnResumeGame.hoverColor = color(0, 255 / 2, 0); //darker
  btnResumeGame.textSize = 45 * progScale;
  btnResumeGame.textColor = color(0, 0, 0);
  allPauseObjects.push(btnResumeGame);
}

//Displays level stats before starting. Acts like a pause menu 
function buildPreGameMenu(levelSet, levelColor) {
  //setting isPaused to true
  isPaused = true;
  
  //background
  //using a Block since it will have the same effect
  let bac = new Block(0, 0, width, height);
  allPauseObjects.push(bac);
  bac.setStrokeWeight(0);
  let a = 255 / 1.15; // some transparency dulls out level
  let c = color(backgroundColor.levels); //same as background color...
  c.setAlpha(a); //...but with transparency
  bac.setFillColor(c);

  //Level Set title
  let x = width / 2;
  let y = 100 * progScale;
  let s = levelSet.levelSetName + " Level Set";
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 100 * progScale;
  title.textColor = levelColor;
  allPauseObjects.push(title);

  //Records Display
  x = width / 2;
  y = 300 * progScale;
  s = "Records:";
  let textRecords = new DisplayText(x, y, 0, 0, s);
  textRecords.textSize = 60 * progScale;
  allPauseObjects.push(textRecords);

  //determing if records exists
  if (levelSet.playerBestTime != null && levelSet.playerBestDeath != null) { //if a record exists = player has cleared this level set before
    //pull data from records
    
    //Time Data
    x = width / 2;
    y = 450 * progScale;
    let t = new Timer(0, 0, 0, 0);
    t.milliseconds = levelSet.playerBestTime; //bestTime is in milliseconds
    t.update(); //this will update the display for the timer
    s = "Time: " + t.displayText;
    let dataTime = new DisplayText(x, y, 0, 0, s);
    dataTime.textSize = 50 * progScale;
    allPauseObjects.push(dataTime);

    //Death Data
    x = width / 2;
    y = 525 * progScale;
    s = "Deaths: " + levelSet.playerBestDeath;
    dataDeaths = new DisplayText(x, y, 0, 0, s);
    dataDeaths.textSize = 50 * progScale;
    allPauseObjects.push(dataDeaths);
  } else { //no record exists = player hasn't cleared this level set
    //showing blank data
    
    //Time Data
    x = width / 2;
    y = 450 * progScale;
    s = "Time: --:--:---";
    let dataTime = new DisplayText(x, y, 0, 0, s);
    dataTime.textSize = 50 * progScale;
    allPauseObjects.push(dataTime);

    //Death Data
    x = width / 2;
    y = 525 * progScale;
    s = "Deaths: --";
    dataDeaths = new DisplayText(x, y, 0, 0, s);
    dataDeaths.textSize = 50 * progScale;
    allPauseObjects.push(dataDeaths);
  }
  
  //Buttons
  let buffer = 100 * progScale;

  //Go Back button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) - w - buffer;
  y = 800 * progScale;
  let goBack = function() {
    //simply unpause the game
    unpauseGame();
  };
  let btnGoBack = new Button(x, y, w, h, goBack);
  btnGoBack.displayText = "Go Back";
  btnGoBack.strokeWeight = 0;
  btnGoBack.fillColor = color(255, 0, 0); //red
  btnGoBack.hoverColor = color(255 / 2, 0, 0); //darker
  btnGoBack.textSize = 45 * progScale;
  btnGoBack.textColor = color(0, 0, 0);
  allPauseObjects.push(btnGoBack);

  //Start Game button
  w = 400 * progScale;
  h = 75 * progScale;
  x = (width / 2) + buffer;
  y = 800 * progScale;
  let startGame = function() {
    //unpause the game
    unpauseGame();
    //start the game with the given levelSet
    clearGameObjects(); //clearing menu
    currentLevelSet = levelSet; //setting set of levels to load
    currentLevel = 1; //for display
    currentLevelIndex = 0; //for level indexing
    gameTimer.reset(); //reseting current time on timer
    buildLevel(currentLevelIndex, currentLevelSet); //starting level
  };
  let btnStartGame = new Button(x, y, w, h, startGame);
  btnStartGame.displayText = "Start Game";
  btnStartGame.strokeWeight = 0;
  btnStartGame.fillColor = color(0, 255, 0); //green
  btnStartGame.hoverColor = color(0, 255 / 2, 0); //darker
  btnStartGame.textSize = 45 * progScale;
  btnStartGame.textColor = color(0, 0, 0);
  allPauseObjects.push(btnStartGame);
}

//draws the main menu to the screen
function buildResultsScreen(levelSet) {
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
  s = "You completed the\n" + levelSet.levelSetName + " levels";
  let message = new DisplayText(x, y, 0, 0, s);
  message.textSize = 60 * progScale;
  allObjects.push(message);

  let gap = 25 * progScale; //gap between data title and data

  //time display  
  x = (width / 2) - gap;
  y = 400 * progScale;
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
  y = 475 * progScale;
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
  
  //displaying previous records, but only if they are enabled
  if (levelSet.allowRecords)
  {
    let fontSize = 40;

    //player records
    x = width / 4;
    y = 600 * progScale;
    s = "Your record:";
    previousText = new DisplayText(x, y, 0, 0, s);
    previousText.textSize = fontSize * progScale;
    previousText.textFont = fontBold
    allObjects.push(previousText);

    //determing if records exists
    if (levelSet.playerBestTime != null && levelSet.playerBestDeath != null) { //if a record exists = player has cleared this level set before
      //pull data from records

      //Time Data
      y = 650 * progScale;
      let t = new Timer(0, 0, 0, 0);
      t.milliseconds = levelSet.playerBestTime; //bestTime is in milliseconds
      t.update(); //this will update the display for the timer
      s = "Best Time: " + t.displayText;
      let dataTime = new DisplayText(x, y, 0, 0, s);
      dataTime.textSize = fontSize * progScale;
      allObjects.push(dataTime);

      //Death Data
      y = 750 * progScale;
      s = "Best Deaths: " + levelSet.playerBestDeath;
      dataDeaths = new DisplayText(x, y, 0, 0, s);
      dataDeaths.textSize = fontSize * progScale;
      allObjects.push(dataDeaths);
    } else { //no record exists = player hasn't cleared this level set
      //showing blank data

      //Time Data
      y = 650 * progScale;
      s = "Best Time: --:--:---";
      let dataTime = new DisplayText(x, y, 0, 0, s);
      dataTime.textSize = fontSize * progScale;
      allObjects.push(dataTime);

      //Death Data
      y = 750 * progScale;
      s = "Best Deaths: --";
      dataDeaths = new DisplayText(x, y, 0, 0, s);
      dataDeaths.textSize = fontSize * progScale;
      allObjects.push(dataDeaths);
    }
    
    //Develop;er records
    x = (width / 2) + (width / 4);
    y = 600 * progScale;
    s = "Creator record:";
    developerText = new DisplayText(x, y, 0, 0, s);
    developerText.textSize = fontSize * progScale;
    developerText.textFont = fontBold
    allObjects.push(developerText);

    //determing if records exists
    if (levelSet.developerBestTime != null && levelSet.developerBestDeath != null) { //if a record exists = player has cleared this level set before
      //pull data from records

      //Time Data
      y = 650 * progScale;
      let t = new Timer(0, 0, 0, 0);
      t.milliseconds = levelSet.developerBestTime; //bestTime is in milliseconds
      t.update(); //this will update the display for the timer
      s = "Best Time: " + t.displayText;
      let dataTime = new DisplayText(x, y, 0, 0, s);
      dataTime.textSize = fontSize * progScale;
      allObjects.push(dataTime);

      //Death Data
      y = 750 * progScale;
      s = "Best Deaths: " + levelSet.developerBestDeath;
      dataDeaths = new DisplayText(x, y, 0, 0, s);
      dataDeaths.textSize = fontSize * progScale;
      allObjects.push(dataDeaths);
    } else { //no record exists = player hasn't cleared this level set
      //showing blank data

      //Time Data
      y = 650 * progScale;
      s = "Best Time: --:--:---";
      let dataTime = new DisplayText(x, y, 0, 0, s);
      dataTime.textSize = fontSize * progScale;
      allObjects.push(dataTime);

      //Death Data
      y = 750 * progScale;
      s = "Best Deaths: --";
      dataDeaths = new DisplayText(x, y, 0, 0, s);
      dataDeaths.textSize = fontSize * progScale;
      allObjects.push(dataDeaths);
    }

    //Checking if current record is better than previous
    let recordWasSet = false;
    //if a record is null, then make this a new record
    // Record Time
    if (levelSet.playerBestTime == null || gameTimer.milliseconds < levelSet.playerBestTime) { //new record
      recordWasSet = true;
      //set the levelSet's time record to this new record
      levelSet.playerBestTime = gameTimer.milliseconds;
      
      //display "new Record" text
      x = width / 4;
      y = 690 * progScale;
      s = "New Record!";
      recordTimeText = new DisplayText(x, y, 0, 0, s);
      recordTimeText.textSize = fontSize/1.2 * progScale;
      recordTimeText.textFont = fontBold;
      recordTimeText.textColor = color(255, 0, 0); //red
      allObjects.push(recordTimeText);
    }
    // Record Least Deaths
    if (levelSet.playerBestDeath == null || numberOfDeaths < levelSet.playerBestDeath) { //new record
      recordWasSet = true;
      //set the levelSet's death record to this new record
      levelSet.playerBestDeath = numberOfDeaths;
      
      //display "new Record" text
      x = width / 4;
      y = 790 * progScale;
      s = "New Record!";
      recordDeathText = new DisplayText(x, y, 0, 0, s);
      recordDeathText.textSize = fontSize/1.2 * progScale;
      recordDeathText.textFont = fontBold;
      recordDeathText.textColor = color(255, 0, 0); //red
      allObjects.push(recordDeathText);
    }
    
    //If current record is better than developer record, show special message
    // Record Time
    if (levelSet.playerBestTime < levelSet.developerBestTime) { //beat developer
      //display "Wow, You Beat It!" text
      x = (width / 2) + (width / 4);
      y = 690 * progScale;
      s = "Wow, You Beat It!";
      devTimeText = new DisplayText(x, y, 0, 0, s);
      devTimeText.textSize = fontSize/1.2 * progScale;
      devTimeText.textFont = fontBold;
      devTimeText.textColor = color(255, 0, 0); //red
      allObjects.push(devTimeText);
    }
    // Record Least Deaths
    if (levelSet.playerBestDeath < levelSet.developerBestDeath) { //beat developer
      //display "Wow, You Beat It!" text
      x = (width / 2) + (width / 4);
      y = 790 * progScale;
      s = "Wow, You Beat It!";
      devDeathText = new DisplayText(x, y, 0, 0, s);
      devDeathText.textSize = fontSize/1.2 * progScale;
      devDeathText.textFont = fontBold;
      devDeathText.textColor = color(255, 0, 0); //red
      allObjects.push(devDeathText);
    }
    
    //updating records in Local Storage
      //Even if only one record was set, this shouldn't affect any other records that stayed the same
    if (recordWasSet)
      {
        levelSet.updateLocalStorage();
      }

  }

  //Main Menu button
  w = 375 * progScale;
  h = 85 * progScale;
  x = (width / 2) - w / 2;
  y = 850 * progScale;
  let backToMenu = function() {
    clearGameObjects(); //clearing menu
    gameTimer.reset(); //reseting current time on timer
    numberOfDeaths = 0; //reseting death count
    currentLevelIndex = -1; //reseting index to indicate no level loaded
    buildMainMenu(); //building the main menu
  };
  let btnMenu = new Button(x, y, w, h, backToMenu);
  btnMenu.displayText = "Main Menu";
  btnMenu.strokeWeight = 0;
  btnMenu.fillColor = color(255, 255, 0);
  btnMenu.hoverColor = color(0, 255, 0);
  btnMenu.textSize = 50 * progScale;
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
  if (currentLevelIndex < levelSet.numLevels) {
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
  let level = levelSet.levelData[levelIndex];

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
        player = p; //linking player to variable outside scope

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
  buildLevelUI(levelIndex, levelSet, uiHeight);
}

function buildLevelUI(levelIndex, levelSet, uiHeight) {
  //Pause message
  let x = uiHeight / 7;
  let y = uiHeight / 2;
  let s = "Press ESC\nor ENTER\nto Pause";
  let pauseMessage = new DisplayText(x, y, 0, 0, s);
  pauseMessage.textSize = 20 * progScale;
  pauseMessage.textAlignH = LEFT;
  allObjects.push(pauseMessage);
  
  //Level Number
  x = width / 7;
  y = uiHeight / 2;
  s = "Level " + (levelIndex + 1);
  let title = new DisplayText(x, y, 0, 0, s);
  title.textSize = 40 * progScale;
  title.textAlignH = LEFT;
  allObjects.push(title);

  //Level Set Name
  x = width / 1.9;
  y = uiHeight / 2;
  s = levelSet.levelSetName;
  let setName = new DisplayText(x, y, 0, 0, s);
  setName.textSize = 40 * progScale;
  setName.textAlignH = CENTER;
  allObjects.push(setName);

  //placing timer
  x = width / 1.3;
  y = uiHeight / 2;
  gameTimer.setX(x);
  gameTimer.setY(y);
  gameTimer.textSize = 40 * progScale;
  gameTimer.textAlignH = LEFT;
  gameTimer.start();
  allObjects.push(gameTimer);
}

//merges groups of blocks near each other into single rectangles
function mergeBlocks() {
  //uses allBlocks[]
  // THis funciton still needs to be implemented if I ever get to it/need it
}

//activates 1 frame when a keyboard key is pressed down
function keyPressed() {
  if (keyCode === 32) {
    spaceWasPressed = true;
  }
}