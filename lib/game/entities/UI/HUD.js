/* global ig, EntitySelector, HUD, EntityPlayer */
ig.module(
	'game.entities.UI.HUD'
)
.requires(
	'impact.entity'
)
.defines(function(){
	HUD = ig.Entity.extend({
		// Entity basics
		size: {x: 0, y: 0},
		offset: {x: 0, y: 0},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		// Stat bars
		healthBarFull: new ig.Image('media/healthbar-full.png'),
		healthBarEmpty: new ig.Image('media/healthbar-empty.png'),
		experienceBarEmpty: new ig.Image('media/healthbar-empty.png'),
		experienceBarFull: new ig.Image('media/healthbar-full.png'),

		// Inventory
		inventorySlot: new ig.Image('media/empty-inventory-slot.png'),
		itemSheet: new ig.Image('media/32biticons.jpg'),

		// Mana
		manaIcon: new ig.Image('media/manaIcon.png'),
		ownedBy: null,

		init: function(x, y, settings) {
			this.ownedBy = settings.ownedBy;
			this.size = {x: ig.system.width, y: ig.system.height};
			this.parent(x, y, settings);
		},
		update: function() {
			this.pos.x = ig.game.screen.x;
			this.pos.y = ig.game.screen.y;
			this.parent();
		},
		draw: function() {
			// Draw the heart and number of coins in the upper left corner.
			var x = 16, 
				y = 16;

			this.healthBarFull.draw(x, y);
			let percentHealth = (100 - (this.ownedBy.health/this.ownedBy.maxHealth) * 100);
			if(percentHealth !== 0)
				this.healthBarEmpty.drawTile((x + (100 - percentHealth)), y, 0, percentHealth, 32, true);

			y += 36;
			this.experienceBarEmpty.draw(x, y);
			let percentXP = (this.ownedBy.experience/this.ownedBy.maxExperience) * 100;
			if(percentXP !== 0)
				this.experienceBarFull.drawTile(x, y, 0, percentXP, 32, true);

			// We only want to draw the 0th tile of coin sprite-sheet

			x += 1548;
			this.manaIcon.drawTile(x, y+6, 0, 36);

			x += 42;
			y += 10;

			ig.game.font.draw('x ' + this.ownedBy.mana, x, y)

			if(this.ownedBy instanceof EntityPlayer) {
				x -= 1048;
				y += 800;
				ig.game.font.draw('Inventory', x, y);

				x += 150;
				for(var i = 0; i < this.ownedBy.inventory.length; i++) {
					x += 32;
					let slot = this.ownedBy.inventory[i];
					this.inventorySlot.draw(x, y);
					if(slot.item != null) {
						this.itemSheet.drawTile(x+4, y+4, slot.item.tile, slot.item.tileWidth);
					}
				}
			}

			this.parent();
		}
	});
});