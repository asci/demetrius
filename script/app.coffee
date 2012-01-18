class Sprite
  constructor: (@image, col, row, width, height) ->
    @sx = col * width
    @sy = row * height
    @sWidth = width
    @sHeight = height
    @dWidth = width
    @dHeight = height
    @x = 0
    @y = 0
    @dx = 0
    @dy = 0
class Animation
  constructor: (@image, @frameWidth, @frameCount) ->
    @sWidth = frameWidth
    @sHeight = image.height
    @dWidth = frameWidth
    @dHeight = image.height
    @i = 0
    @sx = 0
    @sy = 0
    @dx = 0
    @dy = 0
    @x = 0
    @y = 0
    @animateTimer = 0
  start: ->
    clearInterval @animateTimer 
    setInterval( ->
      @animate()
      true
    , 30)
    true
  stop: ->
    clearInterval @animateTimer
    true
  animate: ->
    if @i < @frameCount then @i++ else @i = 0
    @sx = @i * @frameWidth
    true
class Tile
  constructor: (@mapX, @mapY) ->
    @x = 0
    @y = 0
    @land = null
    @lanscape = null
class Field
  constructor: (@mapWidth, @mapHeight, @tileWidth, @tileHeight, @tileOffset) ->
    @x = 0
    @y = 0
    @tiles = []
    for i in [0..@mapWidth]
      @tiles[i] = []
      for j in [0..@mapHeight]
        tile = new Tile(i, j, 0, 0)
        tile.x = (i - j) * (@tileHeight - @tileOffset)
        tile.y = (i + j) * (@tileHeight - @tileOffset) / 2
        @tiles[i][j] = tile
$().ready ->
  app = ->
    buffer = document.createElement("canvas")
    canvas = $("#app")[0]
    ctx = buffer.getContext("2d")
    canvas.ctx = canvas.getContext("2d")
    zoom = 1
    queue = []
    started = false
    drag = false
    timer = 0
    fpsTimer = 0
    width = 0
    height = 0
    field = {}
    loader = {}
    lastEvent = null
    tick = new Date().getTime()
    frames = 0
    tileX = 0
    tileY = 0
    setSize = (w, h) ->
      width = w
      height = h
      canvas.width = width
      canvas.height = height
      buffer.width = width
      buffer.height = height
      true
    setSize(760, 600)
    resources = {}
    loadResource = (res, path) ->
      addToResourceQueue res
      resources[res] = new Image()
      resources[res].onload = ->
        removeFromResourceQueue res
      resources[res].src = path;
      true
    addToResourceQueue = (res) ->
      queue.push res
      true
    removeFromResourceQueue = (res) ->
      queue.splice(queue.indexOf(res), 1);
      startApp() if queue.length is 0 and !started
      true
    drawRect = (x, y, w, h, fill, stroke, border) ->
      ctx.save()
      ctx.translate(x + border, y + border)
      ctx.fillStyle = fill
      ctx.strokeStyle = stroke
      ctx.lineWidth = border
      ctx.fillRect(0, 0, w - border * 2, h - border * 2)
      ctx.strokeRect(0, 0, w - border * 2, h - border * 2)
      ctx.restore()
      true
    drawSprite = (x, y, spr) ->
      ctx.save()
      ctx.translate(x, y)
      ctx.drawImage(spr.image, spr.sx, spr.sy, spr.sWidth, spr.sHeight, spr.dx, spr.dy, spr.dWidth, spr.dHeight)
      ctx.restore()
      true
    $('#app').mousedown (e) ->
      x = e.clientX - @offsetLeft
      y = e.clientY - @offsetTop
      lastEvent = e 
      tick = new Date().getTime(); 
      true
    $('#app').mouseup (e) ->
      x = e.clientX - @offsetLeft
      y = e.clientY - @offsetTop
      if drag
        drag = false
        tick = new Date().getTime() + 10000000
        return true
      drag = false
      tick = new Date().getTime() + 10000000
      field.tiles[tileX][tileY].landscape = new Sprite(resources['LAND'], Math.round(Math.random() * 6), 0, field.tileWidth, field.tileHeight)
      true
    $('#app').mousemove (e) ->
      x = e.clientX - @offsetLeft
      y = e.clientY - @offsetTop
      drag = true if new Date().getTime() - tick > 175
      if drag
        mapMove(x, y)
        lastEvent = e
        return true
      mouseCheck(x, y)
      true
    mouseCheck = (x, y) ->
      tileY = (2 * (y + field.y) - x - field.x) / 2
      tileX = x + tileY + field.x - field.tileWidth
      tileY *= 1.03
      tileX *= 1.03
      tileY = Math.round(tileY / field.tileHeight / 0.5) - 1
      tileX = Math.round(tileX / field.tileWidth / 0.5)
      true
    mapMove = (x, y) ->
      lastX = lastEvent.clientX - canvas.offsetLeft;
      lastY = lastEvent.clientY - canvas.offsetTop;
      if field.x + (lastX - x) < -(field.mapWidth * field.tileWidth * 0.68)
        field.x = -(field.mapWidth * field.tileWidth * 0.68)
      else if field.x + (lastX - x) > (field.mapWidth * field.tileWidth  * 0.68 - width)
        field.x = (field.mapWidth * field.tileWidth * 0.68 - width)
      else
        field.x += lastX - x
      if field.y + (lastY - y) < 0
        field.y = 0
      else if field.y + (lastY - y) > field.mapHeight * field.tileHeight - height
        field.y = field.mapHeight * field.tileHeight - height
      else
       field.y += lastY - y
      true
    onFPS = ->
      $('#fps').text frames
      frames = 0
      true
    startApp = ->
      field = new Field(100, 150, 128, 128, 66)
      i = 0
      while i < field.mapWidth
        j = 0
        while j < field.mapHeight
          field.tiles[i][j].land = new Sprite(resources['LAND'], Math.round(Math.random() * 3), 2, field.tileWidth, field.tileHeight)
          field.tiles[i][j].landscape = new Sprite(resources['LAND'], Math.round(Math.random() * 3), 2, field.tileWidth, field.tileHeight)
          j++
        i++
      clearInterval(fpsTimer);
      setInterval(onFPS, 1000);
      clearInterval(timer)
      onFrame()
      true
    onFrame = ->
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.scale(zoom, zoom)
      i = 0
      while i < field.mapWidth
        j = 0
        while j < field.mapHeight
          if field.tiles[i][j].x - field.x > -field.tileWidth and
          field.tiles[i][j].x - field.x < width and
          field.tiles[i][j].y - field.y > -field.tileHeight and
          field.tiles[i][j].y - field.y < height
            drawSprite(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y, field.tiles[i][j].land)
          j++
        i++
      i = 0
      while i < field.mapWidth
        j = 0
        while j < field.mapHeight
          if field.tiles[i][j].x - field.x > -field.tileWidth and
          field.tiles[i][j].x - field.x < width and
          field.tiles[i][j].y - field.y > -field.tileHeight and
          field.tiles[i][j].y - field.y < height
            if field.tiles[i][j].landscape isnt undefined
              drawSprite(field.tiles[i][j].x - field.x, field.tiles[i][j].y - field.y, field.tiles[i][j].landscape)
            if i == tileX and j == tileY
              ctx.fillStyle = 'rgba(255, 255, 120, 0.7)'
              ctx.beginPath()
              ctx.moveTo(field.tiles[i][j].x - field.x,                         field.tiles[i][j].y - field.y + (field.tileHeight / 4) + field.tileOffset)
              ctx.lineTo(field.tiles[i][j].x - field.x + (field.tileWidth / 2), field.tiles[i][j].y - field.y + field.tileOffset)
              ctx.lineTo(field.tiles[i][j].x - field.x + field.tileWidth,       field.tiles[i][j].y - field.y + (field.tileHeight / 4) + field.tileOffset)
              ctx.lineTo(field.tiles[i][j].x - field.x + (field.tileWidth / 2), field.tiles[i][j].y - field.y + (field.tileHeight / 2) + field.tileOffset)
              ctx.fill()
          j++
        i++
      ctx.restore()
      canvas.ctx.clearRect(0, 0, width, height)
      canvas.ctx.drawImage(buffer, 0, 0)
      frames++
      setTimeout onFrame, 1
      true
    loadResource('LAND', './images/result.png')
    loadResource('ANIM_LOADER', './images/loader.png')
    console.log 'After loadResousce'
    true
  app()