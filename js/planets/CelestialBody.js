class CelestialBody {
  constructor(passedMass, passedRadius, initialPositionVector, initialVelocityVector) {
    this.timeStep = 0.2; // for proper physics. Lower value is more accurate, but slower

    this.positionVector = createVector();
    this.velocityVector = createVector();
    this.accelerationVector = createVector();
    this.netForceVector = createVector();

    this.mass = passedMass;
    this.radius = passedRadius;
    this.positionVector.set(initialPositionVector);   // initialise pos
    this.velocityVector.set(initialVelocityVector);   // initialise vel
    this.accelerationVector = createVector();          // initialise to 0
  }

  physicsMove() {
    this.accelerationVector.set(this.netForceVector);
    this.accelerationVector.div(this.mass); // a = F/m

    this.velocityVector.add(this.accelerationVector.x * this.timeStep, this.accelerationVector.y * this.timeStep);
    this.positionVector.add(this.velocityVector.x * this.timeStep, this.velocityVector.y * this.timeStep);
  }

  display() {
    noStroke();
    fill(200);
    ellipse(this.positionVector.x, this.positionVector.y, 2 * this.radius, 2 * this.radius);
  }

  addGravitationalForce(passedGravitationalForce) {
    this.netForceVector.set(passedGravitationalForce);
  }

  addTestForce(passedTestForce) {
    this.netForceVector.set(passedTestForce);
  }
}
