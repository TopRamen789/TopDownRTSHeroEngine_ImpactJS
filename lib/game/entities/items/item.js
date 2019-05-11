/* global ig, EntityItem, EntityPlayer */
ig.module(
	'game.entities.items.item'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityItem = ig.Entity.extend({
		size: {x: 36, y: 36},
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A, // Check against friendly
		collides: ig.Entity.COLLIDES.NEVER,
		
		animSheet: new ig.AnimationSheet('media/32biticons.jpg', 24, 24),
		sfxCollect: new ig.Sound('media/sounds/coin.*'),
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.addAnim('idle', 1, [0]);
		},
		update: function() {
			// Do nothing in this update function; don't even call this.parent().
			// The coin just sits there, isn't affected by gravity and doesn't move.

			// We still have to update the animation, though. This is normally done
			// in the .parent() update:
			this.currentAnim.update();
		},
		check: function(other) {
			// The instanceof should always be true, since the player is
			// the only entity with TYPE.A - and we only check against A at the moment.
			if(other instanceof EntityPlayer) {
				let inventoryKey = other.checkInventoryKey();
				if(ig.input.state('assign')) {
					let item = {
						tile: 0,
						tileWidth: 24
					};

					if(inventoryKey > -1) {
						other.pickupItem(item, inventoryKey);
					} else {
						other.pickupItem(item);
					}

					this.sfxCollect.play();
					this.kill();
				}
			}
		}
	});
});