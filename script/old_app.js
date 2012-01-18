$().ready(function() {

	var app = function() {
		//Initialization
		var buffer = document.createElement("canvas");
		var canvas = $("#app")[0];
		var width;
		var height;
		var zoom = 1;
		var queue = [];
		var started = false;
		var drag = false;
		var	ticks;
		var lastEvent;
		var setSize = function (w, h) {
			width = w;
			height = h;
			canvas.width = width;
			canvas.height = height;
			buffer.width = width;
			buffer.height = height;		
		}(760, 600);
		var ctx = buffer.getContext("2d");
		canvas.ctx = canvas.getContext("2d");
		
		var Field = function (mapWidth, mapHeight) {
			this.tiles = [];
			this.x = 1900;
			this.y = 300;
			this.mapWidth = mapWidth;
			this.mapHeight = mapHeight;
			this.tileHeight = 64;
			this.tileWidth = 64;
		}
				
		
		var  timer
			,fpsTimer, fps, frames;
			

		
		var Tile = function () {
			this.x = 0;
			this.y = 0;
			this.land = null;
			this.landscape = null;
			this.unit = null;
			this.mapX = 0;
			this.mapY = 0;
		}
		//Общее хранилище загрженных ресурсов по названию
		var Resources = {};
		//Функция загрузки ресурса
		var loadResource = function (res, path){
			addToResourceQueue('LAND');
			Resources[res] = new Image();
			Resources[res].onload = function () {
				removeFromResourceQueue(res);
			}
			Resources[res].src = path;
		};
		
		var addToResourceQueue = function (res) {
			queue.push(res);
		}
		var removeFromResourceQueue = function (res) {
			queue.splice(queue.indexOf(res), 1);
			if ((queue.length == 0) && (!started)) {
				start();
			}
		}
		/*
		 * Класс анимированного спрайта
		 */
		var Animation = function (image, frameWidth, frameCount) {
			this.image = image;
			this.frameCount = frameCount;
			this.frameWidth = frameWidth;
			this.i = 0;
			this.sx = 0;
			this.sy = 0;
			this.sWidth = frameWidth;
			this.sHeight = image.height;
			this.dx = 0;
			this.dy = 0;
			this.dWidth = frameWidth;
			this.dHeight = image.height;
			this.x = 0;
			this.y = 0;
			this.animateTimer = 0;
			this.start();
		}
		
		Animation.prototype = {
			start: function () {
				var self = this;
				clearInterval(this.animateTimer);
				setInterval(function () {
					self.animate();
				}, 30);
			},
			pause: function () {
				clearInterval(this.animateTimer);
			},
			animate: function () {
				if (this.i < this.frameCount - 1) {
					this.i++;
				} else {
					this.i = 0;
				}
				this.sx = this.i * this.frameWidth;
			},
			stop: function () {
				clearInterval(this.animateTimer);
				this.i = 0;
				this.sx = this.i * this.frameWidth;
			}
		}
		
		/*
		 * Класс статического спрайта на поле
		 */		
		var Sprite = function (tileSet, col, row, width, height) {
			this.img = document.createElement("canvas");
			this.img.width = width;
			this.img.height = height;
			this.ctx = this.img.getContext('2d');
			this.ctx.drawImage(tileSet, col * width, row * height, width, height, 0, 0, width, height);
			this.image = tileSet;
			this.sx = col * width;
			this.sy = row * height;
			this.sWidth = width;
			this.sHeight = height;
			this.dx = 0;
			this.dy = 0;
			this.dWidth = width;
			this.dHeight = height;
			this.x = 0;
			this.y = 0;
		};
		Sprite.prototype = {
			hitTest : function (mx, my) {
				var clr;
				clr = this.ctx.getImageData((mx / zoom + field.x - this.x), (my / zoom + field.y - this.y), 1, 1).data;
				return (clr[3] > 250);
			}
		}
		
		
		var LoaderAnimation = function () {
			var result = new Animation(Resources['ANIM_LOADER'], 48, 12);
			return result;
		}
		
		
		var drawImage = function (x, y, image) {
			ctx.save();
			ctx.translate(x, y);
			ctx.drawImage(image, 0, 0);
			ctx.restore();
		}

		var drawSprite = function (x, y, spr) {
			ctx.save();
			ctx.translate(x, y);
			ctx.drawImage(spr.image, spr.sx, spr.sy, spr.sWidth, spr.sHeight, spr.dx, spr.dy, spr.dWidth, spr.dHeight);
			ctx.restore();
		}		
		
		
		var drawRect = function (x, y, w, h, fill, stroke, border) {
			ctx.save();
			ctx.translate(x + border, y + border);
			ctx.fillStyle = fill;
			ctx.strokeStyle = stroke;
			ctx.lineWidth = border;
			ctx.fillRect(0, 0, w - border * 2, h - border * 2);
			ctx.strokeRect(0, 0, w - border * 2, h - border * 2);
			ctx.restore();
		};	
		
		$('#app').mousedown(function (e){
			var x, y;
			x = e.clientX - this.offsetLeft;
			y = e.clientY - this.offsetTop;
			
			last_event = e;	
			
			ticks = new Date().getTime();	
		});
		$('#app').mouseleave(function (e){
			if (drag) {
				drag = false;
				ticks = new Date().getTime() + 10000000;
				return;
			}
			drag = false;
		
			ticks = new Date().getTime() + 10000000;
		});
		// using the event helper
		$('#app').mousewheel(function(e, delta) {
			if (delta > 0) {
				zoom += 0.1;
			} else {
				zoom -= 0.1;
			}
		});
		$('#app').mouseup(function (e){
			var x, y;
			x = e.clientX - this.offsetLeft;
			y = e.clientY - this.offsetTop;
			if (drag) {
				drag = false;
				ticks = new Date().getTime() + 10000000;
				return;
			}
			drag = false;
		
			ticks = new Date().getTime() + 10000000;
			for	(i = 0; i < field.mapWidth; i++) {
				for	(j = 0; j < field.mapHeight; j++) {
					if ((field.tiles[i][j].x - field.x > -field.tileWidth)&&
					   ((field.tiles[i][j].x - field.x < width))&&
					   ((field.tiles[i][j].y - field.y > -field.tileHeight))&&
					   ((field.tiles[i][j].y - field.y < height))) {
						if (field.tiles[i][j].land.hitTest(x, y)) {
							console.log(11);
							field.tiles[i][j].landscape = new Sprite(Resources['LAND'], Math.round(Math.random() * 7), 19, field.tileWidth, field.tileHeight);
							return;
						}
					}
				}
			}
		});

		$('#app').mousemove(function (e){
			var x, y;
			x = e.clientX - this.offsetLeft;
			y = e.clientY - this.offsetTop;
			if (new Date().getTime() - ticks > 175) {
				drag = true;
			};
			if (drag == true) {
				mapMove(x, y);
				last_event = e;
				return;
			};
		});

		var mapMove = function (x, y) {
			var last_x = last_event.clientX - canvas.offsetLeft;
			var last_y = last_event.clientY - canvas.offsetTop;
			
			if (field.x + (last_x - x) < field.tileHeight) {
				field.x = field.tileHeight;
			} else if (field.x + (last_x - x) > field.mapWidth * field.tileWidth - width) {
				field.x = field.mapWidth * field.tileWidth - width;
			} else {
				field.x += last_x - x;
			};
			
			if (field.y + (last_y - y) < 0) {
				field.y = 0;
			} else if (field.y + (last_y - y) > field.mapHeight * field.tileHeight - height) {
				field.y = field.mapHeight * field.tileHeight - height;
			} else {
				field.y += last_y - y;
			};
		};
		
		var onFPS = function () {
			$('#fps').text(frames);
			frames = 0;
		}
		var field;
		var loader;
		
		var onFrame = function () {
			ctx.clearRect(0,0, width, height);
			ctx.save();
			ctx.scale(zoom, zoom);
			//Место где мы проходим по циклу и рисуем спрайты
			for	(i = 0; i < field.mapWidth; i++) {
				for	(j = 0; j < field.mapHeight; j++) {
					if ((field.tiles[i][j].x - field.x > -field.tileWidth)&&
					((field.tiles[i][j].x - field.x < width))&&
					((field.tiles[i][j].y - field.y > -field.tileHeight))&&
					((field.tiles[i][j].y - field.y < height))) {
						drawSprite(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y, field.tiles[i][j].land);
						if (field.tiles[i][j].landscape) {
							drawSprite(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y, field.tiles[i][j].landscape);
						}
					}
				}
			}
			ctx.restore();
			drawSprite(0, 0, loader);
			canvas.ctx.clearRect(0, 0, width, height);
			canvas.ctx.drawImage(buffer, 0, 0);
			frames++;
		};
		
		var start = function () {
			field = new Field(75, 75);
			loader = new LoaderAnimation();

			var land;
			var landscape;
			var tile;
			var rnd;
			
			var tileW = field.tileWidth;
			var tileH = field.tileHeight;
			
			field.tiles = [];
			for	(i = 0; i < field.mapWidth; i++) {
				field.tiles[i] = [];
				for	(j = 0; j < field.mapHeight; j++) {
					tile = new Tile();
					tile.land = new Sprite(Resources['LAND'], Math.round(Math.random() * 6), Math.round(Math.random()), tileW, tileH);;
					tile.mapX = i;
					tile.mapY = j;
					tile.x = tile.land.x = (i - j) * (tileH - 33) + ((field.mapWidth / 2) * tileW);
					tile.y = tile.land.y = (i + j) * (tileH - 33) / 2;
					rnd = Math.round(Math.random() * 20);
					if (rnd < 3) tile.landscape = new Sprite(Resources['LAND'], Math.round(Math.random() * 7), 16, field.tileWidth, field.tileHeight);
					if (rnd > 18) tile.landscape = new Sprite(Resources['LAND'], Math.round(Math.random() * 7), 5, field.tileWidth, field.tileHeight);

					field.tiles[i][j] = tile;
				}
			}
			
			clearInterval(timer);
			setInterval(onFrame, 33);
			clearInterval(fpsTimer);
			setInterval(onFPS, 1000);
		}
		loadResource('LAND', './images/landscape.png');
		loadResource('ANIM_LOADER', './images/loader.png');
	}();	
});