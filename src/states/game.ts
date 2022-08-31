import { TransitionTo } from "st4t3";
import { Engine, Scene } from "excalibur";
import Ball from "../ball";
import Brick from "../brick";
import Paddle from "../paddle";

export type Props = {
  engine: Engine,
};

export default class Game extends TransitionTo<"Win" | "Lose", Props> {
  override start({ engine }: Props) {
    engine.removeScene("game");
    const scene = new Scene();
    engine.addScene("game", scene);
    engine.start().then(() => {
      engine.goToScene("game");
    });

    // Padding used for game elements
    const padding = 10;

    // Track block kills
    let killCount = 0;

    // Create the paddle
    const paddle = new Paddle({
      x: 150,
      y: engine.drawHeight - padding,
    });
    scene.add(paddle);

    // Create the ball, and handle ball->block collisions
    const ballRadius = 8;
    const ball = new Ball(ballRadius, (ev) => {
      if(ev.other instanceof Brick) {
        if(bricks.indexOf(ev.other) > -1) ev.other.destroy();
      }
    });
    scene.add(ball);

    // Create the bricks and handle when they're destroyed
    const bricks = makeBricks(padding, engine, scene, ball, (brick) => {
      killCount++;
      paddle.growBy(3 * killCount / ORIGINAL_NUM_BRICKS);

      const index = bricks.indexOf(brick);
      bricks.splice(index, 1);
      if(bricks.length === 0) this.win();
    });
    const ORIGINAL_NUM_BRICKS = bricks.length;

    // If the ball makes it outside the viewport, you lose
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

function makeBricks(padding: number, engine: Engine, scene: Scene, ball: Ball, onDestroy: (b: Brick) => any) {
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
        ball: ball,
      });
      brick.machine.state("DeadBrick").once("start", makeDestroyCallback(brick, onDestroy));
      bricks.push(brick);
      scene.add(brick);
    }
  }

  return bricks;
}

function makeDestroyCallback(brick: Brick, onDestroy: (b: Brick) => any) {
  return () => {
    onDestroy(brick);
  };
}
