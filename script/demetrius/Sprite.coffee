class Sprite
  constructor: (params) ->
    ###
      params:
        ctx - here we will draw sprite
        image - using this image
        width - sprite width
        height - sprite height
        col - colnumn with sprite on image. leave blank if image has only this sprite
        row - row on image with sprite. leave blank if image has only this sprite
    ###
    params.col = params.col || 0
    params.row = params.row || 0
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
  draw: () ->
    if @visible
      ctx.save()
      ctx.translate(@x, @y)
      ctx.drawImage(@image, @sx, @sy, @sWidth, @sHeight, @dx, @dy, @dWidth, @dHeight)
      ctx.restore()
    true
  process: () ->
    ## Here we decide whether to display the sprite
    if @alpha == 0 then return @visible = false