/* global ig, EntitySelector, HUD, EntityPlayer */
ig.module(
	'game.entities.UI.HUD'
)
.requires(
	'impact.entity',
	'game.entities.UI.buttonmapping'
)
.defines(function(){
	HUD = ig.Entity.extend({
		// Ok, how exactly should this work?
		// Do I put selector as the parent of this?
		// That doesn't sound quite right..
		// I think that selector and HUD should be children of the player entity
		// maybe the selector should be a child of the HUD.


		// Entity basics
		size: {x: 0, y: 0},
		offset: {x: 0, y: 0},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		// Empty HUD
		emptyHUD: new ig.Image('media/simple HUD.png'),

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
		imageArray: [],
		currentSet: [],

		init: function(x, y, settings) {
			this.ownedBy = settings.ownedBy;
			this.selector = ig.game.spawnEntity(EntitySelector, settings.ownedBy.pos.x, settings.ownedBy.pos.y, { ownedBy: settings.ownedBy });
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
			let position = {
					x: 16,
					y: 16
				}

			this.healthBarFull.draw(position.x, position.y);
			let percentHealth = (100 - (this.ownedBy.health/this.ownedBy.maxHealth) * 100);
			if(percentHealth !== 0)
				this.healthBarEmpty.drawTile((position.x + (100 - percentHealth)), position.y, 0, percentHealth, 32, true);

			position.y += 36;
			this.experienceBarEmpty.draw(position.x, position.y);
			let percentXP = (this.ownedBy.experience/this.ownedBy.maxExperience) * 100;
			if(percentXP !== 0)
				this.experienceBarFull.drawTile(position.x, position.y, 0, percentXP, 32, true);

			position.x += 1048;
			this.manaIcon.drawTile(position.x, position.y + 6, 0, 36);

			position.x += 42;
			position.y += 10;

			ig.game.font.draw('x ' + this.ownedBy.mana, position.x, position.y);

			position.y += 400;

			this.emptyHUD.draw(position.x, position.y);

			// Man, I feel like this could be so much better.
			// Right now, it feels pretty crap.
			this.selector.currentSelection.forEach((entity) => {
				position.y += 12;
				position.x += 12;
				// each selectable should have a draw hud method.
				// for now only render structure HUD.
				this.setupHUD(entity, position);
			});

			this.imageArray.forEach((val) => {
				val.image.drawTile(val.position.x, val.position.y, 0, val.size.x, val.size.y);
			});

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
						this.itemSheet.drawTile(x + 4, y + 4, slot.item.tile, slot.item.tileWidth);
					}
				}
			}

			this.parent();
		},
		// Ok, I think I lost my way.
		// I need to stop and think about this a little more.
		setupHUD: function(entity, position) {
			ButtonMapping.entities[entity.name].ui.forEach((val) => {
				// Only insert distinct values into imageArray.
				if(this.imageArray.length > 0) {
					for(var i = 0; i < this.imageArray.length; i++) {
						var icon = this.imageArray[i];
						var insertIntoArray = true;
						if(val.icon.image === icon.name) {
							insertIntoArray = false;
						}
					}
					if(insertIntoArray) {
						this.imageArray.push({
							name: val.icon.image,
							image: new ig.Image(val.icon.image),
							position: {
								x: position.x,
								y: position.y
							},
							size: {
								x: val.icon.size.x,
								y: val.icon.size.y
							}
						});
					}
				} else {
					this.imageArray.push({
						name: val.icon.image,
						image: new ig.Image(val.icon.image),
						position: {
							x: position.x,
							y: position.y
						},
						size: {
							x: val.icon.size.x,
							y: val.icon.size.y
						}
					});
				}
			});
		}
	});
});