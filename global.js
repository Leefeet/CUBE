/*
  global.js
  Global variables go here and are accessed by every class
*/

//Sketch Size
const progScale = 1/2; //Scales sketch size. Also scales objects the same
//Expected Aspect Ratio is 4:3
const sketchWidth = 1280 * progScale; //Width of the sketch Canvas
const sketchHeight = 960 * progScale; //Height of the sketch Canvas

let backgroundColor; //the current color of the background

let allObjects; //a collection of all existing GameObjects
let allBlocks; //a collection of all existing Blocks
let allParticles; //a collection of all existing particles. May be used to put particles in front of all objects

let spaceWasPressed = false; //whether the SpaceBar was pressed down


let capDeltaTime; //deltaTime that's been frame capped.
let maxTime = 33; //max time for deltaTime, 33 milliseconds

const keyA = 65;
const keyD = 68;
const keyLeft = 37;
const keyRight = 39;

let currentLevelIndex = 0; //the index number of the level's data
let currentLevel = 0; //the number of the current level the player is on
let isLevelComplete = false; //determines if player finished the level

let mouseWasClickedLeft = false;

let fontRegular, fontBold; //fonts for text. Look Pixelated