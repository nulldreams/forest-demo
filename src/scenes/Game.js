/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser'
import Hero from '../entities/Hero'

class Game extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' })
  }

  init (data) {
    this.world = {
      background: {
        parallax: [
          'assets/tilesets/background/plx-1.png',
          'assets/tilesets/background/plx-2.png',
          'assets/tilesets/background/plx-3.png',
          'assets/tilesets/background/plx-4.png',
          'assets/tilesets/background/plx-5.png']
      }
    }
  }

  preload () {
    this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json')
    this.load.spritesheet('world-1-sheet', 'assets/tilesets/jungle-tileset.png', {
      frameWidth: 16,
      frameHeight: 15,
      margin: 0,
      spacing: 0
    })

    // background parallax images
    this.world.background.parallax.map((parallax, i) => {
      this.load.image(`parallax-${i + 1}`, parallax)
    })

    this.load.spritesheet('hero-idle-sheet', 'assets/hero/idle.png', {
      frameWidth: 19,
      frameHeight: 34
    })
    this.load.spritesheet('hero-run-sheet', 'assets/hero/run.png', {
      frameWidth: 22,
      frameHeight: 34
    })
    this.load.spritesheet('hero-jump-sheet', 'assets/hero/jump.png', {
      frameWidth: 17,
      frameHeight: 34
    })
    this.load.spritesheet('hero-fall-sheet', 'assets/hero/fall.png', {
      frameWidth: 20,
      frameHeight: 35
    })
  }

  create (data) {
    this.cursorKeys = this.input.keyboard.createCursorKeys()

    this.anims.create({
      key: 'hero-idle',
      frames: this.anims.generateFrameNames('hero-idle-sheet'),
      frameRate: 15,
      repeat: -1
    })

    this.anims.create({
      key: 'hero-running',
      frames: this.anims.generateFrameNames('hero-run-sheet'),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'hero-jumping',
      frames: this.anims.generateFrameNames('hero-jump-sheet')
    })

    this.anims.create({
      key: 'hero-falling',
      frames: this.anims.generateFrameNames('hero-fall-sheet')
    })

    this.addMap()

    this.addHero()

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
  }

  addHero () {
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y)

    this.cameras.main.startFollow(this.hero)
    this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer)
  }

  addMap () {
    this.map = this.make.tilemap({ key: 'level-1' })
    const groundTiles = this.map.addTilesetImage('jungle-tileset', 'world-1-sheet')

    const background1 = this.map.addTilesetImage('plx-1', 'parallax-1')
    const background2 = this.map.addTilesetImage('plx-2', 'parallax-2')
    const background3 = this.map.addTilesetImage('plx-3', 'parallax-3')
    const background4 = this.map.addTilesetImage('plx-4', 'parallax-4')
    const background5 = this.map.addTilesetImage('plx-5', 'parallax-5')
    const backgroundLayer1 = this.map.createStaticLayer('Background-1', background1)
    const backgroundLayer2 = this.map.createStaticLayer('Background-2', background2)
    const backgroundLayer3 = this.map.createStaticLayer('Background-3', background3)
    const backgroundLayer4 = this.map.createStaticLayer('Background-4', background4)
    const backgroundLayer5 = this.map.createStaticLayer('Background-5', background5)

    backgroundLayer1.setScrollFactor(0.1)
    backgroundLayer2.setScrollFactor(0.2)
    backgroundLayer3.setScrollFactor(0.3)
    backgroundLayer4.setScrollFactor(0.4)
    backgroundLayer5.setScrollFactor(0.5)

    this.map.createStaticLayer('Foreground', groundTiles)
    this.map.createStaticLayer('Foreground-2', groundTiles)

    const groundLayer = this.map.createStaticLayer('Ground', groundTiles)
    groundLayer.setCollision([40, 42, 44, 127, 128, 241, 242, 278, 279, 280, 281, 282, 283, 322, 358, 359, 397, 364, 365, 404], true)

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    this.physics.world.setBoundsCollision(true, true, false, true)

    this.map.getObjectLayer('Objects').objects.forEach(object => {
      if (object.name === 'Start') {
        this.spawnPos = { x: object.x, y: object.y }
      }
    })
    // const debugGraphics = this.add.graphics()
    // groundLayer.renderDebug(debugGraphics)
  }

  update (time, delta) {}
}

export default Game
