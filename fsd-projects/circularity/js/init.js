var init = function (window) {
  "use strict";
  var draw = window.opspark.draw,
    physikz = window.opspark.racket.physikz,
    app = window.opspark.makeApp(),
    canvas = app.canvas,
    view = app.view,
    fps = draw.fps("#000");

  window.opspark.makeGame = function () {
    window.opspark.game = {};
    var game = window.opspark.game;

    ///////////////////
    // PROGRAM SETUP //
    ///////////////////

    // TODO 1 : Declare and initialize our variables
    var circles = [];
    var baseCircleCount = 50;
    var multiplierInput =
      typeof document !== "undefined"
        ? document.getElementById("ball-multiplier")
        : null;
    var shapeCycleButton =
      typeof document !== "undefined"
        ? document.getElementById("shape-cycle")
        : null;
    var shapeModes = [
      "circle",
      "square",
      "triangle",
      "rectangle",
      "hexagon",
      "lightning",
      "mix",
    ];
    var shapeModeIndex = 0;

    function getShapeName(index) {
      if (shapeModes[shapeModeIndex] === "mix") {
        return shapeModes[index % 6];
      }
      return shapeModes[shapeModeIndex];
    }

    function getRandomShapeColor() {
      var red = Math.floor(80 + Math.random() * 176);
      var green = Math.floor(80 + Math.random() * 176);
      var blue = Math.floor(80 + Math.random() * 176);
      return "rgb(" + red + ", " + green + ", " + blue + ")";
    }

    function drawCustomShape(shapeName) {
      var shape = new window.createjs.Shape();
      var graphics = shape.graphics;
      var radius = 5 + Math.random() * 20;
      var color = getRandomShapeColor();
      var placementRadius = radius * 1.35;

      graphics.beginFill(color).setStrokeStyle(2).beginStroke(color);
      if (shapeName === "square") {
        graphics.drawRect(-radius, -radius, radius * 2, radius * 2);
      } else if (shapeName === "triangle") {
        graphics
          .moveTo(0, -radius)
          .lineTo(radius, radius)
          .lineTo(-radius, radius)
          .closePath();
      } else if (shapeName === "rectangle") {
        graphics.drawRect(
          -radius * 1.35,
          -radius * 0.7,
          radius * 2.7,
          radius * 1.4,
        );
      } else if (shapeName === "hexagon") {
        graphics.moveTo(radius, 0);
        for (var side = 1; side <= 6; side++) {
          var angle = (side * Math.PI) / 3;
          graphics.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        graphics.closePath();
      } else {
        graphics
          .moveTo(-radius, -radius * 0.2)
          .lineTo(-radius * 0.15, -radius * 0.2)
          .lineTo(-radius * 0.45, -radius)
          .lineTo(radius, 0)
          .lineTo(radius * 0.15, 0)
          .lineTo(radius * 0.45, radius)
          .lineTo(-radius, -radius * 0.2)
          .closePath();
      }

      shape.name = shapeName;
      shape.radius = radius;
      shape.x =
        placementRadius + Math.random() * (canvas.width - placementRadius * 2);
      shape.y =
        placementRadius + Math.random() * (canvas.height - placementRadius * 2);
      shape.alpha = 0.5 + Math.random() * 0.5;
      return shape;
    }

    function getBallMultiplier() {
      if (!multiplierInput) {
        return 1;
      }

      var value = parseInt(multiplierInput.value, 10);
      if (!isFinite(value) || value < 1) {
        return 1;
      }

      return Math.min(value, 10);
    }

    function rebuildCircles() {
      for (var i = 0; i < circles.length; i++) {
        view.removeChild(circles[i]);
      }

      circles = [];

      var totalCircles = baseCircleCount * getBallMultiplier();
      for (var j = 0; j < totalCircles; j++) {
        drawCircle(j);
      }
      game.circles = circles;
    }

    // TODO 2 : Create a function that draws a circle
    function drawCircle(index) {
      var shapeName = getShapeName(index || 0);
      var circle =
        shapeName === "circle"
          ? draw.randomCircleInArea(canvas, true, true, "#999", 2)
          : drawCustomShape(shapeName);
      physikz.addRandomVelocity(circle, canvas, 5, 5);
      view.addChild(circle);
      circles.push(circle);
    }

    // TODO 3 : Call the drawCircle() function

    // TODO 7 : Use a loop to create multiple circles
    rebuildCircles();

    if (multiplierInput) {
      multiplierInput.addEventListener("input", function () {
        var value = parseInt(multiplierInput.value, 10);
        if (value > 10) {
          multiplierInput.value = 10;
        }
        rebuildCircles();
      });
    }

    if (shapeCycleButton) {
      shapeCycleButton.addEventListener("click", function () {
        shapeModeIndex = (shapeModeIndex + 1) % shapeModes.length;
        shapeCycleButton.textContent = "Shapes: " + shapeModes[shapeModeIndex];
        rebuildCircles();
      });
    }

    ///////////////////
    // PROGRAM LOGIC //
    ///////////////////

    /* 
        This Function is called 60 times/second, producing 60 frames/second.
        In each frame, for every circle, it should redraw that circle
        and check to see if it has drifted off the screen.         
        */
    function update() {
      // TODO 4 : Update the position of each circle using physikz.updatePosition()
      for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        physikz.updatePosition(circle);
        game.checkCirclePosition(circle);
      }

      // TODO 5 : Call game.checkCirclePosition() on your circles

      // TODO 8 / TODO 9 : Iterate over the array
    }

    /* 
        This Function should check the position of a circle that is passed to the 
        Function. If that circle drifts off the screen, this Function should move
        it to the opposite side of the screen.
        */
    game.checkCirclePosition = function (circle) {
      // if the circle has gone past the RIGHT side of the screen then place it on the LEFT
      if (circle.x > canvas.width) {
        circle.x = -circle.radius;
      }

      // TODO 6 : YOUR CODE STARTS HERE //////////////////////
      if (circle.x < -circle.radius) {
        circle.x = canvas.width + circle.radius;
      }
      if (circle.y > canvas.height) {
        circle.y = -circle.radius;
      }
      if (circle.y < -circle.radius) {
        circle.y = canvas.height + circle.radius;
      }

      // YOUR TODO 6 CODE ENDS HERE //////////////////////////
    };

    /////////////////////////////////////////////////////////////
    // --- NO CODE BELOW HERE  --- DO NOT REMOVE THIS CODE --- //
    /////////////////////////////////////////////////////////////

    view.addChild(fps);
    app.addUpdateable(fps);

    game.circles = circles;
    game.drawCircle = drawCircle;
    game.update = update;

    app.addUpdateable(window.opspark.game);
  };
};

// DO NOT REMOVE THIS CODE //////////////////////////////////////////////////////
if (
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined"
) {
  // here, export any references you need for tests //
  module.exports = init;
}
