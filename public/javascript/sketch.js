let canvas;

let displayState = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container"); //move our canvas inside this HTML element

}

function draw() {
  background(200,200,250);
  
  circle(width/2,height/2,width/6);

}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}