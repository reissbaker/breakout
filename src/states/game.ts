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

    // Create the bricks and handle when they're destroyed
    const bricks = makeBricks(padding, engine, ball, (brick) => {
      killCount++;
      const paddleXscale = 1 + 3 * killCount / ORIGINAL_NUM_BRICKS;
      paddle.scale.x = paddleXscale;
      const index = bricks.indexOf(brick);
      bricks.splice(index, 1);
      if(bricks.length === 0) this.win();
    });
    const ORIGINAL_NUM_BRICKS = bricks.length;

    // Handle collisions
    let colliding = false;
    ball.on("collisionstart", (ev) => {
      if(colliding) return;
      colliding = true;

      // Handle ball-to-brick collisions
      if(ev.other instanceof Brick) {
        if(bricks.indexOf(ev.other) > -1) ev.other.destroy();
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

function makeBricks(padding: number, engine: Engine, ball: Ball, onDestroy: (b: Brick) => any) {
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
      brick.machine.state("DeadBrick").on("start", makeDestroyCallback(brick, onDestroy));
      bricks.push(brick);
      engine.add(brick);
    }
  }

  return bricks;
}

function makeDestroyCallback(brick: Brick, onDestroy: (b: Brick) => any) {
  return () => {
    onDestroy(brick);
  };
}
