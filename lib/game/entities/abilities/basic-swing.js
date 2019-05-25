/* global ig, EntityBasicSwing, BasicStructure */
ig.module(
	'game.entities.abilities.basic-swing'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){
	EntityBasicSwing = ig.Entity.extend({
		_wmIgnore: true, // This entity will not be available in Weltmeister

		size: {x: 48, y: 64},
		offset: {x: 6, y: 6},
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
		collides: ig.Entity.COLLIDES.ACTIVE,

		animSheet: new ig.AnimationSheet('media/swing.png', 64, 64),
		sfxSpawn: new ig.Sound('media/sounds/fireball.*'),
		
		// So, if we want to make it a part of the EntityPool, we need to make sure this 
		// timer doesn't kill all instances of this entity.
		// But it should get 'killed' almost immediately after it spawns.
		// With the timer being short enough,
		// you can spam it w/out having to worry about creating multiple copies.
		activationTime: new ig.Timer(0.1),
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);
			this.ownedBy = settings.ownedBy;
			this.addAnim('idle', 1, [0]);
			this.sfxSpawn.play();
			this.angle = settings.angle;
		},
		reset: function(x, y, settings) {
			// This function is called when an instance of this class is resurrected
			// from the entity pool. (Pooling is enabled at the bottom of this file).
			this.parent(x, y, settings);
			this.sfxSpawn.play();
			this.activationTime.reset();
		},
		update: function() {
			this.parent();
			this.currentAnim.angle = this.angle;
			if(this.activationTime.delta() >= 0)
				this.kill();
		},
		// This function is called when this entity overlaps anonther entity of the
		// checkAgainst group. I.e. for this entity, all entities in the B group.
		check: function(other) {
			if(other instanceof BasicStructure) {
				other.ownedBy = this.ownedBy;
			} else {
				let xpCallback = () => { this.ownedBy.gainExperience(other.experienceGiven) };
				other.receiveDamage(1, this, xpCallback);
				this.kill();
			}
		}
	});

	// If you have an Entity Class that instanced and removed rapidly, such as this 
	// Fireball class, it makes sense to enable pooling for it. This will reduce
	// strain on the GarbageCollector and make your game a bit more fluid.

	// With pooling enabled, instances that are removed from the game world are not 
	// completely erased, but rather put in a pool and resurrected when needed.

	ig.EntityPool.enableFor(EntityBasicSwing);
});
