import './style.css'
import {
  DisplayMode,
  Input,
  Engine,
  Color,
} from "excalibur";
import { Machine } from "st4t3";
import Game from "./states/game";
import Win from "./states/win";
import Lose from "./states/lose";

const engine = new Engine({
  displayMode: DisplayMode.FitScreen,
  canvasElementId: "game",
  pointerScope: Input.PointerScope.Document,
  backgroundColor: Color.Black,
});

const machine = new Machine({
  initial: "Game",
  props: {
    engine,
  },
  states: {
    Game, Win, Lose,
  },
});

machine.start();
