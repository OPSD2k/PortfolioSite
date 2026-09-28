class GasParticleSystem {
  constructor() {
    this.positionVector = createVector(); // system position
    this.particleList = []; // start empty
  }

  updateToBodyPosition(passedBodyPositionVector, passedRadius) {
    this.positionVector.set(passedBodyPositionVector.copy()); // make a copy so as not to change any body's position
    // this.positionVector.add(createVector(passedRadius, passedRadius)); // to get particle system in the middle of the comet (before I made the custom shape)
  }

  spawnParticle() {
    this.particleList.push(new GasParticle(/*initial pos*/this.positionVector, /*initial vel*/createVector(random(-0.7, 0.7), random(-0.7, 0.7)), /*lifeSpan*/255, /*radius*/2)); // to have particles "trail"
  }

  cycleThroughParticles() {
    for (let i = this.particleList.length - 1; i >= 0; i--) { // loop backwards so removal doesn't skip elements
      this.particleList[i].update();
      if (!this.particleList[i].isActive()) { // if particle no longer active
        this.particleList.splice(i, 1); // remove that particle
      }
    }
  }

  displayParticles() { // separate method to keep display when sim paused. Does not seem to hinder performance much
    for (let i = 0; i < this.particleList.length; i++) {
      this.particleList[i].display();
    }
  }
}
