import Phaser from 'phaser'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'Exemplo' })
  }

  preload () {
    this.load.setBaseURL('http://labs.phaser.io')
    this.load.image('sky', 'assets/skies/space3.png')
    this.load.image('logo', 'assets/sprites/phaser3-logo.png')
    this.load.image('red', 'assets/particles/red.png')
  }

  create () {
    this.add.image(400, 300, 'sky')
    var particles = this.add.particles('red')
    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    })
    const logo = this.physics.add.image(400, 100, 'logo')
    logo.setVelocity(100, 200)
    logo.setBounce(1, 1)
    logo.setCollideWorldBounds(true)
    emitter.startFollow(logo)
  }

  update () {
    // console.log('uppdate')
    const cursors = this.input.keyboard.createCursorKeys()
    if (cursors.left.isDown) {
      console.log('Esquerda')
    } else if (cursors.right.isDown) {
      console.log('Direita')
    } else if (cursors.up.isDown) {
      console.log('Cima')
    } else if (cursors.down.isDown) {
      console.log('Baixo')
    }
  }
}
