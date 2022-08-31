import { TransitionTo } from "st4t3";
import {
  Actor,
  CollisionType,
} from "excalibur";

type Props = { brick: Actor };

export default class AliveBrick extends TransitionTo<'DeadBrick', Props> {
  override start({ brick }: Props) {
    brick.body.collisionType = CollisionType.Fixed;
  }
  destroy() { this.transitionTo('DeadBrick'); }
}
