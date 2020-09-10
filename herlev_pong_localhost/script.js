const video = document.getElementById('video')
const URL = "/weights"
//online URL
//const URL = "https://rawgit.com/justadudewhohacks/face-api.js/master/weights";

let faces = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(URL),
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {
      width: 1920, height: 1080,
          frameRate: {
              ideal: 25,
              min: 25
          }
      }
     },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  //const displaySize = { width: video.width, height: video.height }
  const displaySize = { width: 1920, height:1080 }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416 }))
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faces = resizedDetections;    
    //faces = detections;
  }, 200)
})


/////////////////////////////////////////////////////


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

let leftInitBall;
let rightInitBall;

function preload() {
  myFont = loadFont('VeraMoBd.ttf');
}

function setup() {
  createCanvas(1920, 1080);
  textFont(myFont);
  
  if (mouseMode == false) {
   noCursor(); 
  }
  
  frameRate(25);
  leftBoarder = width / 6;
  rightBoarder = 5 * width / 6;
  
  leftInitBall = width/5;
  rightInitBall = 4*width/5;

  rectMode(CORNER);

  player1 = new Player(leftBoarder + 40, height / 2, color("#CC1F2E"));
  player2 = new Player(rightBoarder - 40, height / 2, color(" #22AFCB"));
  ball = new Ball();
  ball.init(rightInitBall);
}

function draw() {
   clear();


   ///////
  //Middle line
  push();
  stroke(10,200,50);
  strokeWeight(5 * 2);
  drawingContext.setLineDash([15, 20]);
  line(12, height / 2, leftBoarder-5, height / 2);
  line(rightBoarder+12, height / 2, width-5, height / 2);
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

  text("Spil med din krop! \n\n\nStyr battet ved at holde din næse over eller under stregen.  \n\n\nFor lav? Så gå tættere på. For høj? Så tag et skridt tilbage.\n\nFørst til fem vinder!", width / 3, height / 5, width / 3, 2 * height / 2);

  fill(255);
  textSize(48 * 2);

  text(player1.points, 30 * 2, 40 * 2);
  text(player2.points, width - 80 * 2, 40 * 2);
  pop();

  if (playing) {
    
    
    if (ball.x >= leftBoarder && ball.x <= rightBoarder) { 
      ball.show();
    } 

    player1.show();
    player2.show();

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
      arrowColor = color(204, 31, 46, arrowColorAlpha);
    } else {
      arrowColor = color(0,0);
    }
    drawArrow(leftBoarder / 2, height/12, 25, arrowColor, false);
    
    
    if (leftPerson && leftNoseY > height / 2) {
      arrowColor = color(204, 31, 46, arrowColorAlpha);
    } else {
      arrowColor = color(0,0);
    }
    drawArrow(leftBoarder / 2, height - height/12, 25, arrowColor, true);

    // right
    if (rightPerson && rightNoseY < height / 2) {
      arrowColor = color(34, 175, 203, arrowColorAlpha);
    } else {
      arrowColor = color(0,0);
    }
    drawArrow(width - leftBoarder / 2, height/12, 25, arrowColor, false);

    if (rightPerson && rightNoseY > height / 2) {
      arrowColor = color(34, 175, 203, arrowColorAlpha);
    } else {
      arrowColor = color(0,0);
    }
    drawArrow(width - leftBoarder / 2, height - height/12, 25, arrowColor, true);
    
    
    pop();

    ball.move();

    //Collision checks
    ball.collision(player1);
    ball.collision(player2);

    if (ball.x < 0) {
      player2.points++;
      ball.x = rightInitBall;
    }
    if (ball.x > width) {
      player1.points++;
      ball.x = leftInitBall;
    }
  }

  if (max(player1.points, player2.points) == 5) {
    playing = false;
    ball.xv = 0;
    showWinner();
  }





  leftPerson = false;
  rightPerson = false;

  ///////
  //the loop
  for (let i = 0; i<faces.length; i++) {

    let noseX = faces[i].box.x + faces[i].box.width/2;
    let noseY = faces[i].box.y + faces[i].box.height/2;

    if (noseX > width - leftBoarder) {
      leftPerson = true;
      leftNoseY = noseY;
      leftNoseX = width - noseX;
    }

    if (noseX < leftBoarder) {
      rightPerson = true;
      rightNoseY = noseY;
      rightNoseX = width - noseX;
    }

    

    //console.log(faces[0])
    //push();
    //noFill();
    //strokeWeight(10);
    //stroke("#CC1F2E");
    //drawCorners(faces[i].box.x, faces[i].box.y, faces[i].box.width, faces[i].box.height, 6);
    //pop();
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
  textSize(24 * 2.5);
  if (player1.points > player2.points) {

    text("RØD VANDT! \n\n\nTak for spillet!\n\nVil I spille flere spil? I Demoteket ved hovedindgangen har vi både videospil og brætspil.", width / 4, height / 5, width / 1.8, 2 * height / 2);
  } else if (player2.points > player1.points) {
    text("BLÅ VANDT! \n\n\nTak for spillet!\n\nVil I spille flere spil? I Demoteket ved hovedindgangen har vi både videospil og brætspil.", width / 4, height / 5, width / 1.8, 2 * height / 2);
  }
  pop();

  ball.init(rightInitBall);
  setTimeout(restartGame, 20000)
}

function restartGame() {
  player2.points = 0;
  player1.points = 0;
  playing = true;
}


function drawCorners(x,y,w,h, fraction) {
 
  push();
  translate(width,0)
  scale(-1,1);

  line(x, y, x, y + h/fraction);
  line(x, y, x + w/fraction, y);
  
  line(x+w, y, x+w - w/fraction, y);
  line(x+w, y, x+w, y + h/fraction);
  
  line(x, y + h, x, y + h - h/fraction);
  line(x, y+h, x + w/fraction, y+h);
  
  line(x + w, y + h, x + w, y + h - h/fraction);
  line(x + w, y+h, x + w - w/fraction, y+h);

  ellipse(x+w/2, y + h/2, 50, 50)

  pop();

}


function mousePressed() {
  //console.log(faces);
  let fs = fullscreen();
  fullscreen(true);
}