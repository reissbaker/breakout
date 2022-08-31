import { TransitionTo } from "st4t3";

export default class Lose extends TransitionTo<never> {
  override start() {
    setTimeout(() => {
      alert("You lose :(");
    }, 0);
  }
}
