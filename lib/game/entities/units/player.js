/* global ig, EntityItem, EntityFireball, EntityPlayer, EntityBasicSwing */
ig.module(
	'game.entities.units.player'
)
.requires(
	'impact.entity',
	'game.entities.abilities.fireball',
	'game.entities.abilities.basic-swing',
	'impact.debug.debug'
)
.defines(function(){
	//Perhaps we ought to extend this entity to be a hero/master entity later?
	EntityPlayer = ig.Entity.extend({
		size: {x: 40, y: 88},
		offset: {x: 17, y: 10},
		
		maxVel: {x: 400, y: 400},
		friction: {x: 800, y: 800},
		
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		animSheet: new ig.AnimationSheet('media/player.png', 75, 100),
		
		sfxHurt: new ig.Sound('media/sounds/hurt.*'),
		sfxJump: new ig.Sound('media/sounds/jump.*'),
		
		health: 3,
		maxHealth: 3,
		experience: 0,
		maxExperience: 100,

		strength: 1,
		dexterity: 1,
		intelligence: 1,

		flip: false,
		moveVelocity: 800,

		coins: 0,
		mana: 0,

		// Basic dashing
		dashCooldownTime: new ig.Timer(2),
		dashActivationTime: new ig.Timer(0.2),
		dashAmount: 700,
		isDashing: false,
		
		// Inventory
		inventory: new Array(),
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.addAnim('idle', 1, [15,15,15,15,15,14]);
			this.addAnim('run', 0.07, [4,5,11,0,1,2,7,8,9,3]);
			this.addAnim('jump', 1, [13]);
			this.addAnim('fall', 0.4, [13,12], true);
			this.addAnim('pain', 0.3, [6], true);

			ig.game.player = this;

			// Inventory init
			for(let i = 0; i < 6; i++) {
				let itemDebug = null;

				this.inventory.push({
					item: itemDebug
				});
			}
		},
		update: function() {
			this.debug();

			var vel = this.moveVelocity;

			// Dash controls
			if(this.dashCooldownTime.delta() >= 0 && ig.input.state('dash')) {
				this.isDashing = true;
				this.dashActivationTime.reset();
				this.dashCooldownTime.reset();
			}

			if(this.isDashing) {
				if(this.dashActivationTime.delta() <= 0)
					vel += this.dashAmount;
				if(this.dashActivationTime.delta() >= 0) {
					this.isDashing = false;
				}
			}

			// Inventory controls
			let inventoryKey = this.checkInventoryKey();
			if(ig.input.state('dismiss') && inventoryKey > -1) {
				if(this.inventory[inventoryKey].item != null) {
					this.dropItem(inventoryKey);
				}
			}

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
				ig.game.spawnEntity(EntityBasicSwing, 
					this.pos.x+xPosition, 
					this.pos.y+yPosition, 
					{angle:entityAngle, flip:this.flip, ownedBy:this});
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

		giveCoins: function(amount) {
			this.coins += amount;
		},
		giveMana: function(amount) {
			this.mana += amount;
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
		pickupItem: function(item, slot) {
			if(slot != null) {
				if(this.inventory[slot].item != null) {
					this.dropItem(slot);
				}
				this.inventory[slot].item = item;

			} else {
				let unoccupiedSlot = this.findFirstEmptySlot();

				unoccupiedSlot.item = item;
			}
		},
		checkInventoryKey: function() {
			if(ig.input.state('slot1')) {
				return 0;
			}
			if(ig.input.state('slot2')) {
				return 1;
			}
			if(ig.input.state('slot3')) {
				return 2;
			}
			if(ig.input.state('slot4')) {
				return 3;
			}
			if(ig.input.state('slot5')) {
				return 4;
			}
			if(ig.input.state('slot6')) {
				return 5;
			}
			return -1;
		},
		dropItem: function(slot) {
			// Create instance of item
			ig.game.spawnEntity(EntityItem, this.pos.x, this.pos.y+40);

			// Remove from player's inventory
			this.inventory[slot].item = null;
		},
		findFirstEmptySlot: function() {
			return this.inventory.find((val) => {
				return val.item == null;
			});
		},
		gainExperience: function(experience) {
			this.experience += experience;
		},
		levelUp: function() {
			this.experience = 0;
			// .. some kind of incrementer for maxExperience?
			// or do we apply a scale down to other entities?
			// Also, keeping track of how this resource grows is going to be damned important.
			
			this.strength++;
			this.dexterity++;
			this.intelligence++;
		},
		debug() {
			this.dashDebug();
		},
		dashDebug() {
			// ig.show('dash cd timer delta', this.dashCooldownTime.delta().toFixed(2));
			// ig.show('dash activation timer delta', this.dashActivationTime.delta().toFixed(2));
		}
	});
});
