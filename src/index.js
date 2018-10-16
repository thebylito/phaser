import Phaser from 'phaser'
import { Boot, Game, Exemplo } from 'scenes'

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1000,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }
    }
  },
  scene: [
    // Boot,
    // Game
    Exemplo
  ]
}

const game = new Phaser.Game(config) // eslint-disable-line no-unused-vars
