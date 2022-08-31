import { TransitionTo } from "st4t3";

export default class Lose extends TransitionTo<'EndGame'> {
  override start() {
    setTimeout(() => {
      alert("You lose :(");
      this.transitionTo("EndGame");
    }, 0);
  }
}
