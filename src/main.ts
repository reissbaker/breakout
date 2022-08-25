import './style.css'
import { ParticleEmitter, EmitterType, Engine, Actor, Color, CollisionType, vec, ActionSequence, ParallelActions } from "excalibur";

const game = new Engine({
  width: 800,
  height: 600,
  canvasElementId: "game",
});

game.start();

// Track block kills
let killCount = 0;

// Create the paddle
const paddle = new Actor({
  x: 150,
  y: game.drawHeight - 40,
  width: 150,
  height: 20,
  color: Color.Chartreuse,
});

paddle.body.collisionType = CollisionType.Fixed;
game.add(paddle);

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

game.input.pointers.primary.on("move", (evt) => {
  paddle.pos.x = clamp(evt.worldPos.x, paddle.width / 2, game.drawWidth - paddle.width / 2);
});

// Create the ball
const ball = new Actor({
  x: 100,
  y: 300,
  radius: 10,
  color: Color.Red,
});

const BALL_SPEED = 300;
const ballSpeed = vec(BALL_SPEED, BALL_SPEED);
setTimeout(() => {
  ball.vel = ballSpeed;
}, 1000);

ball.body.collisionType = CollisionType.Passive;
const emitter = new ParticleEmitter({
  beginColor: Color.Red,
  endColor: Color.Blue,
  emitterType: EmitterType.Circle,
  radius: 5,
  minVel: 100,
  maxVel: 200,
  minAngle: 0,
  maxAngle: 2 * Math.PI,
  emitRate: 300,
  opacity: 1,
  fadeFlag: true,
  particleLife: 1000,
  maxSize: 10,
  minSize: 1,
  isEmitting: true,
});

game.add(ball);
game.add(emitter);
emitter.on("preupdate", () => {
  emitter.pos.x = ball.pos.x;
  emitter.pos.y = ball.pos.y;
  emitter.beginColor = ball.color;
});

// Bounce the ball off the horizontal and top
ball.on("postupdate", () => {
  if(ball.pos.x < ball.width / 2) {
    ball.vel.x = ballSpeed.x;
    ballBounceAnim();
  }

  if(ball.pos.x + ball.width / 2 > game.drawWidth) {
    ball.vel.x = ballSpeed.x * -1;
    ballBounceAnim();
  }

  if(ball.pos.y < ball.height / 2) {
    ball.vel.y = ballSpeed.y;
    ballBounceAnim();
  }
});

// Create the bricks
const padding = 10;
const xoffset = 0;
const yoffset = 0;
const cols = 7;
const rows = 5;

const bricksXspace = game.drawWidth - xoffset * 2;
const brickWidth = (bricksXspace - padding) / cols - padding;
const brickHeight = 40;
const bricks: Actor[] = [];

for(let r = 0; r < rows; r++) {
  for(let c = 0; c < cols; c++) {
    const brick = new Actor({
      x: xoffset + c * (brickWidth + padding) + padding + brickWidth / 2,
      y: yoffset + r * (brickHeight + padding) + padding + brickHeight / 2,
      width: brickWidth,
      height: brickHeight,
      color: Color.Orange,
    });
    bricks.push(brick);
    brick.body.collisionType = CollisionType.Fixed;
    game.add(brick);
  }
}

let colliding = false;
ball.on("collisionstart", (ev) => {
  if(bricks.indexOf(ev.other) > -1) {
    killCount++;
    const brick = ev.other;
    brick.body.collisionType = CollisionType.PreventCollision;
    brick.color = Color.White;
    const blink = new ActionSequence(brick, ctx => {
      ctx.blink(32, 32, 1);
    });
    const move = new ActionSequence(brick, ctx => {
      ctx.moveBy(ballDirectionUnit(5), BALL_SPEED);
    });
    brick.actions.runAction(new ParallelActions([ blink, move ])).die();
    paddle.scale.x = 1 + 3 * killCount / (rows * cols);
  }

  if(colliding) return;
  colliding = true;

  // Reverse direction on any collision
  const intersection = ev.contact.mtv.normalize();

  // The largest component of intersection is the direction to flip
  if(Math.abs(intersection.x) > Math.abs(intersection.y)) {
    ball.vel.x *= -1;
  }
  else {
    ball.vel.y *= -1;
  }

  ballBounceAnim();
});

function ballBounceAnim() {
  const shakeDirection = ballDirectionUnit(4, true);
  game.currentScene.camera.shake(shakeDirection.x, shakeDirection.y, 100);
  ball.actions.scaleTo(vec(0.5, 0.5), vec(10, 10)).scaleTo(vec(1, 1), vec(10, 10));
  ball.color = Color.White;
  ball.actions.delay(100).callMethod(() => ball.color = Color.Red);
}

function ballDirectionUnit(moveUnit: number, invert: boolean = false) {
  const left = ball.vel.x > 0;
  const up = ball.vel.y > 0;
  return vec(left !== invert ? moveUnit : -1 * moveUnit, up !== invert ? moveUnit : -1 * moveUnit);
}

ball.on("collisionend", () => {
  colliding = false;
});
