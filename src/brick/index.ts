import { Machine } from "st4t3";
import {
  Actor,
  Color,
} from "excalibur";
import Ball from "../ball";
import AliveBrick from "./states/alive-brick";
import DeadBrick from "./states/dead-brick";

export default class Brick extends Actor {
  readonly machine: ReturnType<typeof machine>;

  constructor(args: { ball: Ball, x: number, y: number, width: number, height: number }) {
    const { x, y, width, height, ball } = args;
    super({
      x, y, width, height,
      color: Color.Orange,
    });

    this.machine = machine({
      ball, width, height,
      brick: this,
    });
  }

  override onInitialize() {
    this.machine.start();
  }

  destroy() {
    this.machine.current().destroy();
  }
}

type Props = { ball: Ball, brick: Brick, width: number, height: number };
function machine(props: Props) {
  return new Machine({
    initial: "AliveBrick",
    props,
    states: { AliveBrick, DeadBrick },
  });
}
