function Player(_x, _y, _c) {
  this.x = _x;
  this.y = _y;
  this.v = playerSpeed;
  this.w = 40;
  this.h = 160*2;
  this.points = 0;
  this.fillC = _c;

  this.show = function() {

    push();
    fill(this.fillC);
    rectMode(CENTER);
    rect(this.x,this.y,this.w,this.h)
    pop();
  }

  this.mouseMove = function() {
    if (abs(this.y - mouseY) > this.h / 4) {
      if (this.y < mouseY) {
        this.y += this.v;
      } else if (this.y > mouseY) {
        this.y -= this.v;
      }
    }
    this.y = constrain(this.y, this.h/2,height-this.h/2);
  }

  this.poseMove = function(p) {
    if (p > height/2) {
      this.y += this.v;
    } else {
      this.y -= this.v;
    }
    this.y = constrain(this.y, this.h/2,height-this.h/2);
  }

  this.autoMove = function(b) {
    //if(b.x <= width/2)
    if (b.y < this.y) {
      this.y -= this.v;
    } else if (b.y > this.y) {
      this.y += this.v;
    }
    this.y = constrain(this.y, this.h/2,height-this.h/2);
  }
}