'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Globals
var HIDDEN_DOCK_MARGIN = 3;
var INCREMENT = 0.05;
var MOVE_BY = 0.05;
var CONTROL_SHIFT = ['ctrl', 'shift'];
var CONTROL_ALT_SHIFT = ['ctrl', 'alt', 'shift'];

// Relative directions
var LEFT = 'left';
var RIGHT = 'right';
var CENTER = 'center';

// Cardinal directions
var NW = 'nw';
var NE = 'ne';
var SE = 'se';
var SW = 'sw';

var ChainWindow = function () {
  function ChainWindow(window1) {
    var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    _classCallCheck(this, ChainWindow);

    this.window = window1;
    this.margin = margin;
    this.frame = this.window.frame();
    this.parent = this.window.screen().flippedVisibleFrame();
  }

  // Difference frame


  _createClass(ChainWindow, [{
    key: 'difference',
    value: function difference() {
      return {
        x: this.parent.x - this.frame.x,
        y: this.parent.y - this.frame.y,
        width: this.parent.width - this.frame.width,
        height: this.parent.height - this.frame.height
      };
    }

    // Set frame

  }, {
    key: 'set',
    value: function set() {
      this.window.setFrame(this.frame);
      this.frame = this.window.frame();
      return this;
    }

    // Move to screen

  }, {
    key: 'screen',
    value: function screen(_screen) {
      this.parent = _screen.flippedVisibleFrame();
      return this;
    }

    // Move to cardinal directions NW, NE, SE, SW or relative direction CENTER

  }, {
    key: 'to',
    value: function to(direction) {
      var difference = this.difference();

      // X-coordinate
      switch (direction) {
        case NW:case SW:
          this.frame.x = this.parent.x + this.margin;
          break;
        case NE:case SE:
          this.frame.x = this.parent.x + difference.width - this.margin;
          break;
        case CENTER:
          this.frame.x = this.parent.x + difference.width / 2;
          break;
        default:
          break;
      }

      // Y-coordinate
      switch (direction) {
        case NW:case NE:
          this.frame.y = this.parent.y + this.margin;
          break;
        case SE:case SW:
          this.frame.y = this.parent.y + difference.height - this.margin;
          break;
        case CENTER:
          this.frame.y = this.parent.y + difference.height / 2;
          break;
        default:
          break;
      }

      return this;
    }

    // TODO :: REFACTOR

  }, {
    key: 'move',
    value: function move(factor) {
      var difference = this.difference();
      if (factor.width != null) {
        var step = this.parent.width * factor.width;
        // left & right
        if (step < 0) {
          if (this.frame.x + step < this.parent.x + this.margin) {
            this.frame.x = this.parent.x + this.margin;
          } else {
            this.frame.x += step;
          }
        }
        if (step > 0) {
          if (this.frame.x + this.frame.width + step > this.parent.width - this.margin) {
            this.frame.x = this.parent.x + difference.width - this.margin;
          } else {
            this.frame.x += step;
          }
        }
      }
      if (factor.height != null) {
        var _step = this.parent.height * factor.height;
        // top & bottom
        if (_step < 0) {
          if (this.frame.y + _step < this.parent.y + this.margin) {
            this.frame.y = this.parent.y + this.margin;
          } else {
            this.frame.y += _step;
          }
        }
        if (_step > 0) {
          if (this.frame.y + this.frame.height + _step > this.parent.height - this.margin) {
            this.frame.y = this.parent.y + difference.height - this.margin;
          } else {
            this.frame.y += _step;
          }
        }
      }
      return this;
    }

    // Resize SE-corner by factor

  }, {
    key: 'resize',
    value: function resize(factor) {
      var difference = this.difference();
      if (factor.width != null) {
        var delta = Math.min(this.parent.width * factor.width, difference.x + difference.width - this.margin);
        this.frame.width += delta;
      }
      if (factor.height != null) {
        var _delta = Math.min(this.parent.height * factor.height, difference.height - this.frame.y + this.margin + HIDDEN_DOCK_MARGIN);
        this.frame.height += _delta;
      }
      return this;
    }

    // Maximize to fill whole screen

  }, {
    key: 'maximize',
    value: function maximize() {
      this.frame.width = this.parent.width - 2 * this.margin;
      this.frame.height = this.parent.height - 2 * this.margin;
      return this;
    }

    // Halve width

  }, {
    key: 'halve',
    value: function halve() {
      this.frame.width /= 2;
      return this;
    }
  }, {
    key: 'halveVertically',
    value: function halveVertically() {
      this.frame.height /= 2;
      return this;
    }

    // Fit to screen

  }, {
    key: 'fit',
    value: function fit() {
      var difference = this.difference();
      if (difference.width < 0 || difference.height < 0) {
        this.maximize();
      }
      return this;
    }

    // Fill relatively to LEFT or RIGHT-side of screen, or fill whole screen

  }, {
    key: 'fill',
    value: function fill(direction) {
      this.maximize();
      if ([LEFT, RIGHT].includes(direction)) {
        this.halve();
      }
      switch (direction) {
        case LEFT:
          this.to(NW);break;
        case RIGHT:
          this.to(NE);break;
        default:
          this.to(NW);
      }
      return this;
    }
  }]);

  return ChainWindow;
}();

// Chain a Window-object


Window.prototype.chain = function winChain() {
  return new ChainWindow(this);
};

// To direction in screen
Window.prototype.to = function winTo(direction, screen) {
  var window = this.chain();
  if (screen != null) {
    window.screen(screen).fit();
  }
  return window.to(direction).set();
};

// Fill in screen
Window.prototype.fill = function winFill(direction, screen) {
  var window = this.chain();
  if (screen != null) {
    window.screen(screen);
  }
  window.fill(direction).set();
  // Ensure position for windows larger than expected
  if (direction === RIGHT) {
    return window.to(NE).set();
  }
  return window;
};

// Resize by factor
Window.prototype.resize = function winResize(factor) {
  return this.chain().resize(factor).set();
};

Window.prototype.move = function winMove(factor) {
  return this.chain().move(factor).set();
};

Window.prototype.halve = function winFoldHorz() {
  return this.chain().halve().set();
};

Window.prototype.halveVertically = function winFoldVert() {
  return this.chain().halveVertically().set();
};

function guard(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}

Key.on('e', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.halve();
  });
});

Key.on('r', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.halveVertically();
  });
});

// Position Bindings
Key.on('q', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(NW);
  });
});

Key.on('w', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(NE);
  });
});

Key.on('s', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(SE);
  });
});

Key.on('a', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(SW);
  });
});

Key.on('c', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(CENTER);
  });
});

Key.on('q', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(NW, window.screen().next());
  });
});

Key.on('w', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(NE, window.screen().next());
  });
});

Key.on('s', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(SE, window.screen().next());
  });
});

Key.on('a', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(SW, window.screen().next());
  });
});

Key.on('c', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(CENTER, window.screen().next());
  });
});

// Fill Bindings

Key.on('f', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.fill();
  });
});

Key.on('o', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.fill(LEFT);
  });
});

Key.on('p', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.fill(RIGHT);
  });
});

Key.on('f', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.fill('', window.screen().next());
  });
});

Key.on('o', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.fill(LEFT, window.screen().next());
  });
});

Key.on('p', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.fill(RIGHT, window.screen().next());
  });
});

// Size Bindings

Key.on('l', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ width: MOVE_BY });
  });
});

Key.on('h', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ width: -MOVE_BY });
  });
});

Key.on('j', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ height: MOVE_BY });
  });
});

Key.on('k', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ height: -MOVE_BY });
  });
});

Key.on('l', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ width: INCREMENT });
  });
});

Key.on('h', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ width: -INCREMENT });
  });
});

Key.on('j', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ height: INCREMENT });
  });
});

Key.on('k', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ height: -INCREMENT });
  });
});

// Focus Bindings

Key.on('<', CONTROL_SHIFT, function () {
  var array = Window.recent();
  var last = array[array.length - 1];
  return guard(last, function (x) {
    return x.focus();
  });
});
//# sourceMappingURL=phoenix.js.map
