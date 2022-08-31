import { TransitionTo } from "st4t3";

export default class Win extends TransitionTo<'EndGame'> {
  override start() {
    setTimeout(() => {
      alert("You win!");
      this.transitionTo("EndGame");
    }, 0);
  }
}
