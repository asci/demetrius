class AnimatedSprite
  constructor: (params) ->
    ###
      params:
        ctx - here we will draw sprite
        image - using this image
        width - frame width
        height - frame height
        frameCount -
        col - colnumn with sprite on image. leave blank if image has only this sprite
        row - row on image with sprite. leave blank if image has only this sprite
    ###
    params.col = params.col || 0
    params.row = params.row || 0
    @frameCount = params.frameCount || 1
    @ctx = params.ctx
    @image = params.image
    @sx = params.col * params.width
    @sy = params.row * params.height
    @sWidth = params.width
    @sHeight = params.height
    @dWidth = params.width
    @dHeight = params.height
    @x = 0
    @y = 0
    @alpha = 1.0
    @visible = true
    @dx = 0
    @dy = 0
    @frameIndex = 0
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
    ## TODO Make multiline image sets
    if @frameIndex < @frameCount then @frameIndex++ else @frameIndex = 0
    @sx = @frameIndex * @width
    true
  draw: () ->
    if @visible
      ctx.save()
      ctx.translate(@x, @y)
      ctx.drawImage(@image, @sx, @sy, @sWidth, @sHeight, @dx, @dy, @dWidth, @dHeight)
      ctx.restore()
    true
  process: () ->
    ## Here we decide whether to display the sprite
    if @alpha == 0
      @animate()
      return @visible = false
