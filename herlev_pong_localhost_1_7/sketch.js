let video;
let poseNet;
let poses = [];

var player1;
var player2;
var ball;
var playing = true;

let ballSpeed = 25;
let playerSpeed = 25;

let modelLoaded = false;

let leftBoarder;
let rightBoarder;

let leftPerson = false;
let rightPerson = false;

let leftNoseX = 0;
let rightNoseX = 0

let leftNoseY = 0;
let rightNoseY = 0;

let mouseMode = false;

let myFont;
let textAlpha = 255;

function preload() {
  myFont = loadFont('VeraMoBd.ttf');
}

function setup() {
  createCanvas(1920, 1080);
  textFont(myFont);

  frameRate(25);
  leftBoarder = width / 6;
  rightBoarder = 5 * width / 6;

  rectMode(CORNER);

  player1 = new Player(leftBoarder + 40, height / 2, color(255, 0, 0));
  player2 = new Player(rightBoarder - 40, height / 2, color(0, 0, 255));
  ball = new Ball();
  ball.init();

  video = createCapture(VIDEO);
  video.size(width, height);

  //change the options to make model run faster
  var options = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'multiple',
    inputResolution: 257,
    multiplier: 0.5,
    quantBytes: 2,
  };

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, options, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  if (modelLoaded) {
    const flippedVideo = ml5.flipImage(video);
    image(flippedVideo, 0, 0, width, height);

    //Middle line
    push();
    stroke(255);
    strokeWeight(3 * 2);
    line(0, height / 2, width, height / 2);
    pop();

    push();
    noStroke();
    rectMode(CORNER);
    fill(0, 255);
    rect(leftBoarder, 0, width - 2 * leftBoarder, height);

    if (leftPerson == false && rightPerson == false) {
      textAlpha += 5;
    } else {
      textAlpha -= 5;
    }

    textAlpha = constrain(textAlpha, 0, 255);
    fill(255, textAlpha);
    textSize(24 * 1.5);

    text("Spil med din krop! \n\n\nStyr battet ved at holde din næse over eller under stregen. \n\n\nJo længere væk fra midten, jo hurtigere går det. \n\n\nFor lav? Så gå tættere på. For høj? Så tag et skridt tilbage.\n\nFørst til fem vinder!", width / 3, height / 5, width / 3, 2 * height / 2);

    fill(255);
    textSize(48 * 2);

    text(player1.points, 30 * 2, 40 * 2);
    text(player2.points, width - 80 * 2, 40 * 2);
    pop();

    if (playing) {
      player1.show();
      player2.show();
      
      
      if (ball.x >= leftBoarder && ball.x <= rightBoarder) { 
        ball.show();
      } 

      if (mouseMode) { //Mouse control for debugging

        if (mouseIsPressed && mouseX < width / 2) {
          player1.mouseMove();
        } else {
          player1.autoMove(ball);
        }

        if (mouseIsPressed && mouseX > width / 2) {
          player2.mouseMove();
        } else {
          player2.autoMove(ball);
        }

      } else { //poseMode

        //Nose control with poseNet
        if (leftPerson) {
          player1.poseMove(leftNoseY);
        } else {
          player1.autoMove(ball);
        }

        if (rightPerson) {
          player2.poseMove(rightNoseY);
        } else {
          player2.autoMove(ball);
        }
      }
      
      //show nose arrows
      push();
      strokeWeight(5);
      let arrowDims = 50 * 2;

      
      let arrowColor;
      let arrowColorAlpha = 200;
      
      if (leftPerson && leftNoseY < height / 2) {
        arrowColor = color(255, 0, 0, arrowColorAlpha);
      } else {
        arrowColor = color(0,0);
      }
      drawArrow(leftBoarder / 2, height/12, 25, arrowColor, false);
      
      
      if (leftPerson && leftNoseY > height / 2) {
        arrowColor = color(255, 0, 0, arrowColorAlpha);
      } else {
        arrowColor = color(0,0);
      }
      drawArrow(leftBoarder / 2, height - height/12, 25, arrowColor, true);

      // right
      if (rightPerson && rightNoseY < height / 2) {
        arrowColor = color(0, 0, 255, arrowColorAlpha);
      } else {
        arrowColor = color(0,0);
      }
      drawArrow(width - leftBoarder / 2, height/12, 25, arrowColor, false);

      if (rightPerson && rightNoseY > height / 2) {
        arrowColor = color(0, 0, 255, arrowColorAlpha);
      } else {
        arrowColor = color(0,0);
      }
      drawArrow(width - leftBoarder / 2, height - height/12, 25, arrowColor, true);
      
      
      //draw all arrows
      
      
      
      
      
      
      
      
      pop();

      ball.move();

      //Collision checks
      ball.collision(player1);
      ball.collision(player2);

      if (ball.x < 0) {
        player2.points++;
        ball.x = width / 2;
      }
      if (ball.x > width) {
        player1.points++;
        ball.x = width / 2;
      }
    }

    if (max(player1.points, player2.points) == 1) {
      playing = false;
      ball.xv = 0;
      showWinner();
    }
    detectNoses();
  }
}

function drawArrow(arrowX, arrowY, dimensions, col, rot) {

  push();
  translate(arrowX, arrowY);
  if (rot) {
    rotate(PI);
  }
  strokeWeight(5);
  stroke(255,100);
  fill(col);
  beginShape();
  vertex(0, 0);
  vertex(4*dimensions, 4*dimensions);
  vertex(3*dimensions, 5*dimensions);
  vertex(1*dimensions, 3*dimensions);
  vertex(1*dimensions, 14*dimensions);
  vertex(-1*dimensions, 14*dimensions);
  vertex(-1*dimensions, 3*dimensions);
  vertex(-3*dimensions, 5*dimensions);
  vertex(-4*dimensions, 4*dimensions);
  endShape(CLOSE);

  pop();

}

function showWinner() {
  push();
  background(0);
  fill(255);
  textSize(24 * 2);
  if (player1.points > player2.points) {

    text("RØD VANDT! \n\n\nTak for spillet!\n\nVil I spille flere spil? I Demoteket ved hovedindgangen har vi både videospil og brætspil", width / 3, height / 5, width / 2, 2 * height / 2);
  } else if (player2.points > player1.points) {
    text("BLÅ VANDT! \n\n\nTak for spillet!\n\nVil I spille flere spil? I Demoteket ved hovedindgangen har vi både videospil og brætspil", width / 3, height / 5, width / 2, 2 * height / 2);
  }
  pop();

  ball.init();
  setTimeout(restartGame, 2000)
}

function restartGame() {
  player2.points = 0;
  player1.points = 0;
  playing = true;
}

// A function to draw ellipses over the detected keypoints
function detectNoses() {
  push();

  leftPerson = false;
  rightPerson = false;

  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    let nose = pose["nose"];

    if (nose.confidence > 0.5) {
      //Calculations are reversed because of the flipped image
      if (nose.x > width - leftBoarder) {
        leftPerson = true;
        leftNoseY = nose.y;
        leftNoseX = width - nose.x
      }

      if (nose.x < leftBoarder) {
        rightPerson = true;
        rightNoseY = nose.y;
        rightNoseX = width - nose.x
      }
    }
  }
  pop();
}


function modelReady() {
  modelLoaded = true;
  console.log("model loaded");
  //select('#status').html('Model Loaded');
}


function mousePressed() {
  fullscreen(true);
}