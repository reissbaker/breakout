import { Machine } from "st4t3";
import {
  Engine,
  Actor,
  Color,
} from "excalibur";
import Ball from "../ball";
import AliveBrick from "./states/alive-brick";
import DeadBrick from "./states/dead-brick";

export default class Brick extends Actor {
  readonly machine: ReturnType<typeof machine>;

  constructor(args: { ball: Ball, engine: Engine, x: number, y: number, width: number, height: number }) {
    const { x, y, width, height, ball, engine } = args;
    super({
      x, y, width, height,
      color: Color.Orange,
    });

    this.machine = machine({
      ball, engine, width, height,
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

type Props = { ball: Ball, brick: Brick, engine: Engine, width: number, height: number };
function machine(props: Props) {
  return new Machine({
    initial: "AliveBrick",
    props,
    states: { AliveBrick, DeadBrick },
  });
}
