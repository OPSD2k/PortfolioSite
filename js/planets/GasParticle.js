class GasParticle {
  // simple, massless gas particles of constant velocity
  constructor(passedPositionVector, passedVelocityVector, passedLifeSpan, passedRadius) { // want this to start at a body's location
    this.positionVector = createVector();
    this.velocityVector = createVector();

    this.positionVector.set(passedPositionVector);
    this.velocityVector.set(passedVelocityVector); // no velocity for testing
    this.lifeSpan = passedLifeSpan;
    this.radius = passedRadius;
  }

  update() {
    this.positionVector.add(this.velocityVector.x * celestialBodySystem.bodyList[0].timeStep, this.velocityVector.y * celestialBodySystem.bodyList[0].timeStep); // no reason to define another time step, should be the same. Just read from other class
    this.lifeSpan *= 0.91; // exponential decay, for fun
  }

  display() {
    stroke(255, this.lifeSpan); // set alpha to lifeSpan so outer edge fades
    fill(255, this.lifeSpan); // same idea
    ellipse(this.positionVector.x, this.positionVector.y, 2 * this.radius, 2 * this.radius);
  }

  isActive() {
    return this.lifeSpan > 10; // particle active if lifeSpan still > 10
  }
}
