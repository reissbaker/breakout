import {
  Engine,
  Actor,
  Color,
  CollisionType,
} from "excalibur";

export default class Paddle extends Actor {
  constructor(args: { x: number, y: number }) {
    const paddleHeight = 20;
    super({
      x: args.x,
      y: args.y - paddleHeight / 2,
      width: 150,
      height: paddleHeight,
      color: Color.Chartreuse,
    });
  }

  override onInitialize() {
    this.body.collisionType = CollisionType.Fixed;
  }

  override onPreUpdate(engine: Engine) {
    const pointerPos = engine.input.pointers.primary.lastWorldPos;
    this.pos.x = clamp(pointerPos.x, this.width / 2, engine.drawWidth - this.width / 2);
  }

  growBy(x: number) {
    const paddleXscale = 1 + x;
    this.scale.x = paddleXscale;
  }
}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}
