import { TransitionTo } from "st4t3";
import {
  ParticleEmitter,
  EmitterType,
  Engine,
  Actor,
  Color,
  CollisionType,
  vec,
  ActionSequence,
  ParallelActions,
} from "excalibur";
import Ball from "../../ball";

type Props = {
  brick: Actor,
  engine: Engine,
  ball: Ball,
  width: number,
  height: number,
};
export default class Dead extends TransitionTo<never, Props> {
  destroy() {}

  override start({ ball, brick, engine, width, height }: Props) {
    brick.body.collisionType = CollisionType.PreventCollision;
    brick.color = Color.White;
    const blink = new ActionSequence(brick, ctx => {
      ctx.blink(32, 32, 1);
    });
    const move = new ActionSequence(brick, ctx => {
      ctx.moveBy(ball.directionUnit(5), ball.speed());
    });
    brick.actions.runAction(new ParallelActions([ blink, move ])).die();

    const emitter = new ParticleEmitter({
      width, height,
      beginColor: Color.Orange,
      endColor: Color.White,
      emitterType: EmitterType.Rectangle,
      minVel: 100,
      maxVel: 200,
      acceleration: vec(0, 200),
      minAngle: 0,
      maxAngle: 2 * Math.PI,
      emitRate: 400,
      opacity: 1,
      fadeFlag: true,
      particleLife: 500,
      maxSize: 4,
      minSize: 1,
      isEmitting: true,
      pos: vec(brick.pos.x - width / 2, brick.pos.y - height /2),
    });

    engine.add(emitter);
    emitter.actions.delay(150).die();
  }
}
