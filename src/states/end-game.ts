import { TransitionTo } from "st4t3";

export default class EndGame extends TransitionTo<"Game"> {
  override start() {
    const text = document.getElementById('restart');
    if(!text) throw new Error('No restart text found');
    text.style.display = 'inline';
    const listener = () => {
      document.removeEventListener("pointerdown", listener);
      this.transitionTo("Game");
    };
    document.addEventListener("pointerdown", listener);
  }

  override stop() {
    const text = document.getElementById('restart');
    if(!text) throw new Error('No restart text found');
    text.style.display = 'none';
  }
}
