import { TransitionTo } from "st4t3";
import {
  Engine,
  Actor,
  Color,
  CollisionType,
} from "excalibur";

import Ball from "../ball";
import Brick from "../brick";

export type Props = {
  engine: Engine,
};

export default class Game extends TransitionTo<"Win" | "Lose", Props> {
  override start({ engine }: Props) {
    engine.start();

    // Padding used for game elements
    const padding = 10;

    // Track block kills
    let killCount = 0;

    // Create the paddle
    const paddleHeight = 20;
    const paddle = new Actor({
      x: 150,
      y: engine.drawHeight - padding - paddleHeight/2,
      width: 150,
      height: paddleHeight,
      color: Color.Chartreuse,
    });

    paddle.body.collisionType = CollisionType.Fixed;
    engine.add(paddle);

    function clamp(x: number, min: number, max: number) {
      return Math.min(Math.max(x, min), max);
    }

    engine.input.pointers.primary.on("move", (evt) => {
      paddle.pos.x = clamp(evt.worldPos.x, paddle.width / 2, engine.drawWidth - paddle.width / 2);
    });

    // Create the ball
    const ballRadius = 8;
    const ball = new Ball(ballRadius);
    engine.add(ball);

    // Create the bricks
    const xoffset = 0;
    const yoffset = 0;
    const cols = 6;
    const rows = 4;

    const bricksXspace = engine.drawWidth - xoffset * 2;
    const brickWidth = (bricksXspace - padding) / cols - padding;
    const brickHeight = 50;
    const bricks: Brick[] = [];

    for(let r = 0; r < rows; r++) {
      for(let c = 0; c < cols; c++) {
        const brick = new Brick({
          x: xoffset + c * (brickWidth + padding) + padding + brickWidth / 2,
          y: yoffset + r * (brickHeight + padding) + padding + brickHeight / 2,
          width: brickWidth,
          height: brickHeight,
          engine: engine,
          ball: ball,
        });
        bricks.push(brick);
        engine.add(brick);
      }
    }

    let colliding = false;
    ball.on("collisionstart", (ev) => {
      if(colliding) return;
      colliding = true;

      if(ev.other instanceof Brick) {
        if(bricks.indexOf(ev.other) > -1) {
          destroyBrick(ev.other);

          if(bricks.length === 0) {
            this.win();
            return;
          }
        }
      }

      // Reverse direction on any collision
      const intersection = ev.contact.mtv.normalize();

      // The largest component of intersection is the direction to flip
      if(Math.abs(intersection.x) > Math.abs(intersection.y)) {
        ball.vel.x *= -1;
      }
      else {
        ball.vel.y *= -1;
      }

      ball.bounceAnim(engine);
    });

    function destroyBrick(brick: Brick) {
      brick.destroy();
      killCount++;
      const paddleXscale = 1 + 3 * killCount / (rows * cols);
      paddle.scale.x = paddleXscale;
      const index = bricks.indexOf(brick);
      bricks.splice(index, 1);
    }

    ball.on("collisionend", () => {
      colliding = false;
    });

    ball.on("exitviewport", () => {
      this.lose();
    });
  }

  override stop({ engine }: Props) {
    engine.stop();
  }

  private win() {
    this.transitionTo("Win");
  }

  private lose() {
    this.transitionTo("Lose");
  }
}
