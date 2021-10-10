import kaboom from "https://unpkg.com/kaboom@next/dist/kaboom.mjs";

const MOVEMENT_LIMIT_OFFSET = 80;
const MOVEMENT_SPEED = 1500;
const INITIAL_HEALTH = 100;
const BG_COLOR = "#000000";
const HEALTH_TEXT = (health) => `Health: ${health}`;

const points = (initial) => {
  if (initial == null) {
    initial = 0;
  }
  let value = initial;
  return {
    id: "points",
    points() {
      return value;
    },
    setPoints(newValue) {
      value = newValue;
    },
    addPoints(amount) {
      value += amount;
    },
    subtractPoints(amount) {
      value -= amount;
    },
  };
};

const k = kaboom({ global: false });

// Load all sprites that we need
k.loadSprite("ship", "sprites/ship.png");

k.loadSprite("asteroid", "sprites/asteroid.png", {
  sliceX: 8,
  sliceY: 15,
  anims: {
    go: {
      from: 0,
      to: 8 * 15 - 1,
      loop: true,
    },
  },
});

k.scene("start", () => {
  k.add([k.rect(k.width(), k.height()), k.color(BG_COLOR)]);
  k.add([
    k.text("Press any key to start", {}),
    k.origin("center"),
    k.pos(k.width() / 2, k.height() / 2),
  ]);

  k.keyPress(() => {
    k.go("game");
  });
});

k.scene("game", () => {
  k.add([k.rect(k.width(), k.height()), k.color(BG_COLOR)]);

  const ship = k.add([
    k.sprite("ship"),
    k.rotate(90),
    k.scale(0.5),
    k.pos(150, k.height() / 2),
    k.origin("center"),
    k.area(),
    k.health(INITIAL_HEALTH),
  ]);

  const hurt = (health) => {
    ship.hurt(health);
    if (ship.hp() <= 0) {
      k.go("gameover",pointsText.points());
    }
  }

  ship.collides("asteroid", () => {
    k.shake(10);
    hurt(10);

  });

  const healthText = k.add([
    k.text(HEALTH_TEXT(ship.hp()), {
      size: 20,
    }),
    k.pos(10, 10),
  ]);

  const pointsText = k.add([
    k.text("Points: 0", {
      size: 20,
    }),
    k.pos(k.width() / 2 - 100, 10),
    points(),
  ]);

  function addAsteroids() {
    let times = 0;

    k.add([
      k.sprite("asteroid", {
        anim: "go",
      }),
      k.scale(0.3),
      k.pos(k.width(), k.rand(0, k.height())),
      k.origin("center"),
      k.area(),
      k.move(180, 1000 + times * 10),
      k.cleanup(1),
      "asteroid",
    ]);

    healthText.text = HEALTH_TEXT(ship.hp());
    times++;

    k.wait(Math.max(0.1, 0.4 - 0.01 * times), addAsteroids);
  }

  addAsteroids();

  k.loop(1, () => {
    ship.heal(1);
    pointsText.addPoints(10);
    pointsText.text = `Points: ${pointsText.points()}`;
  });

  let spaceIsDown = false;
  k.keyDown("space", () => {
    if (spaceIsDown) return;
    spaceIsDown = true;
    // make a rectangle for a laser coming out of the ship
    if (k.randi(1, 200) === 1) {
      k.add([
        k.rect(40, 10000),
        k.origin("center"),
        k.color(255, 0, 0),
        k.pos(ship.pos.x, ship.pos.y),
        k.move(0, 1000),
        k.area(),
        k.cleanup(1),
        "laser",
        "biglaser",
        {
          isBigLaser: true
        }
      ]);
    } else {
      k.add([
        k.rect(40, 6),
        k.origin("center"),
        k.color(255, 255, 255),
        k.pos(ship.pos.x, ship.pos.y),
        k.move(0, 1000),
        k.area(),
        k.cleanup(1),
        "laser",
        {
          isBigLaser: false
        }
      ]);
    }
  });

  k.keyRelease("space", () => {
    spaceIsDown = false;
  });

  k.keyDown("up", () => {
    console.log(ship.pos.y);
    if (ship.pos.y - MOVEMENT_LIMIT_OFFSET > 0) {
      ship.move(0, -MOVEMENT_SPEED);
    } else {
      k.shake(10);
      hurt(1)
      ship.move(0, 0);
      ship.moveTo(ship.pos.x, MOVEMENT_LIMIT_OFFSET);
    }
  }); 
  
  k.keyDown("down", () => {
    if (ship.pos.y + MOVEMENT_LIMIT_OFFSET < k.height()) {
      ship.move(0, MOVEMENT_SPEED);
    } else {
      k.shake(10);
      hurt(1)
      ship.move(0, 0);
      ship.moveTo(ship.pos.x, k.height() - MOVEMENT_LIMIT_OFFSET);
    }
  });

  k.collides("laser", "asteroid", (laser, asteroid) => {
    asteroid.destroy();
    if (!laser.isBigLaser) {
      laser.destroy();
    }
    pointsText.addPoints(100);
  });
});

k.scene("gameover", (points) => {
  k.add([k.rect(k.width(), k.height()), k.color(BG_COLOR)]);
  k.add([
    k.text("Game Over"),
    k.origin("center"),
    k.pos(k.width() / 2, k.height() / 2),
  ]);

  k.add([
    k.text(`You scored ${points} points`, {
      size: 20,
    }),
    k.origin("center"),
    k.pos(k.width() / 2, k.height() / 2 + 100),
  ]);

  k.action(() => {
    k.cursor("pointer");
  });

  k.mouseClick(() => {
    k.go("game");
  });
});

k.go("start");
