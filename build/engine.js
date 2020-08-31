"use strict";
// TODO:
// - Game ending
/**
 * Color is a set of constants which you can use to set the color of dots.
 *
 * Use it from both TypeScript and JavaScript with:
 *
 * ```javascript
 * game.setDot(x, y, Color.Red)
 * ```
 */
var Color;
(function (Color) {
    Color["Gray"] = "GRAY";
    Color["Black"] = "BLACK";
    Color["Red"] = "RED";
    Color["Orange"] = "ORANGE";
    Color["Yellow"] = "YELLOW";
    Color["Green"] = "GREEN";
    Color["Blue"] = "BLUE";
    Color["Indigo"] = "INDIGO";
    Color["Violet"] = "VIOLET";
})(Color || (Color = {}));
var Direction;
(function (Direction) {
    Direction["Left"] = "LEFT";
    Direction["Right"] = "RIGHT";
    Direction["Up"] = "UP";
    Direction["Down"] = "DOWN";
})(Direction || (Direction = {}));
var P5Renderer = /** @class */ (function () {
    function P5Renderer(gridHeight, gridWidth, containerId) {
        this._gridHeight = 24;
        this._gridWidth = 24;
        this._text = "";
        // Variables used when rendering the grid
        this._dotSize = 16;
        this._gapSize = 8;
        this._gridHeight = gridHeight;
        this._gridWidth = gridWidth;
        // Initialise internal dot store
        this._dots = new Array(this._gridHeight);
        for (var y = 0; y < this._dots.length; y++) {
            var row = new Array(this._gridWidth);
            for (var i = 0; i < row.length; i++) {
                row[i] = Color.Gray;
            }
            this._dots[y] = row;
        }
        // Start P5
        // This implementation is inefficient because of P5's API - we're also
        // running the P5 update loop alongside our internal update loop
        var parentElement = undefined;
        if (containerId) {
            parentElement = document.getElementById(containerId) || undefined;
        }
        new p5(function (p) {
            p.setup = function () {
                var width = this._dotSize * this._gridWidth +
                    this._gapSize * (this._gridWidth - 1);
                var height = this._dotSize * this._gridHeight +
                    this._gapSize * (this._gridHeight - 1) +
                    50;
                p.createCanvas(width, height);
                // Don't draw outlines around circles
                p.noStroke();
                // TODO: maybe we should just make this much greater than the 24a2
                // frame rate to avoid stuttering issues?
                p.frameRate(24);
            }.bind(this);
            p.draw = function () {
                // Clear the drawing
                p.clear();
                // Draw the grid
                this._drawGrid(p);
                // Draw the text
                p.push();
                p.textFont("monospace");
                p.textSize(18);
                var textY = this._dotSize * this._gridHeight +
                    this._gapSize * (this._gridHeight - 1) +
                    32;
                p.text(this._text, 0, textY);
                p.pop();
            }.bind(this);
        }.bind(this), parentElement);
    }
    P5Renderer.prototype._drawGrid = function (p) {
        var _this = this;
        var offset = this._dotSize + this._gapSize;
        p.push();
        p.translate(this._dotSize / 2, this._dotSize / 2);
        this._dots.forEach(function (row, y) {
            row.forEach(function (dot, x) {
                p.fill(p.color(_this._getCSSColor(dot)));
                p.circle(x * offset, y * offset, _this._dotSize);
            });
        });
        p.pop();
    };
    P5Renderer.prototype._getCSSColor = function (color) {
        switch (color) {
            case Color.Gray:
                return "gainsboro";
            case Color.Black:
                return "black";
            case Color.Red:
                return "red";
            case Color.Orange:
                return "orange";
            case Color.Yellow:
                return "gold";
            case Color.Green:
                return "green";
            case Color.Blue:
                return "blue";
            case Color.Indigo:
                return "indigo";
            case Color.Violet:
                return "violet";
            default:
                console.error("no CSS color defined for " + color);
                return "";
        }
    };
    P5Renderer.prototype.setDot = function (x, y, val) {
        if (y < 0 || y >= this._dots.length) {
            throw new Error("P5Renderer: Error trying to set dot (" + x + ", " + y + "): y is out of bounds");
        }
        if (x < 0 || x >= this._dots[y].length) {
            throw new Error("P5Renderer: Error trying to set dot (" + x + ", " + y + "): x is out of bounds");
        }
        this._dots[y][x] = val;
    };
    P5Renderer.prototype.setText = function (text) {
        this._text = text;
    };
    return P5Renderer;
}());
/**
 * Game is the object that controls the actual running of the game. You
 * create a new one by passing in a {@Link GameConfig}. Calling `game.run()`
 * will start the game.
 *
 * ```javascript
 * let config = {
 *    create: create, // A function you've defined
 *    update: update, // A function you've defined
 * }
 *
 * let game = new Game(config)
 * game.run()
 * ```
 */
var Game = /** @class */ (function () {
    function Game(config) {
        this._text = "";
        this._ended = false;
        this._frameCount = 0;
        // Variables used when rendering the grid
        this._dotSize = 16;
        this._gapSize = 8;
        this._gridHeight = 24;
        this._gridWidth = 24;
        this._clear = true;
        this._config = config;
        // Retain support for the deprecated _gridHeight and _gridWidth config
        // options
        if (config._gridHeight && config._gridHeight > 0) {
            console.log("The config option _gridHeight is deprecated, please use gridHeight instead");
            this._gridHeight = config._gridHeight;
        }
        if (config._gridWidth && config._gridWidth > 0) {
            console.log("The config option _gridWidth is deprecated, please use gridWidth instead");
            this._gridWidth = config._gridWidth;
        }
        if (config.gridHeight && config.gridHeight > 0) {
            this._gridHeight = config.gridHeight;
        }
        if (config.gridWidth && config.gridWidth > 0) {
            this._gridWidth = config.gridWidth;
        }
        if (config.clearGrid === false) {
            this._clear = false;
        }
        // TODO: remove 24s here? I think we already default them
        this._dots = new Array(this._gridHeight || 24);
        for (var y = 0; y < this._dots.length; y++) {
            var row = new Array(this._gridWidth || 24);
            for (var i = 0; i < row.length; i++) {
                // TODO: should be config.defaultDotColor?
                row[i] = Color.Gray;
            }
            this._dots[y] = row;
        }
    }
    /**
     * 24a2 games have a line of text below the grid which can be set to show
     * information to the player. This is commonly used to show instructions or
     * the player's score. Use this function to set that text.
     */
    Game.prototype.setText = function (text) {
        this._text = text;
    };
    /**
     * Returns the number of frames that have passed since the game started. The
     * speed at which this increases is dependent on the frame rate. The higher
     * the frame rate is, the faster this number will increment, and vice versa.
     * You can set the frame rate with {@Link GameConfig.frameRate}.
     *
     * You can use this function to do things like increase difficulty as time
     * goes on.
     */
    Game.prototype.getFrameCount = function () {
        return this._frameCount;
    };
    /**
     * Calling `end` stops the game loop. You should call it when the game is
     * finished. After you call it, the game is rendered one final time. Because
     * of this, you often want to `return` just after you call `game.end()` to
     * make sure any code after it is executed.
     */
    Game.prototype.end = function () {
        this._ended = true;
    };
    /**
     * Returns the color of a dot.
     */
    Game.prototype.getDot = function (x, y) {
        if (y < 0 || y >= this._dots.length) {
            throw new Error("Error trying to get dot (" + x + ", " + y + "): y is out of bounds");
        }
        if (x < 0 || x >= this._dots[y].length) {
            throw new Error("Error trying to get dot (" + x + ", " + y + "): x is out of bounds");
        }
        return this._dots[y][x];
    };
    /**
     * Sets the color of a dot.
     */
    Game.prototype.setDot = function (x, y, val) {
        if (y < 0 || y >= this._dots.length) {
            throw new Error("Error trying to set dot (" + x + ", " + y + "): y is out of bounds");
        }
        if (x < 0 || x >= this._dots[y].length) {
            throw new Error("Error trying to set dot (" + x + ", " + y + "): x is out of bounds");
        }
        this._dots[y][x] = val;
    };
    /**
     * Calling `run` starts the game.
     */
    Game.prototype.run = function () {
        if (!this._renderer) {
            this._renderer = new P5Renderer(this._gridHeight, this._gridWidth, this._config.containerId);
        }
        if (this._config.create) {
            this._config.create(this);
            this._render();
        }
        // Initialise a `setInterval` to call a render func every X milliseconds
        // Delay is in milliseconds
        var delay = 1000 / (this._config.frameRate || 24);
        this._interval = window.setInterval(this._update.bind(this), delay);
        this._listenForInput();
    };
    /**
     * The internal function that's called on every frame.
     */
    Game.prototype._update = function () {
        if (this._ended) {
            window.clearInterval(this._interval);
            return;
        }
        this._frameCount++;
        if (this._clear) {
            this._clearGrid();
        }
        if (this._config.update) {
            this._config.update(this);
        }
        this._render();
    };
    Game.prototype._clearGrid = function () {
        var _this = this;
        this._dots.forEach(function (row, y) {
            for (var x = 0; x < row.length; x++) {
                _this.setDot(x, y, _this._config.defaultDotColor || Color.Gray);
            }
        });
    };
    Game.prototype._render = function () {
        var _this = this;
        var _a;
        this._dots.forEach(function (row, y) {
            row.forEach(function (dot, x) {
                // TODO: don't perform this check every time
                if (!_this._renderer) {
                    console.error("renderer undefined");
                    return;
                }
                _this._renderer.setDot(x, y, dot);
            });
        });
        (_a = this._renderer) === null || _a === void 0 ? void 0 : _a.setText(this._text);
    };
    /**
     * This function sets up listeners for keyboard and mouse input. We
     * currently use P5 for this
     * TODO: switch to native functions
     */
    Game.prototype._listenForInput = function () {
        new p5(function (p) {
            p.keyPressed = function () {
                if (!this._config.onKeyPress) {
                    // Return true to not prevent the browser's default behaviour for
                    // this keypress
                    return true;
                }
                // TODO: use WASD instead of arrow keys - they don't have a meaning
                // in the browser
                if (p.keyCode === p.LEFT_ARROW) {
                    this._config.onKeyPress(Direction.Left);
                    return false;
                }
                if (p.keyCode === p.RIGHT_ARROW) {
                    this._config.onKeyPress(Direction.Right);
                    return false;
                }
                if (p.keyCode === p.UP_ARROW) {
                    this._config.onKeyPress(Direction.Up);
                    return false;
                }
                if (p.keyCode === p.DOWN_ARROW) {
                    this._config.onKeyPress(Direction.Down);
                    return false;
                }
                return true;
            }.bind(this);
            p.mouseClicked = function () {
                if (!this._config.onDotClicked) {
                    return;
                }
                var offset = this._dotSize + this._gapSize;
                // Iterate over all dot locations, and check whether the distance
                // between the click and the dot centre is less than the dot's
                // radius
                for (var y = 0; y < this._dots.length; y++) {
                    var row = this._dots[y];
                    for (var x = 0; x < row.length; x++) {
                        var dx = this._dotSize / 2 + x * offset;
                        var dy = this._dotSize / 2 + y * offset;
                        // p.mouseX and p.mouseY give is the coordinates in the canvas
                        // space.
                        var distance = p.dist(dx, dy, p.mouseX, p.mouseY);
                        if (distance < this._dotSize / 2) {
                            this._config.onDotClicked(x, y);
                            // We've found the dot, so exit early
                            return;
                        }
                    }
                }
            }.bind(this);
        }.bind(this));
    };
    return Game;
}());
