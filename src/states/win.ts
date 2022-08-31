import { TransitionTo } from "st4t3";

export default class Win extends TransitionTo<never> {
  override start() {
    setTimeout(() => {
      alert("You win!");
    }, 0);
  }
}
