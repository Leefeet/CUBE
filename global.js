/*
  global.js
  Global variables go here and are accessed by every class
*/

//Sketch Size
const progScale = 1/2; //Scales sketch size. Also scales objects the same
//Expected Aspect Ratio is 4:3
const sketchWidth = 1280 * progScale; //Width of the sketch Canvas
const sketchHeight = 960 * progScale; //Height of the sketch Canvas

const topLeft = [sketchWidth/2, sketchHeight/2]; //The true topLeft of the screen, if using WEBGL since the center is 0,0 for x,y

let currentScene = "menu"; //determines within draw() what functions should be run. this controls whether certain things will be shown, like a main menu or a game level.

let backgroundColor; //the current color of the background

let allObjects; //a collection of all existing GameObjects