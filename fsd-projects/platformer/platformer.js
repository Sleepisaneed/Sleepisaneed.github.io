$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(-50, -50, canvas.width + 100, 50); // top wall
    createPlatform(
      -50,
      canvas.height - 10,
      canvas.width + 100,
      200,
      "rgb(118, 0, 233)",
    ); // bottom wall
    createPlatform(-50, -50, 50, canvas.height + 500); // left wall
    createPlatform(canvas.width, -50, 50, canvas.height + 100); // right wall

    //////////////////////////////////
    // ONLY CHANGE BELOW THIS POINT //
    //////////////////////////////////

    // TODO 1 - Enable the Grid
    // toggleGrid();

    // TODO 2 - Create Platforms
    createPlatform(100, 620, 220, 20, "#5b6475");
    createPlatform(380, 520, 220, 20, "#657187");
    createPlatform(660, 420, 220, 20, "#6f7d99");
    createPlatform(940, 320, 220, 20, "#7989aa");
    createPlatform(1180, 220, 160, 20, "#8495b8");
    createPlatform(1060, 100, 180, 20, "#90a2c5");

    // TODO 3 - Create Collectables
    createCollectable("database", 180, 570);
    createCollectable("diamond", 460, 470);
    createCollectable("grace", 740, 370);
    createCollectable("kennedi", 1020, 270);
    createCollectable("max", 1240, 170);
    createCollectable("steve", 1120, 50);

    // TODO 4 - Create Cannons
    createCannon("top", 250, 1800);
    createCannon("right", 300, 2200);
    createCannon("left", 560, 2600);

    //////////////////////////////////
    // ONLY CHANGE ABOVE THIS POINT //
    //////////////////////////////////
  }

  registerSetup(setup);
});
