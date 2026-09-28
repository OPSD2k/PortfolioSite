//n-body planet orbit sim
//Olivier Donker, June 2022
//Sources:
//Processing documentation, The Nature of Code by Daniel Shiffman,
//https://forum.processing.org/two/discussion/25363/startup-focus-not-recognizing-keystrokes-p3-only.html for lines 21 to 23,
//my own previous assignments for this course (especially 4.1 for particles), and some inspiration for the comet surface was taken from https://processing.org/examples/regularpolygon.html

//idea: n objects (planets) orbit around each other. System could end up stable, or unstable, objects can crash into each other. n can be set by user
//There are comets that have a trail of gas behind them
//initial positions of planets is normally distributed
//comets are bumpy/rocky according to Perlin noise
//Additionally, bodies repulse each other when they get very close

//Use the left mouse button to restart the simulation
//Use the right mosue button to toggle body names
//Use the spacebar to pause or unpause the simulation

let celestialBodySystem;
let reset;
let displayBodyNames;  //if I don't make this global, showing/hiding names isn't "saved" between sim resets!
let numberOfBodies;

function setup() {
  createCanvas(windowWidth, windowHeight);
  //auto-focus for 1 second
  //if (millis() < 1000) {
  //  ((java.awt.Canvas) surface.getNative()).requestFocus();
  //}
  //fullScreen();
  //size(1200, 900);

  numberOfBodies = 10;
  celestialBodySystem = new CelestialBodySystem(); //initialise
  celestialBodySystem.spawnBodies(/*number of bodies*/numberOfBodies);  //spawn just once!
  
  frameRate(144);  //for 144hz screen
}

function draw() {
  //initialise everything all over again if simulation is reset
  if (reset) {
    celestialBodySystem = new CelestialBodySystem(); //initialise
    celestialBodySystem.spawnBodies(/*number of bodies*/numberOfBodies);
    reset = false; //return reset to original value
  }

  background(0);
  celestialBodySystem.cycleThroughBodies();
  celestialBodySystem.displayInstructions();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function toggleDisplayBodyNames() {  //seems a tiny bit faster than having this method in the class? The variable it is controlling has to be global anyway
  if (displayBodyNames) {
    displayBodyNames = false;
  } else {  //read: if !displayBodyNames, there is no other option
    displayBodyNames = true;
  }
}

function mousePressed() {
  if (mouseButton == LEFT) {  //left mouse spawns a body
    celestialBodySystem.spawnSingleBody(createVector(mouseX, mouseY));
    //reset = true;
  } 
  else {  //only one other mouse button
    toggleDisplayBodyNames();
  }
}

function keyPressed() {
  if (key == ' ') {  //to pause the sim
    //don't run any update functions, but keep displaying
    celestialBodySystem.togglePause();
  }
  
  if(key == 'r' || key == 'R'){  //r or R resets sim
    reset = true;
  }
}
