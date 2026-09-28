class Comet extends CelestialBody { // a comet is a special type of celestial body
  constructor(mass, radius, positionVector, velocityVector) {
    super(mass, radius, positionVector, velocityVector);
    this.cometTail = new GasParticleSystem(); // initialise to prevent errors

    // make a custom, Perlin-noise based bumpy surface for the comet
    // remember that Perlin noise is just a list of numbers. So the idea is, as we "walk" along the circle, the height at any point (radius) will be r = noise(theta)!
    // running all this every time we make a new comet object will ensure that comets differ from each other (since noiseOffset is increased every time this constructor is called)
    this.cometSegments = 20;
    this.cometVertices = []; // store the points instead of a PShape

    let angleStep = TWO_PI / this.cometSegments;
    for (let angle = 0; angle < TWO_PI; angle += angleStep) { // every comet slice will have internal angle 2pi/cometSegments in radians, or 360/cometSegments in degrees
      let ithRadius = radius + 7 * noise(angle + celestialBodySystem.noiseOffsetGetter()) - 2; // circular radius of ith slice, offset by the given comet radius
      // convert to cartesian coords
      let xSegment = ithRadius * cos(angle);
      let ySegment = ithRadius * sin(angle);

      this.cometVertices.push({ x: xSegment, y: ySegment }); // store a new vertex
    }

    celestialBodySystem.noiseOffsetSetter(celestialBodySystem.noiseOffsetGetter() + 8); // to interface with the variable in the "CelestialBodySystem" class neatly
  }

  // everything should be the same in terms of physics and states, but we want to override
  // display to have a different appearance for the comet AND give it a particle system somehow

  display() {
    push();
    translate(this.positionVector.x, this.positionVector.y);
    fill(200);
    noStroke();
    beginShape();
    for (let v of this.cometVertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE); // works beautifully!
    pop();
    this.cometTail.displayParticles();
  }

  generateTail() {
    this.cometTail.spawnParticle();
    this.cometTail.cycleThroughParticles();
  }

  // override physicsMove to include updating the tail to the comet position
  physicsMove() {
    this.generateTail(); // call here in order not to have trouble in main for loop in celestialBodySystem, since normal bodies don't have the generateTail method
    // also call here to prevent updateToBodyPosition from erroring, since otherwise there won't be any particles to move
    this.accelerationVector.set(this.netForceVector);
    this.accelerationVector.div(this.mass); // a = F/m

    this.velocityVector.add(this.accelerationVector.x * this.timeStep, this.accelerationVector.y * this.timeStep);
    this.positionVector.add(this.velocityVector.x * this.timeStep, this.velocityVector.y * this.timeStep);
    this.cometTail.updateToBodyPosition(this.positionVector, this.radius); // pass the comet's position vector and radius to get particle system nicely in the middle
  }
}
