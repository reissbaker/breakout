import {
  Engine,
  Actor,
  Color,
  CollisionType,
  vec,
  ParticleEmitter,
  EmitterType,
  Events,
} from "excalibur";

export default class Ball extends Actor {
  constructor(
    private readonly _radius: number,
    private readonly collisionHandler: (e: Events.CollisionStartEvent) => any,
  ) {
    super({
      radius: _radius,
      x: 100,
      y: 300,
      color: Color.Red,
    });
  }

  override onInitialize() {
    this.body.collisionType = CollisionType.Passive;

    const emitter = new ParticleEmitter({
      beginColor: Color.Red,
      endColor: Color.Blue,
      emitterType: EmitterType.Circle,
      radius: this._radius + 2,
      minVel: 100,
      maxVel: 200,
      minAngle: 0,
      maxAngle: 2 * Math.PI,
      emitRate: 300,
      opacity: 1,
      fadeFlag: true,
      particleLife: 1000,
      maxSize: this._radius + 5,
      minSize: 1,
      isEmitting: true,
    });

    emitter.on("preupdate", () => {
      emitter.pos.x = this.pos.x;
      emitter.pos.y = this.pos.y;
      emitter.beginColor = this.color;
    });

    this.scene.add(emitter);

    setTimeout(() => {
      this.vel = vec(this.speed(), this.speed());
    }, 1000);

    let colliding = false;
    this.on("collisionstart", (ev) => {
      if(colliding) return;
      colliding = true;

      this.collisionHandler(ev);

      // Reverse direction on any collision
      const intersection = ev.contact.mtv.normalize();

      // The largest component of intersection is the direction to flip
      if(Math.abs(intersection.x) > Math.abs(intersection.y)) {
        this.vel.x *= -1;
      }
      else {
        this.vel.y *= -1;
      }

      this.bounceAnim();
    });

    this.on("collisionend", () => {
      colliding = false;
    });
  }

  override onPostUpdate(engine: Engine) {
    if(this.pos.x < this.width / 2) {
      this.vel.x = this.speed();
      this.bounceAnim();
    }

    if(this.pos.x + this.width / 2 > engine.drawWidth) {
      this.vel.x = this.speed() * -1;
      this.bounceAnim();
    }

    if(this.pos.y < this.height / 2) {
      this.vel.y = this.speed();
      this.bounceAnim();
    }
  }

  bounceAnim() {
    const shakeDirection = this.directionUnit(4, true);
    this.scene.camera.shake(shakeDirection.x, shakeDirection.y, 100);
    this.actions.scaleTo(vec(0.5, 0.5), vec(10, 10)).scaleTo(vec(1, 1), vec(10, 10));
    this.color = Color.White;
    this.actions.delay(100).callMethod(() => this.color = Color.Red);
  }

  directionUnit(moveUnit: number, invert: boolean = false) {
    const left = this.vel.x > 0;
    const up = this.vel.y > 0;
    return vec(left !== invert ? moveUnit : -1 * moveUnit, up !== invert ? moveUnit : -1 * moveUnit);
  }

  speed() {
    return 300;
  }
}
