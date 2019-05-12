/* global ig, EntityBlob, EntityMaster, EntityFireball */
ig.module(
	'game.entities.units.blob'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityBlob = ig.Entity.extend({
		size: {x: 40, y: 28},
		offset: {x: 24, y: 0},
		maxVel: {x: 100, y: 100},
		friction: {x: 150, y: 0},
		experienceGiven: 25,
		
		type: ig.Entity.TYPE.B, // Evil enemy group
		checkAgainst: ig.Entity.TYPE.BOTH, // Check against friendly
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		health: 3,
		
		speed: 36,
		flip: false,
		isSelected: false,
		
		animSheet: new ig.AnimationSheet('media/blob.png', 64, 28),
		sfxSpawn: new ig.Sound('media/sounds/fireball.*'),
		sfxDie: new ig.Sound('media/sounds/blob-die.*'),
		
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.addAnim('crawl', 0.2, [0,1]);
			this.addAnim('dead', 1, [2]);
		},
		update: function() {
			// Near an edge? return!
			if(!ig.game.collisionMap.getTile(
					this.pos.x + (this.flip ? +4 : this.size.x -4),
					this.pos.y + this.size.y+1
				)
			) {
				this.flip = !this.flip;
				
				// We have to move the offset.x around a bit when going
				// in reverse direction, otherwise the blob's hitbox will
				// be at the tail end.
				this.offset.x = this.flip ? 0 : 24;
			}
			
			var xdir = this.flip ? -1 : 1;
			this.vel.x = this.speed * xdir;
			this.currentAnim.flip.x = !this.flip;
			
			this.parent();
		},
		kill: function(xpCallback) {
			this.sfxDie.play();
			this.parent();
		},
		handleMovementTrace: function(res) {
			this.parent(res);
			
			// Collision with a wall? return!
			if(res.collision.x) {
				this.flip = !this.flip;
				this.offset.x = this.flip ? 0 : 24;
			}
		},
		check: function(other) {
			if(!(other instanceof EntityMaster || other.ownedBy instanceof EntityMaster))
				other.receiveDamage(1, this);
		},
		receiveDamage: function(amount, from, xpCallback) {
			let healthCheck = this.health - amount;
			if(healthCheck <= 0 && xpCallback) {
				xpCallback();
			}
			this.parent(amount, from);
		},
		clicked: function() {
			// this is in the direction of the current 'right' way to do it.
			// but I'm going to add a timeout of a second so I can keep rapidly testing.
			if(!this.isSelected) {
				this.isSelected = true;
				this.sfxSpawn.play();
				setTimeout(function() {
					this.isSelected = false;
				}.call(this), 1000);
			}
		}
	});
});