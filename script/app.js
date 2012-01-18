(function() {
  var Animation, Field, Sprite, Tile;

  Sprite = (function() {

    function Sprite(image, col, row, width, height) {
      this.image = image;
      this.sx = col * width;
      this.sy = row * height;
      this.sWidth = width;
      this.sHeight = height;
      this.dWidth = width;
      this.dHeight = height;
      this.x = 0;
      this.y = 0;
      this.dx = 0;
      this.dy = 0;
    }

    return Sprite;

  })();

  Animation = (function() {

    function Animation(image, frameWidth, frameCount) {
      this.image = image;
      this.frameWidth = frameWidth;
      this.frameCount = frameCount;
      this.sWidth = frameWidth;
      this.sHeight = image.height;
      this.dWidth = frameWidth;
      this.dHeight = image.height;
      this.i = 0;
      this.sx = 0;
      this.sy = 0;
      this.dx = 0;
      this.dy = 0;
      this.x = 0;
      this.y = 0;
      this.animateTimer = 0;
    }

    Animation.prototype.start = function() {
      clearInterval(this.animateTimer);
      setInterval(function() {
        this.animate();
        return true;
      }, 30);
      return true;
    };

    Animation.prototype.stop = function() {
      clearInterval(this.animateTimer);
      return true;
    };

    Animation.prototype.animate = function() {
      if (this.i < this.frameCount) {
        this.i++;
      } else {
        this.i = 0;
      }
      this.sx = this.i * this.frameWidth;
      return true;
    };

    return Animation;

  })();

  Tile = (function() {

    function Tile(mapX, mapY) {
      this.mapX = mapX;
      this.mapY = mapY;
      this.x = 0;
      this.y = 0;
      this.land = null;
      this.lanscape = null;
    }

    return Tile;

  })();

  Field = (function() {

    function Field(mapWidth, mapHeight, tileWidth, tileHeight, tileOffset) {
      var i, j, tile, _ref, _ref2;
      this.mapWidth = mapWidth;
      this.mapHeight = mapHeight;
      this.tileWidth = tileWidth;
      this.tileHeight = tileHeight;
      this.tileOffset = tileOffset;
      this.x = 0;
      this.y = 0;
      this.tiles = [];
      for (i = 0, _ref = this.mapWidth; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        this.tiles[i] = [];
        for (j = 0, _ref2 = this.mapHeight; 0 <= _ref2 ? j <= _ref2 : j >= _ref2; 0 <= _ref2 ? j++ : j--) {
          tile = new Tile(i, j, 0, 0);
          tile.x = (i - j) * (this.tileHeight - this.tileOffset);
          tile.y = (i + j) * (this.tileHeight - this.tileOffset) / 2;
          this.tiles[i][j] = tile;
        }
      }
    }

    return Field;

  })();

  $().ready(function() {
    var app;
    app = function() {
      var addToResourceQueue, buffer, canvas, ctx, drag, drawRect, drawSprite, field, fpsTimer, frames, height, lastEvent, loadResource, loader, mapMove, mouseCheck, onFPS, onFrame, queue, removeFromResourceQueue, resources, setSize, startApp, started, tick, tileX, tileY, timer, width, zoom;
      buffer = document.createElement("canvas");
      canvas = $("#app")[0];
      ctx = buffer.getContext("2d");
      canvas.ctx = canvas.getContext("2d");
      zoom = 1;
      queue = [];
      started = false;
      drag = false;
      timer = 0;
      fpsTimer = 0;
      width = 0;
      height = 0;
      field = {};
      loader = {};
      lastEvent = null;
      tick = new Date().getTime();
      frames = 0;
      tileX = 0;
      tileY = 0;
      setSize = function(w, h) {
        width = w;
        height = h;
        canvas.width = width;
        canvas.height = height;
        buffer.width = width;
        buffer.height = height;
        return true;
      };
      setSize(760, 600);
      resources = {};
      loadResource = function(res, path) {
        addToResourceQueue(res);
        resources[res] = new Image();
        resources[res].onload = function() {
          return removeFromResourceQueue(res);
        };
        resources[res].src = path;
        return true;
      };
      addToResourceQueue = function(res) {
        queue.push(res);
        return true;
      };
      removeFromResourceQueue = function(res) {
        queue.splice(queue.indexOf(res), 1);
        if (queue.length === 0 && !started) startApp();
        return true;
      };
      drawRect = function(x, y, w, h, fill, stroke, border) {
        ctx.save();
        ctx.translate(x + border, y + border);
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = border;
        ctx.fillRect(0, 0, w - border * 2, h - border * 2);
        ctx.strokeRect(0, 0, w - border * 2, h - border * 2);
        ctx.restore();
        return true;
      };
      drawSprite = function(x, y, spr) {
        ctx.save();
        ctx.translate(x, y);
        ctx.drawImage(spr.image, spr.sx, spr.sy, spr.sWidth, spr.sHeight, spr.dx, spr.dy, spr.dWidth, spr.dHeight);
        ctx.restore();
        return true;
      };
      $('#app').mousedown(function(e) {
        var x, y;
        x = e.clientX - this.offsetLeft;
        y = e.clientY - this.offsetTop;
        lastEvent = e;
        tick = new Date().getTime();
        return true;
      });
      $('#app').mouseup(function(e) {
        var x, y;
        x = e.clientX - this.offsetLeft;
        y = e.clientY - this.offsetTop;
        if (drag) {
          drag = false;
          tick = new Date().getTime() + 10000000;
          return true;
        }
        drag = false;
        tick = new Date().getTime() + 10000000;
        field.tiles[tileX][tileY].landscape = new Sprite(resources['LAND'], Math.round(Math.random() * 6), 0, field.tileWidth, field.tileHeight);
        return true;
      });
      $('#app').mousemove(function(e) {
        var x, y;
        x = e.clientX - this.offsetLeft;
        y = e.clientY - this.offsetTop;
        if (new Date().getTime() - tick > 175) drag = true;
        if (drag) {
          mapMove(x, y);
          lastEvent = e;
          return true;
        }
        mouseCheck(x, y);
        return true;
      });
      mouseCheck = function(x, y) {
        tileY = (2 * (y + field.y) - x - field.x) / 2;
        tileX = x + tileY + field.x - field.tileWidth;
        tileY *= 1.03;
        tileX *= 1.03;
        tileY = Math.round(tileY / field.tileHeight / 0.5) - 1;
        tileX = Math.round(tileX / field.tileWidth / 0.5);
        return true;
      };
      mapMove = function(x, y) {
        var lastX, lastY;
        lastX = lastEvent.clientX - canvas.offsetLeft;
        lastY = lastEvent.clientY - canvas.offsetTop;
        if (field.x + (lastX - x) < -(field.mapWidth * field.tileWidth * 0.68)) {
          field.x = -(field.mapWidth * field.tileWidth * 0.68);
        } else if (field.x + (lastX - x) > (field.mapWidth * field.tileWidth * 0.68 - width)) {
          field.x = field.mapWidth * field.tileWidth * 0.68 - width;
        } else {
          field.x += lastX - x;
        }
        if (field.y + (lastY - y) < 0) {
          field.y = 0;
        } else if (field.y + (lastY - y) > field.mapHeight * field.tileHeight - height) {
          field.y = field.mapHeight * field.tileHeight - height;
        } else {
          field.y += lastY - y;
        }
        return true;
      };
      onFPS = function() {
        $('#fps').text(frames);
        frames = 0;
        return true;
      };
      startApp = function() {
        var i, j;
        field = new Field(100, 150, 128, 128, 66);
        i = 0;
        while (i < field.mapWidth) {
          j = 0;
          while (j < field.mapHeight) {
            field.tiles[i][j].land = new Sprite(resources['LAND'], Math.round(Math.random() * 3), 2, field.tileWidth, field.tileHeight);
            field.tiles[i][j].landscape = new Sprite(resources['LAND'], Math.round(Math.random() * 3), 2, field.tileWidth, field.tileHeight);
            j++;
          }
          i++;
        }
        clearInterval(fpsTimer);
        setInterval(onFPS, 1000);
        clearInterval(timer);
        onFrame();
        return true;
      };
      onFrame = function() {
        var i, j;
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.scale(zoom, zoom);
        i = 0;
        while (i < field.mapWidth) {
          j = 0;
          while (j < field.mapHeight) {
            if (field.tiles[i][j].x - field.x > -field.tileWidth && field.tiles[i][j].x - field.x < width && field.tiles[i][j].y - field.y > -field.tileHeight && field.tiles[i][j].y - field.y < height) {
              drawSprite(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y, field.tiles[i][j].land);
            }
            j++;
          }
          i++;
        }
        i = 0;
        while (i < field.mapWidth) {
          j = 0;
          while (j < field.mapHeight) {
            if (field.tiles[i][j].x - field.x > -field.tileWidth && field.tiles[i][j].x - field.x < width && field.tiles[i][j].y - field.y > -field.tileHeight && field.tiles[i][j].y - field.y < height) {
              if (field.tiles[i][j].landscape !== void 0) {
                drawSprite(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y, field.tiles[i][j].landscape);
              }
              if (i === tileX && j === tileY) {
                ctx.fillStyle = 'rgba(255, 255, 120, 0.7)';
                ctx.beginPath();
                ctx.moveTo(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y + (field.tileHeight / 4) + field.tileOffset);
                ctx.lineTo(field.tiles[i][j].x - field.x + (field.tileWidth / 2), field.tiles[i][j].y - field.y + field.tileOffset);
                ctx.lineTo(field.tiles[i][j].x - field.x + field.tileWidth, field.tiles[i][j].y - field.y + (field.tileHeight / 4) + field.tileOffset);
                ctx.lineTo(field.tiles[i][j].x - field.x + (field.tileWidth / 2), field.tiles[i][j].y - field.y + (field.tileHeight / 2) + field.tileOffset);
                ctx.fill();
              }
            }
            j++;
          }
          i++;
        }
        ctx.restore();
        canvas.ctx.clearRect(0, 0, width, height);
        canvas.ctx.drawImage(buffer, 0, 0);
        frames++;
        setTimeout(onFrame, 1);
        return true;
      };
      loadResource('LAND', './images/result.png');
      loadResource('ANIM_LOADER', './images/loader.png');
      console.log('After loadResousce');
      return true;
    };
    return app();
  });

}).call(this);
