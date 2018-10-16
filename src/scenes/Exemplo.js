import Phaser from 'phaser'
import sky from 'images/sky.png'
import bomb from 'images/bomb.png'
import ground from 'images/platform.png'
import star from 'images/star.png'
import dude from 'images/dude.png'
import io from 'socket.io-client'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'Exemplo' })
    this.score = 0
    this.scoreText = ''
    this.gameOver = false
    this.players = {}
  }

  preload () {
    // this.load.setBaseURL('http://labs.phaser.io')
    this.load.image('sky', sky)
    this.load.image('ground', ground)
    this.load.image('star', star)
    this.load.image('bomb', bomb)
    this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 })
  }

  addPlayer (playerInfo, platforms) {
    this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude')
    this.player.setBounce(0.2)
    this.player.setTint(0x25c533)
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, platforms)
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    )
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
  }

  collectStar (player, star) {
    star.disableBody(true, true)
    console.log(star)
    this.socket.emit('starCollect', { x: star.x, y: star.y, name: star.name })
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)
    /*     if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true)
      })
    } */
  }
  hitBomb (player, bomb) {
    this.physics.pause()
    player.setTint(0xff0000)
    player.anims.play('turn')
    this.gameOver = true
  }

  newBomb () {
    const bomb = this.bombs.create(500, 16, 'bomb')
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    bomb.allowGravity = false
  }

  addOtherPlayers (playerInfo, platforms) {
    // const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'dude').setOrigin(0.5, 0.5).setDisplaySize(53, 40)
    const otherPlayer = this.physics.add.sprite(100, 450, 'dude')
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff)
    } else {
      otherPlayer.setTint(0x7a7a7a)
    }
    otherPlayer.setBounce(0.2)
    // otherPlayer.setCollideWorldBounds(true)
    this.physics.add.collider(otherPlayer, platforms)
    /*   this.physics.add.overlap(
        otherPlayer,
        this.stars,
        this.collectStar,
        null,
        this
      ) */
    // this.physics.add.collider(otherPlayer, this.bombs, this.hitBomb, null, this)

    otherPlayer.playerId = playerInfo.playerId
    this.otherPlayers.add(otherPlayer)
  }

  create () {
    this.otherPlayers = this.physics.add.group()
    this.socket = io(IS_DEV ? '10.100.53.146:3001' : '')
    this.socket.on('currentPlayers', (players) => {
      this.socket.emit('getStars')
      Object.keys(players).forEach((id) => {
        if (players[id].playerId === this.socket.id) {
          this.addPlayer(players[id], platforms)
        } else {
          this.addOtherPlayers(players[id], platforms)
        }
      })
    })
    this.socket.on('newPlayer', (playerInfo) => {
      this.addOtherPlayers(playerInfo, platforms)
    })
    this.socket.on('newBomb', () => {
      this.newBomb()
    })
    this.socket.on('disconnect', (playerId) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy()
        }
      })
    })
    this.socket.on('playerMoved', (playerInfo) => {
      /*       this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y)
        }
      }) */

      Object.keys(playerInfo).forEach(movement => {
        const play = playerInfo[movement]
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (play.playerId === otherPlayer.playerId) {
            otherPlayer.setPosition(play.x, play.y)
          }
        })
      })
    })
    this.socket.on('removeStarAll', ({ name }) => {
      this.stars.getChildren().forEach((star) => {
        if (star.name === name) {
          star.destroy()
        }
      })
    })
    this.socket.on('currentStars', (stars) => {
      this.stars = this.physics.add.group()
      stars.forEach(starI => { // .create(0, 0, 'bullet');
        const starItem = this.stars.create(starI.x, starI.y, 'star')
        starItem.name = starI.name
        // starItem.enableBody = true
        // starItem.body.allowGravity = false
        starItem.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        this.physics.add.collider(starItem, platforms)
      })
      this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)
      /*       this.stars.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
      }) */
    })

    this.add.image(460, 300, 'sky').setScale(2)

    const platforms = this.physics.add.staticGroup()

    platforms
      .create(400, 600, 'ground')
      .setScale(3)
      .refreshBody()

    platforms.create(50, 250, 'ground')
    platforms.create(340, 120, 'ground').setScale(0.5).refreshBody()
    platforms.create(200, 350, 'ground').setScale(0.5).refreshBody()
    platforms.create(760, 230, 'ground')
    platforms.create(800, 400, 'ground')

    // this.player = this.physics.add.sprite(100, 450, 'dude')
    // this.player.setBounce(0.2)
    // this.player.setCollideWorldBounds(true)
    // this.physics.add.collider(this.player, platforms)

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    })

    /*  this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    })

    this.stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })
    this.physics.add.collider(this.stars, platforms)
     */
    /*  this.physics.add.overlap(
       this.player,
       this.stars,
       this.collectStar,
       null,
       this
     ) */
    this.scoreText = this.add.text(16, 16, 'score: 0', {
      fontSize: '32px',
      fill: '#000'
    })
    this.bombs = this.physics.add.group()

    this.physics.add.collider(this.bombs, platforms)

    // this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
  }

  update () {
    const cursors = this.input.keyboard.createCursorKeys()
    if (this.player) {
      const { x, y } = this.player
      if (cursors.left.isDown) {
        this.player.setVelocityX(-160)
        this.player.anims.play('left', true)
      } else if (cursors.right.isDown) {
        this.player.setVelocityX(160)
        this.player.anims.play('right', true)
      } else {
        this.player.setVelocityX(0)
        this.player.anims.play('turn')
      }
      if (cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330)
      }
      if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
        this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y })
      }
      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y
      }
    }
  }
}
