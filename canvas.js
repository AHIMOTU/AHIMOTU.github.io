function getRandom(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      resolve(img)
    }
    img.src = url
  })
}
function rAF(callback) {
  return (
    window.requestAnimationFrame ||
    function(handler) {
      window.setTimeout(handler, 1000 / 60);
    })(callback)
}

class HalloweenAnimation {
  constructor(selectors) {
    this.renderList = []
    this.scanning = false

    const canvas = document.querySelector(selectors)
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
  }

  async init() {
    this.imageList = await Promise.all([
      loadImage('https://www.gstatic.com/delight/animation-engine/halloween/ghost_1_lm.png'),
      loadImage('https://www.gstatic.com/delight/animation-engine/halloween/ghost_2_lm.png'),
      loadImage('https://www.gstatic.com/delight/animation-engine/halloween/ghost_3_lm.png'),
      loadImage('https://www.gstatic.com/delight/animation-engine/halloween/ghost_4_lm.png'),
      loadImage('https://www.gstatic.com/delight/animation-engine/halloween/ghost_circle.png'),
    ])
  }

  start() {
    this.renderList.push({
        render: this.createRender(),
        duration: getRandom(6000, 8000)
    })
    if (!this.scanning) {
      this.scanning = true
      rAF(this.scan.bind(this))
    }
  }

  scan(timestamp) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // this.ctx.fillStyle = '#fff'
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    let idx = 0
    let len = this.renderList.length
    if (len > 0) {
      rAF(this.scan.bind(this))
      this.scanning = true
    } else {
      this.scanning = false
    }
    while (idx < len) {
      const renderItem = this.renderList[idx]
      if (!renderItem.start) {
        renderItem.start = timestamp
      }
      if (!renderItem?.render || renderItem.render(timestamp)) {
        this.renderList.splice(idx, 1)
        len--
      } else {
        // 轮流执行
        idx++
      }
    }
  }

  createRender() {
    const len = this.imageList.length
    const idx = getRandom(0, len - 1)
    const image = this.imageList[idx]
    const sw = idx === len - 1 ? image.naturalWidth : 150
    const dw = idx === len - 1 ? image.naturalWidth : 150
    const dx = getRandom(0, 300)
    const scaleRatio = getRandom(5, 10) / 10
    const rotateAngle = getRandom(-20, 20) * Math.PI / 180

    const getSourceX = ({ start }, timestamp) => {
      if (idx === len - 1) return 0
      return (Math.floor((timestamp - start) / 60) % (image.naturalWidth / 150)) * 150
    }
    const getDestinationY = ({ start, duration }, timestamp) => {
      const ratio = (timestamp - start) / duration
      return this.canvas.height * (1 - ratio)
    }
    const fadeOutStage = getRandom(60, 70) / 100;
    const getAlpha = ({ start, duration }, timestamp) => {
      const ratio = (timestamp - start) / duration
      if ((1 - ratio) > fadeOutStage) {
        return 1
      }
      return 1 - +((fadeOutStage - (1 - ratio)) / fadeOutStage).toFixed(2);
    }
    const _this = this

    return function (timestamp) {
      const { ctx } = _this

      if((timestamp - this.start) / this.duration >= 1) return true;

      ctx.save()
      const sx = getSourceX(this, timestamp)
      const dy = getDestinationY(this, timestamp)
      ctx.translate(dx, dy)
      ctx.scale(scaleRatio, scaleRatio)
      ctx.rotate(rotateAngle);
      ctx.globalAlpha = getAlpha(this, timestamp)
      ctx.drawImage(
        image,
        sx,
        0,
        sw,
        image.naturalHeight,
        0,
        0,
        dw,
        image.naturalHeight,
      )
      ctx.restore()
    }
  }
}