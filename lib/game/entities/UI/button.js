/* global ig, Button */
ig.module(
	'game.entities.UI.button'
)
.requires(
	'impact.entity'
)
.defines(function(){
	Button = ig.Entity.extend({
		// Ok, it's ok if there's a button entity.
		// But the button should not be owned by the unit or structure.
		// I think instead, we get the types of the button or unit,
		// then render the buttons for the given type from a different lookup, perhaps by race,
		// then if I wanted to add some localization, I could add another layer between the race and the given button.

		// Entity basics
		size: {x: 0, y: 0},
		offset: {x: 0, y: 0},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,

		icon: new ig.Image('media/blob.png'),
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},
		update: function() {
			this.parent();
		},
		draw: function() {
			// I could make it so that buttons are a set width and height
			// then we just feed in the x and y positions.
			this.icon.drawTile(this.pos.x, this.pos.y, 0, 64, 28);
			this.parent();
		}
	});
});