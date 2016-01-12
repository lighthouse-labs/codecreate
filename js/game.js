var map, layer, cursors, originalSettings,
		elements = {
			player: null,
			aliens: null,
			explosions: null,
			livingEnemies: [],
			holes: null,
			scoreString: 'Kill Streak : ',
			scoreText: null,
			score: 0,
			levelString: 'Level : ',
			levelText: null,
			level: 1
		},
		projectiles = {
			bullet: null,
			bullets: null,
			enemyBullet: null,
			enemyBullets: null,
			bulletTime: 0,
			firingTimer: 0,
			bulletWall: function(bullet, layer) {
				bullet.kill();
			},
		},
		methods = {
			validateSettings: function() {
				if (settings.enemy_fire_speed() <= 0) {
					settings.enemy_fire_speed = function() { return 20; };
				}	

				if (settings.enemy_fire_speed() > 5000) {
					settings.enemy_fire_speed = function() { return 5000; };
				}

				if (settings.fire_speed <= 0) {
					settings.fire_speed = 20;
				}	

				if (settings.fire_speed > 5000) {
					settings.fire_speed = 5000;
				}

				if (typeof settings.show_lights != 'boolean') {
					settings.show_lights = true;
				}

				if (typeof settings.ship != 'number' || settings.ship < 1 || settings.ship > 3) {
					settings.ship = 2;
				}

				if (settings.ship_speed < 10 || settings.ship_speed > 1000) {
					settings.ship_speed = 200;
				}

				originalSettings = settings;
			},	
			preload: function() {
				game.load.tilemap('map', 'assets/hoc.json', null, Phaser.Tilemap.TILED_JSON);
                
				game.load.spritesheet('kaboom', 'images/explode.png', 128, 128);
				game.load.image('ground_1x1', 'images/ground_1x1.png');
				game.load.image('walls_1x2', 'images/walls_1x2.png');
				game.load.image('tiles2', 'images/tiles2.png');
                
                // this is your spaceship
				game.load.image('spaceship', 'images/ship2.png');
                // you could instead change it to something else, for example:
                // game.load.image('spaceship', 'images/horse.png');
                
				game.load.spritesheet('invader', 'images/invader32x32x4.png', 32, 32);
                // this is the enemy. you can change it to something else:
                //game.load.image('invader', 'images/emoji/460.png');
                
                // this is the bullet your ship fires
				game.load.image('bullet', 'images/bullets.png');
                
                // this is the bullet that enemies fire
				game.load.image('enemyBullet', 'images/enemy-bullet.png');
                
				game.load.image('wormhole', 'images/wormhole.png');
			},
			fireBullet: function() {
				if (game.time.now > projectiles.bulletTime) {
					//projectiles.bullet = projectiles.bullets.getFirstExists(false);
					projectiles.bullet = projectiles.bullets.getFirstDead();

					if (projectiles.bullet) {
						projectiles.bullet.reset(elements.player.body.x + 2, elements.player.body.y + 4);
						projectiles.bullet.lifespan = 2000;
						projectiles.bullet.rotation = elements.player.rotation;
						game.physics.arcade.velocityFromRotation(elements.player.rotation, settings.bullet_speed, projectiles.bullet.body.velocity);
						projectiles.bulletTime = game.time.now + settings.fire_speed;
					}
				}
			},
			makeExplosions: function() {
				//  An explosion pool
				elements.explosions = game.add.group();
				elements.explosions.createMultiple(30, 'kaboom');
				elements.explosions.forEach(methods.setupInvader, this);
			},
			makeBullets: function() {
				//  Our ships bullets
				projectiles.bullets = game.add.group();
				projectiles.bullets.enableBody = true;
				projectiles.bullets.physicsBodyType = Phaser.Physics.ARCADE;

				//  All 40 of them
				projectiles.bullets.createMultiple(100, 'bullet');
				projectiles.bullets.setAll('anchor.x', 0.5);
				projectiles.bullets.setAll('anchor.y', 0.5);

				// The enemy's bullets
				projectiles.enemyBullets = game.add.group();
				projectiles.enemyBullets.enableBody = true;
				projectiles.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
				projectiles.enemyBullets.createMultiple(100, 'enemyBullet');
				projectiles.enemyBullets.setAll('anchor.x', 0.5);
				projectiles.enemyBullets.setAll('anchor.y', 1);
				projectiles.enemyBullets.setAll('outOfBoundsKill', true);
				projectiles.enemyBullets.setAll('checkWorldBounds', true);
			},
			create: function() {
				//  This will run in Canvas mode, so let's gain a little speed and display
				game.renderer.clearBeforeRender = false;
				game.renderer.roundPixels = true;
				game.physics.startSystem(Phaser.Physics.ARCADE);
				
				methods.makeBullets();

				map = game.add.tilemap('map');

				map.addTilesetImage('ground_1x1');
				map.addTilesetImage('walls_1x2');
				map.addTilesetImage('tiles2');

				map.setCollisionBetween(1, 12);

				layer = map.createLayer('Tile Layer 1');
				layer.resizeWorld();
				layer.debugSettings.forceFullRedraw = true;

				if (settings.show_lights) {
					var layer3 = map.createLayer('Tile Layer 3');
				}

				elements.player = game.add.sprite(60, 260, 'spaceship');
				elements.player.width = settings.spaceship_width;
				elements.player.height = settings.spaceship_height;
                
				elements.player.anchor.set(0.5);
				game.physics.enable(elements.player);

				elements.player.body.setSize(16, 16, 0, 0);


				//We'll set a lower max angular velocity here to keep it from going totally nuts
				elements.player.body.maxAngular = 500;

				//Apply a drag otherwise the sprite will just spin and never slow down
				elements.player.body.angularDrag = 50;

				game.camera.follow(elements.player);

				elements.holes = game.add.group();
				elements.holes.enableBody = true;
				elements.holes.physicsBodyType = Phaser.Physics.ARCADE;

				cursors = game.input.keyboard.createCursorKeys();

				methods.createAliens();
				methods.makeExplosions();
				methods.setupText();
			},
			setupText: function() {
				elements.scoreText = game.add.text(15, 600, elements.scoreString + elements.score, { font: '25px Arial', fill: '#fff' });
				elements.levelText = game.add.text(250, 600, elements.levelString + elements.level, { font: '25px Arial', fill: '#fff' });
				elements.scoreText.fixedToCamera = true;
				elements.levelText.fixedToCamera = true;
			},
			render: function() {
		//		game.debug.body(sprite);
			},
			update: function() {
				game.physics.arcade.collide(elements.player, layer);

				elements.player.body.velocity.x = 0;
				elements.player.body.velocity.y = 0;
				elements.player.body.angularVelocity = 0;
				if (cursors.left.isDown) {
					elements.player.body.angularVelocity = -200;
				}
				if (cursors.right.isDown) {
					elements.player.body.angularVelocity = 200;
				}
				if (cursors.up.isDown) {
					game.physics.arcade.velocityFromAngle(elements.player.angle, settings.ship_speed, elements.player.body.velocity);
				}
				if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
					methods.fireBullet();
				}

				if (game.time.now > projectiles.firingTimer) {
					methods.enemyFires();
				}

				methods.initCollisions();
			},
			initCollisions: function() {
				 //  Run collision
				game.physics.arcade.overlap(projectiles.bullets, elements.aliens, methods.collisionHandler, null, this);
				game.physics.arcade.overlap(projectiles.enemyBullets, elements.player, methods.enemyHitsPlayer, null, this);
				game.physics.arcade.collide(layer, projectiles.bullets, projectiles.bulletWall, null, this);
				game.physics.arcade.collide(layer, projectiles.enemyBullets, projectiles.bulletWall, null, this);
				game.physics.arcade.collide(elements.player, elements.aliens, methods.playerAlienCollision, null, this);
				game.physics.arcade.overlap(elements.holes, elements.player, methods.teleport, null, this);
			},
			explode: function(which) {
				// Create an explosion :)
				var explosion = elements.explosions.getFirstExists(false);
				explosion.reset(which.body.x, which.body.y);
				explosion.play('kaboom', 30, false, true);
			},
			playerAlienCollision: function(player, alien) {
				alien.kill();
				player.kill();

				// Create some explosions :)
				methods.explode(alien);
				methods.explode(player);

				//Restart
				methods.restart(true);
			},
			collisionHandler: function(bullet, alien) {
				// When a bullet hits an alien we kill them both
				var x = alien.body.x;
				var y = alien.body.y;

				bullet.kill();
				alien.kill();

				methods.explode(alien);
				elements.score++;
				elements.scoreText.text = elements.scoreString + elements.score;

				if (elements.aliens.countLiving() == 0) {
					//Wormhole goes here
					methods.enableWormhole(x, y);

					projectiles.enemyBullets.callAll('kill',this);
				}
			},
			enemyHitsPlayer: function(player,bullet) {
				bullet.kill();

				//  And create an explosion :)
				methods.explode(player);
				methods.restart(true);
			},
			enemyFires: function() {
				//  Grab the first bullet we can from the pool
				projectiles.enemyBullet = projectiles.enemyBullets.getFirstExists(false);

				elements.livingEnemies.length=0;

				elements.aliens.forEachAlive(function(alien){
					// put every living enemy in an array
					elements.livingEnemies.push(alien);
				});


				if (projectiles.enemyBullet && elements.livingEnemies.length > 0) {
					var random=game.rnd.integerInRange(0,elements.livingEnemies.length-1);

					// randomly select one of them
					var shooter=elements.livingEnemies[random];
					// And fire the bullet from this enemy
					projectiles.enemyBullet.reset(shooter.body.x + shooter.body.width/2, shooter.body.y + shooter.body.height/2);

					game.physics.arcade.moveToObject(projectiles.enemyBullet, elements.player, 120);
					projectiles.firingTimer = game.time.now + settings.enemy_fire_speed();
				}
			},
			restart: function(reset) { //  A new level starts
				reset = reset || false; //Default value
				if (reset) {
					elements.score = 0;
					elements.scoreText.text = elements.scoreString + elements.score;
					elements.level = 1;
					elements.levelText.text = elements.levelString + elements.level;
					settings = originalSettings;
				}	
				projectiles.bullets.callAll('kill', this);
				projectiles.enemyBullets.callAll('kill', this);

				elements.aliens.removeAll();

				//Bring them back!
				methods.createAliens();

				elements.player.kill();
				elements.holes.removeAll();	

				//revives the player
				elements.player.revive();
				elements.player.body.x = 60;
				elements.player.body.y = 260;
			},
			createAliens: function() {
				//  The baddies!
				elements.aliens = game.add.group();
				elements.aliens.enableBody = true;
				elements.aliens.physicsBodyType = Phaser.Physics.ARCADE;

				for (var i = 0; i < settings.positions.length; i++) {
					var x = settings.positions[i][0];
					var y = settings.positions[i][1];	
					var alien = elements.aliens.create(x, y, 'invader');
					alien.anchor.setTo(0.5, 0.5);
					try {
					 alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
					} catch(e) {}
                    
					alien.play('fly');
					alien.body.moves = false;
					game.add.tween(alien).to( { x: alien.x + 25 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
                    
					//THIS IS A BUG!! Look at the tech_summit.js file and
					//figure out what value SHOULD go here.
					alien.width = settings.spaceship_width;
					alien.height = settings.spaceship_height;
				}
			},
			enableWormhole: function(x, y) {
				var wh = elements.holes.create(x, y, 'wormhole');
				wh.anchor.setTo(0.2, 0.2);
				wh.body.setSize(80, 80, 30, 30);
			},
			teleport: function(player, wormhole) {
				settings.fire_speed *= 0.9;
				var speed = settings.enemy_fire_speed();
				settings.enemy_fire_speed = function() { return speed * 1.1; };
				elements.level++;
				elements.levelText.text = elements.levelString + elements.level;
				methods.restart(false);
			},
			setupInvader: function(invader) {
				invader.anchor.x = 0.5;
				invader.anchor.y = 0.5;
				invader.animations.add('kaboom');
			}
	};

//Prevent spacebar from scrolling page
window.onkeydown = function(e) {
	if(e.keyCode == 32 && e.target == document.body) {
		e.preventDefault();
		return false;
	}
};

methods.validateSettings();
var game = new Phaser.Game(1024, 625, Phaser.AUTO, 'wormhole', methods);
