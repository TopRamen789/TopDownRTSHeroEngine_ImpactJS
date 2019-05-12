// this and player.js should inherit from a similar entity.

/* global ig, EntityItem, EntityFireball, EntityMaster, EntityBasicSwing, EntityStructure, EntityBlob, EntitySelector */
ig.module(
	'game.entities.units.master'
)
.requires(
	'impact.entity',
	'game.entities.abilities.fireball',
	'game.entities.selector',
	'impact.debug.debug'
)
.defines(function(){
	//Perhaps we ought to extend this entity to be a hero/master entity later?
	EntityMaster = ig.Entity.extend({
		size: {x: 40, y: 88},
		offset: {x: 17, y: 10},
		
		maxVel: {x: 400, y: 400},
		friction: {x: 800, y: 800},
		
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		animSheet: new ig.AnimationSheet('media/player.png', 75, 100),
		
		sfxHurt: new ig.Sound('media/sounds/hurt.*'),
		sfxJump: new ig.Sound('media/sounds/jump.*'),
		
		health: 3,
		mana: 0,

		flip: false,
		moveVelocity: 2400,
		name: "Master",

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.addAnim('idle', 1, [15,15,15,15,15,14]);
			this.addAnim('run', 0.07, [4,5,11,0,1,2,7,8,9,3]);
			this.addAnim('jump', 1, [13]);
			this.addAnim('fall', 0.4, [13,12], true);
			this.addAnim('pain', 0.3, [6], true);

			// what exactly is this?
			ig.game.player = this;
			this.initSelector();
		},
		update: function() {
			this.debug();

			var vel = this.moveVelocity;

			// Normal controls
			// The angle looks super wonky.
			// and this should be stored in a variable, instead of actually changing the animation's angle
			// that way, the angle comes out correctly on the spawned entity.
			// it will also help if you draw all of your entities at the same angles,
			// so that you won't have to finagle shit like you did in the 'shoot' condition.
			if(ig.input.state('left')) {
				this.currentAnim.angle = 1.5708;
				this.vel.x = -vel;
				this.flip = true;
			}
			if(ig.input.state('right')) {
				this.currentAnim.angle = -1.5708;
				this.vel.x = vel;
				this.flip = false;
			}
			if(ig.input.state('up')) {
				this.currentAnim.angle = 3.14159;
				this.vel.y = -vel;
			}
			if(ig.input.state('down')) {
				this.currentAnim.angle = 0;
				this.vel.y = vel;
			}

			// 0.78539 diagonal left down
			// 2.35619 diagonal left up
			// -2.35619 diagonal right up
			// -0.75839 diagonal right down
			
			if(!ig.input.state('left')
				&& !ig.input.state('right')
				&& !ig.input.state('up')
				&& !ig.input.state('down')) {
				this.vel.x = 0;
				this.vel.y = 0;
			}
			
			// Fire controls
			if(ig.input.pressed('shoot')) {
				// this is so ugly, there's a better way to do this.
				// in fact, there most certainly is, this doesn't account for 8 way attacking,
				// it's just 4 way, you have to keep backing up then positioning yourself correctly so you can hit enemies because 4-way is awkward.
				let entityAngle = -1*this.currentAnim.angle;
				let positionChanger = -1*this.currentAnim.angle > -1 ? 1 : -1;
				if(this.currentAnim.angle == 3.14159) {
					entityAngle = 0;
				} else if(this.currentAnim.angle == 0) {
					entityAngle = 3.14159;
				}
				let xPosition = this.currentAnim.angle == 1.5708 || this.currentAnim.angle == -1.5708 ? (100 * positionChanger) : 0;
				let yPosition = this.currentAnim.angle == 3.14159 || this.currentAnim.angle == 0 ? (100 * positionChanger) : 0;
				ig.game.spawnEntity(EntityFireball, 
					this.pos.x+xPosition, 
					this.pos.y+yPosition, 
					{angle:entityAngle, flip:this.flip, ownedBy:this});
			}

			if(ig.input.pressed('build_structure')) {
				ig.game.spawnEntity(EntityStructure, this.pos.x+60, this.pos.y, {ownedBy:this});
			}
			if(ig.input.pressed('build_unit')) {
				ig.game.spawnEntity(EntityBlob, this.pos.x+60, this.pos.y, {ownedBy:this});
			}

			// Experience
			if(this.experience >= this.maxExperience) {
				this.levelUp();
			}

			// Damage, Idle, Fall animations
			if(
				this.currentAnim == this.anims.pain &&
				this.currentAnim.loopCount < 1
			) {
				if(this.health <= 0) {
					var dec = (1/this.currentAnim.frameTime) * ig.system.tick;
					this.currentAnim.alpha = (this.currentAnim.alpha - dec).limit(0,1);
				}
			}
			else if(this.health <= 0) {
				this.kill();
			}
			else if(this.vel.y < 0) {
				this.currentAnim = this.anims.jump;
			}
			else if(this.vel.y > 0) {
				if(this.currentAnim != this.anims.fall) {
					this.currentAnim = this.anims.fall.rewind();
				}
			}
			else if(this.vel.x != 0) {
				this.currentAnim = this.anims.run;
			}
			else {
				this.currentAnim = this.anims.idle;
			}
			
			this.currentAnim.flip.x = this.flip;
			
			this.parent();
		},
		kill: function() {
			this.parent();

			ig.game.reloadLevel();
		},
		receiveDamage: function(amount, from) {
			if(this.currentAnim == this.anims.pain) {
				return;
			}

			this.health -= amount;
			this.currentAnim = this.anims.pain.rewind();

			this.vel.x = (from.pos.x > this.pos.x) ? -400 : 400;
			this.vel.y = -300;
			
			this.sfxHurt.play();
		},
		giveMana: function(amount) {
			this.mana += amount;
		},
		initSelector() {
			this.selector = ig.game.spawnEntity(EntitySelector, this.pos.x, this.pos.y, { ownedBy: this });
		},
		debug: function() {
			//
		}
	});
});