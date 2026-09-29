class CelestialBodySystem {
  constructor() {
    // has no real origin, so no positionVector
    this.bodyList = [];
    this.G = 6.67; // m^3 kg^-1 s^-2, gravitational constant. Can tweak this for more/less attraction if system is too fast/slow

    this.m1PositionVector = createVector();
    this.m2PositionVector = createVector();
    this.distanceVector = createVector();

    this.paused = false;

    this.noiseOffset = 0; // "move" the Perlin noise on each Comet constructor call to keep comets different from one another
    // This is not in the "Comet" class, since I don't want it to reset everytime a new comet object is made
  }

  noiseOffsetGetter() {
    return this.noiseOffset;
  }

  noiseOffsetSetter(passedNoiseOffset) {
    if (passedNoiseOffset > 999) { // keep offset from blowing up
      this.noiseOffset = 0;
    } else {
      this.noiseOffset = passedNoiseOffset;
    }
  }

  spawnBodies(passedNumberOfBodies) {
    // Final demo: Planet with cloud of comets and asteroids. Their initial position is normally distributed
    // main planet
    this.bodyList.push(new CelestialBody(/*mass in kg*/100000, /*radius in px*/20, /*initial pos*/createVector(width / 2, height / 2), /*initial vel*/createVector(0, 0)));

    let moonsSpawnMean = this.bodyList[0].positionVector.x + Math.min(300, width * 0.32); // normal distribution to the right of the planet
    let moonsSpawnSD = Math.min(50, Math.min(width, height) * 0.12);

    // bodies
    for (let i = 0; i < passedNumberOfBodies / 2; i++) {
      let xMoon0 = randomGaussian();
      let xMoon = constrain(xMoon0 * moonsSpawnSD + moonsSpawnMean, 20, width - 20); // normally distribute x

      let yMoon0 = randomGaussian();
      let yMoon = constrain(yMoon0 * moonsSpawnSD + height / 2, 20, height - 20); // normally distribute y with mean half of the screen

      this.bodyList.push(new CelestialBody(/*mass in kg*/10, /*radius in px*/5, /*initial pos*/createVector(xMoon, yMoon), /*initial vel*/createVector(0, -10)));
    }

    // comets
    for (let i = 0; i < passedNumberOfBodies / 2; i++) {
      let xMoon0 = randomGaussian();
      let xMoon = constrain(xMoon0 * moonsSpawnSD + moonsSpawnMean, 20, width - 20); // normally distribute x

      let yMoon0 = randomGaussian();
      let yMoon = constrain(yMoon0 * moonsSpawnSD + height / 2, 20, height - 20); // normally distribute y with mean half of the screen

      this.bodyList.push(new Comet(/*mass in kg*/10, /*radius in px*/5, /*initial pos*/createVector(xMoon, yMoon), /*initial vel*/createVector(0, -10)));
    }
  }

  spawnSingleBody(passedMouse) {
    this.bodyList.push(new CelestialBody(/*mass in kg*/10, /*radius in px*/5, /*initial pos*/passedMouse, /*initial vel*/createVector(0, 10))); // works, and has gravity!
  }

  addGravitationalForce(passedBody) {
    // for every body, loop through the OTHER bodies and add G*(m1+m2)/r^2 to netForceVector, with m1 being mass of that body
    let sumOfGravitationalForces = createVector();

    for (let body of this.bodyList) {
      if (body !== passedBody) { // do nothing if we're comparing a body to itself
        this.m1PositionVector.set(passedBody.positionVector.copy());
        this.m2PositionVector.set(body.positionVector.copy());

        this.distanceVector = p5.Vector.sub(this.m2PositionVector, this.m1PositionVector);
        let rSquared = sq(this.distanceVector.mag());

        let gravitationalForce = createVector();
        gravitationalForce.set(this.distanceVector.copy().normalize()); // find rHat in gravitational force formula (direction of force)

        gravitationalForce.mult(this.G);
        gravitationalForce.mult(passedBody.mass + body.mass);
        gravitationalForce.div(rSquared);

        // if two bodies come close enough, they suddenly experience a very strong repulsion (akin to force between atomic nuclei)
        if (this.distanceVector.mag() < passedBody.radius) {
          gravitationalForce.mult(-3);
          //console.log("repulsion");
        }

        sumOfGravitationalForces.add(gravitationalForce);

        // Finally, add the force
        passedBody.addGravitationalForce(sumOfGravitationalForces); // first vector from first loop goes in (first component), then vector from second loop is ADDED in this method.
      }
    }
  }

  cycleThroughBodies() {
    for (let body of this.bodyList) {
      if (!this.paused) { // only move things when not paused
        body.physicsMove();
        this.addGravitationalForce(body);
      }
      body.display();
    }

    if (displayBodyNames) {
      this.displayBodyNames();
    }
  }

  displayBodyNames() {
    for (let i = 0; i < this.bodyList.length; i++) {
      textSize(14);
      text("body " + i, this.bodyList[i].positionVector.x + this.bodyList[i].radius + 5, this.bodyList[i].positionVector.y + this.bodyList[i].radius + 5);
    }
  }

  displayInstructions() {
    textSize(16);
    text("LMB: spawn a new moon", 30, 50);
    text("RMB: display names", 30, 70);
    text("R: reset simulation", 30, 90);
    text("Space: pause simulation", 30, 110);
  }

  togglePause() {
    this.paused = !this.paused;
  }
}
