let canvas;

let displayState = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container"); //move our canvas inside this HTML element

}

function draw() {
  background(255);
}

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}