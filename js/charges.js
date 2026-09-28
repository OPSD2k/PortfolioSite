//have vectors fall down in rows when clicking portfolio???
//Different idae start rotating the vectors around centre of screen

let canvas;

let chargeList = [];
let epsilon_0;

let evectorsList = []; //empty array
let evectorSystem; //EvectorSystem object
//let transparentMenuBox;

let falling = false;

function windowResized() {
  const oldWindowWidth = width;
  const oldWindowHeight = height;
    resizeCanvas(windowWidth, windowHeight); //keep resizing on resize of window
  evectorSystem.clear(); //remove old field, to prevent extreme slowdown due to loops in generate(). Genius!!
  evectorSystem.generate(windowWidth, windowHeight);

  // If a charge lands outside the window on resize, put it back into the window
  for (let charge of chargeList) {
    charge.handleResize(windowWidth, windowHeight);
  }
  //save old position of field vectors to make less abrupt jump when resising window
  //better yet, keep updating during resize!
  // Calculate the vectors during resizing
  for (let i = 0, len = evectorsList.length; i < len; i++) {
    evectorsList[i].calculate(chargeList.length);
  }

  // Update and display the vectors during resizing
  draw();
}

function setup() {
  const wrapper = document.getElementById('wrapper'); //attach canvas to wrapper div to have it move
  canvas = createCanvas(windowWidth, windowHeight); //to scale canvas to page resize the first time
  //canvas.parent(wrapper);

  epsilon_0 = 2;

  //positive charges
  for (let i = 0; i < 1; i++) {
    chargeList.push(new Charge(random(0, windowWidth), random(0, windowHeight), random(-1, 1), random(-1, 1), 1, 10));
  }

  //negative charges
  for (let i = 0; i < 1; i++) {
    chargeList.push(new Charge(random(0, windowWidth), random(0, windowHeight), random(-1, 1), random(-1, 1), -1, 10));
  }

  evectorSystem = new EvectorSystem();
  evectorSystem.generate(windowWidth, windowHeight);

  //transparentMenuBox = new TransparentMenuBox();

  window.triggerFallingAnimation = triggerFallingAnimation;
}

function draw() {
  background(0);

  const shouldFall = falling;

  for (let i = 0, len = evectorsList.length; i < len; i++) { //display ALL vectors!
    evectorsList[i].display(shouldFall);
    evectorsList[i].calculate(chargeList.length);
    evectorsList[i].update();
  }

  for (let j = 0, len = chargeList.length; j < len; j++) {
    chargeList[j].display();
    chargeList[j].update();
  }
}

function triggerFallingAnimation() {
  evectorsList.forEach((evector, index) => {
    setTimeout(() => {
      evector.startFalling();
    }, evector.fallingDelay);
  });
}





//create two point charges with charge class, they move
//generate electric field between them, new class "Evector" to spawn many arrows across screen to indicate electric field in that point!
//add forces between charges?
// make capacitor plates, charge it to show electric field?
//OR: these static charges and one test charge that follows the electric field they create?

// class TransparentMenuBox {
//   constructor() {
//     this.position = new p5.Vector(windowWidth / 2, windowHeight / 2);
//     this.width = 200;
//     this.height = 200;
//   }
//
//   display() {
//     push(); //push to revert to default rectmode and fill after pop; Not everything should be transparent
//     rectMode(CENTER);
//     noFill();
//     noStroke();
//     //fill(255);
//     rect(this.position.x, this.position.y, this.width, this.height); //works! Now go check if vector origins are in this box. If yes, splice em!
//     pop();
//   }
// }

class Charge { //charge ball
  constructor(passedPositionX, passedPositionY, passedVelocityX, passedVelocityY, passedQ, passedRadius) {
    this.position = new p5.Vector(passedPositionX, passedPositionY);
    this.velocity = new p5.Vector(passedVelocityX, passedVelocityY);
    this.Q = passedQ; //amount of charge of particle
    this.chargeRadius = passedRadius;
    this.falling = false;
    this.acceleration = 0.5;
    this.fallingStartTime = 0;
  }

  display() {
    fill(0, 128, 0);
    ellipse(this.position.x, this.position.y, 2*this.chargeRadius, 2*this.chargeRadius);
  }

  update() {
    //let scaledVelocity = this.velocity.copy();
    //scaledVelocity.mult(deltaTime / 10); // Scale the velocity based on deltaTime, so charge speed is indep. of framerate
    //this.position.add(scaledVelocity); //integrate!
    //this.position.add(this.velocity);

    // if (this.position.x > windowWidth - this.chargeRadius || this.position.x < this.chargeRadius) { //if charge hits edge of screen
    //   this.velocity.x *= -1; //flip velocity
    // }
    //
    // if (this.position.y > windowHeight - this.chargeRadius|| this.position.y < this.chargeRadius) {
    //   this.velocity.y *= -1;
    // }

  const nextPosition = this.position.copy().add(this.velocity);

  if (nextPosition.x > windowWidth - this.chargeRadius || nextPosition.x < this.chargeRadius) {
    this.velocity.x *= -1;
    this.position.x = constrain(this.position.x, this.chargeRadius, windowWidth - this.chargeRadius);
  } else {
    this.position.x = nextPosition.x;
  }

  if (nextPosition.y > windowHeight - this.chargeRadius || nextPosition.y < this.chargeRadius) {
    this.velocity.y *= -1;
    this.position.y = constrain(this.position.y, this.chargeRadius, windowHeight - this.chargeRadius);
  } else {
    this.position.y = nextPosition.y;
  }

    if (this.falling && millis() >= this.fallingStartTime) {
  this.velocity.y += this.acceleration;
  this.position.y += this.velocity.y;
}

 this.updateFalling();
}

  handleResize(windowWidth, windowHeight) {
    if (this.position.x > windowWidth || this.position.x < 0) {
      this.position.x = random(0, windowWidth);
    }

    if (this.position.y > windowHeight || this.position.y < 0) {
      this.position.y = random(0, windowHeight);
    }
  }

  startFalling() {
    this.falling = true;
    this.fallingStartTime = Date.now();
  }

updateFalling() {
  if (!this.falling) {
    evectorsList.forEach((evector) => {
      if (
        evector.falling &&
        Math.abs(this.position.y - evector.position.y) <= 40 / 2 &&
        Date.now() >= evector.fallingStartTime
      ) {
        this.startFalling();
      }
    });
  } else {
    this.velocity.y += this.acceleration;
    this.position.y += this.velocity.y;
  }
}

}

class Evector { //lil vector, repeated across screen
  constructor(passedPositionX, passedPositionY, passedHeading, passedColourR, passedColourG, passedColourB, fallingDelay) {
    this.position = new p5.Vector(passedPositionX, passedPositionY);
    this.velocity = 0;
    this.acceleration = 0.7;
    this.evector = new p5.Vector(); //the actual E vector itself
    this.heading = passedHeading; //in radians
    this.colourR = passedColourR;
    this.colourG = passedColourG;
    this.colourB = passedColourB;
    this.hue = 0;
    this.fallingDelay = fallingDelay;
    this.fallingStartTime = 0;
  }

  startFalling() {
    this.falling = true;
  }

  update() {
    if (this.falling) {
      this.velocity += this.acceleration; //integration #1
      this.position.y += this.velocity; //integration #2
    }
  }

  //the real deal: calculate electric field vector per charge, add them up
  calculate(passedNumberOfCharges) {
    //console.log(passedNumberOfCharges);
    this.evector = new p5.Vector(); //reset evector to zero every loop to prevent accumulation
    for (let i = 0; i < passedNumberOfCharges; i++) { //run through all charges
      this.rVector = (chargeList[i].position.copy()).sub(this.position); //r vector
      //divide by r^2
      this.rVector.div(this.rVector.magSq()); //r hat
      //divide/multiply by the constants
      this.rVector.mult(-chargeList[i].Q) //charge
      this.rVector.div(2 * TWO_PI * epsilon_0); //E vector contribution
      //add contribution to total evector
      this.evector.add(this.rVector);
    }
  }

  display() {
    push();
    noStroke();
    //within push/pop to not affect other shapes
    //map values evector can take to colours. Blue for more negative, red for more positive
    this.hue = map(this.evector.mag(), -0.0005, 0.0005, 260, 0); //map to H in HSB
    colorMode(HSB);
    fill(this.hue, 100, 60); //half value for saturation, an experiment
    translate(this.position.x, this.position.y);
    rotate(this.evector.heading() - HALF_PI); //turn the vector a certain way
    this.arrow(); //to call method in the same class, this. is required!
    pop();
    //show origins
    //ellipse(this.position.x, this.position.y, 10, 10);
  }

  arrow() {
    //hard coded shite, should probably define the arrow properly, geometrically
    rect(-4 / 2, 0, 4, 20); //shift over to have it point radially out of centre point nicely
    push(); //push within push to relatively set the tip of the arrow
    translate(5, 13); //radial length of vector
    rotate(PI / 4); //just a guess
    rect(0, 0, 4, 10);
    pop();
    //other half of tip
    push(); //push within push to relatively set the tip of the arrow
    translate(-7.5, 16); //radial length of vector
    rotate(-PI / 4); //just a guess
    rect(0, 0, 4, 10);
    pop();
  }
}

class EvectorSystem {
  //don't define class variables, initialise them immediately!
  constructor() {
    //nice and linear!! (0, 0) in bottom right corner
    this.gapX = exp(1); //small values make a big difference in pos, large values a small one. Thinking of log and powers...
    this.gapY = exp(1.2);
    this.gapWidth = 220;
    this.gapHeight = 220;
    this.gapWidth = 0.5; //gap width between menu and field
    this.fallSpeed = 5;
  }

  generate(passedWindowWidth, passedWindowHeight) {
    this.vectorsNumberX = passedWindowWidth/40 - 1; //amount of vectors to fit on screen horizontally
    this.vectorsNumberY = passedWindowHeight/40 - 1; //vertically. Both had one too many
    //console.log(this.vectorsNumberX, this.vectorsNumberY);

    for (let j = 0; j < this.vectorsNumberY; j++) {  //was 23, 47
      for (let i = 0; i < this.vectorsNumberX; i++) { //this fills the screen VERY nicely as is
        //(this.vectorsNumberY - j - 1) for delay in falling
        evectorsList.push(new Evector(40 + 40 * i, 30 + 40 * j, (2 * i + j) * PI / 12, 0, 128, 0, (this.vectorsNumberY - j - 1) * 60)); //one Evector every 40 pixels, starting at 30. This will produce a square grid
      }
    }
  }

  clear() { //delete everything in array
    evectorsList.splice(0, evectorsList.length);
  }

  getRowY(rowIndex) {
  return 30 + 40 * rowIndex;
}
}
