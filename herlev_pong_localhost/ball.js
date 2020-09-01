function Ball() {

  this.init = function(_x) {
    this.x = _x;
    this.y = 20;
    this.xv = -ballSpeed;
    this.yv = 0;
    //this.yv = ballSpeed;
  }

  this.show = function() {
    push();
    fill(255);
    ellipse(this.x, this.y, 30, 30);
    pop();
  }

  this.move = function() {
    if (this.y < 1)
      this.yv = ballSpeed;
    if (this.y >= height)
      this.yv = -ballSpeed;
    this.y += this.yv;
    this.x += this.xv;
  }

  this.collision = function(p) {
    var d = dist(this.x, this.y, p.x, p.y);

    //Redone collision
    //left player
    if (this.x <= (player1.x+player1.w/2 ) && this.xv < 0 && this.x < width / 2 && d <= p.h / 2) {
      this.decideBallY(p);
      ball.xv = ballSpeed;
    }

    //right player
    if (this.x >= (player2.x-player2.w/2) && this.xv > 0 && this.x > width / 2 && d <= p.h / 2) {
      this.decideBallY(p);
      ball.xv = -ballSpeed;
    }

    /*
    //left player collision
    if (this.x === p.x && this.x < width / 2 && d <= p.h / 2) {
      this.decideBallY(p);
      ball.xv = ballSpeed;

      //Right player collision
    } else if (this.x === p.x && this.x > width / 2 && d <= p.h / 2) {

      this.decideBallY(p);
      ball.xv = -ballSpeed;
    }

    */
  }

  this.decideBallY = function(p) {
      if (this.y - p.y < 0) {
        this.yv = ballSpeed;
      } else if (this.y - p.y == 0) {
        this.yv = 0;
      } else {
        this.yv = -ballSpeed;
      }
  }
}