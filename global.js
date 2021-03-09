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
let allPauseObjects; //an array of all pause objects. This will be used to seperately update the pause menu and to delete only the pause menu gameObjects later on


let spaceWasPressed = false; //whether the SpaceBar was pressed down


let capDeltaTime; //deltaTime that's been frame capped.
let maxTime = 33; //max time for deltaTime, 33 milliseconds
let capDeltaSeconds; //capDeltaTime, but in seconds

const keyA = 65; //keyboard code for the A key
const keyD = 68; //keyboard code for the D key
const keyLeft = 37; //keyboard code for the Left Arrow key
const keyRight = 39; //keyboard code for the Right Arrow key

let wasESC = false; //keyboard key ESC was initially pressed
let wasEnter = false; //keyboard key Enter was initially pressed

let currentLevelIndex = -1; //the index number of the level's data
let currentLevel = 0; //the number of the current level the player is on
let isLevelComplete = false; //determines if player finished the level

let mouseWasClickedLeft = false; //boolean, if mouse left click was released on current frame

let fontRegular, fontBold; //fonts for text.

let numberOfDeaths = 0; //the number of deaths the player has suffered. SHould be for within the current level set
