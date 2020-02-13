/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser'
import StateMachine from 'javascript-state-machine'

class Hero extends Phaser.GameObjects.Sprite {
  constructor (scene, x, y) {
    super(scene, x, y, 'hero-idle-sheet', 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.anims.play('hero-running')

    this.body.setSize(12, 30)
    // this.body.setOffset(12, 23)
    this.body.setCollideWorldBounds()
    this.body.setMaxVelocity(250, 400)
    this.body.setDragX(750)

    this.keys = scene.cursorKeys
    this.input = {}

    this.setUpAnimations()
    this.setUpMovement()
  }

  setUpAnimations () {
    this.animState = new StateMachine({
      init: 'idle',
      transitions: [
        { name: 'idle', from: ['falling', 'running'], to: 'idle' },
        { name: 'run', from: ['idle'], to: 'running' },
        { name: 'jump', from: ['idle', 'running'], to: 'jumping' },
        { name: 'fall', from: ['idle', 'running', 'jumping'], to: 'falling' }
      ],
      methods: {
        onEnterState: (lifecycle) => {
          this.anims.play(`hero-${lifecycle.to}`)
          console.log(lifecycle)
        }
      }
    })

    this.animsPredicates = {
      idle: () => {
        return this.body.onFloor() && this.body.velocity.x === 0
      },
      run: () => {
        return this.body.onFloor() && Math.sign(this.body.velocity.x) === (this.flipX ? -1 : 1)
      },
      jump: () => {
        return this.body.velocity.y < 0
      },
      fall: () => {
        return this.body.velocity.y > 0
      }
    }
  }

  setUpMovement () {
    this.moveState = new StateMachine({
      init: 'standing',
      transitions: [
        { name: 'jump', from: 'standing', to: 'jumping' },
        { name: 'fall', from: 'standing', to: 'falling' },
        { name: 'touchdown', from: ['jumping', 'falling'], to: 'standing' }
      ],
      methods: {
        onJump: () => {
          this.body.setVelocityY(-400)
        }
      }
    })

    this.movePredicates = {
      jump: () => {
        return this.input.didPressJump
      },
      fall: () => {
        return !this.body.onFloor()
      },
      touchdown: () => {
        return this.body.onFloor()
      }
    }
  }

  preUpdate (time, delta) {
    super.preUpdate(time, delta)

    this.input.didPressJump = Phaser.Input.Keyboard.JustDown(this.keys.up)
    if (this.keys.left.isDown) {
      this.body.setAccelerationX(-1000)
      this.setFlipX(true)
    } else if (this.keys.right.isDown) {
      this.body.setAccelerationX(1000)
      this.setFlipX(false)
    } else {
      this.body.setAccelerationX(0)
    }

    if (this.moveState.is('jumping')) {
      if (!this.keys.up.isDown && this.body.velocity.y < -150) {
        this.body.setVelocityY(-150)
      }
    }

    for (const t of this.animState.transitions()) {
      if (t in this.animsPredicates && this.animsPredicates[t]()) {
        this.animState[t]()
        break
      }
    }

    for (const t of this.moveState.transitions()) {
      if (t in this.movePredicates && this.movePredicates[t]()) {
        this.moveState[t]()
        break
      }
    }
  }
}

export default Hero
