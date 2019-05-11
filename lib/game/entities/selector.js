/* global ig, EntitySelector */
ig.module(
	'game.entities.selection'
)
.requires(
	'impact.entity',
	'impact.debug.debug'
)
.defines(function(){
	EntitySelector = ig.Entity.extend({
		size: {x: 1, y: 1},
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.FIXED,
		isClicking: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},
		update: function() {
			// Update the position to follow the mouse cursor.
			this.pos.x = ig.input.mouse.x + ig.game.screen.x;
			this.pos.y = ig.input.mouse.y + ig.game.screen.y;
			this.screenX = ig.input.mouse.x;
			this.screenY = ig.input.mouse.y;

			if(ig.input.pressed('click')) {
				// Save the co-ord of where you initially clicked
				// Allows you to drag and compare to initial click location
				this.isClicking = true;
				this.clickLocX = this.pos.x;
				this.clickLocY = this.pos.y;
			}
			if(ig.input.release('click')) {
				this.isClicking = false;
				this.releaseLocX = this.pos.x;
				this.releaseLocX = this.pos.y;
			}
			// I may need to teach this how to scan for units/buildings
			// after that I can then 'select' them.
			// actually, it looks like a static .checkEntities() method is called on Entity.js
			// wherein it checks all entities against each other, and if 2 entities are overlapping this method is called
			// it eventually calls a.check(b) or b.check(a), unless they actually collide via ACTIVE or FIXED
			// ig.Entity.solveCollision is called.

			// on top of the sizing, we need to make sure the position is correct.
			// I need to learn how the positioning works in here.
			// this.size.x = Math.abs(this.clickLocX - this.releaseLocX); // I don't know if this works?
			// this.size.y = Math.abs(this.clickLocY - this.releaseLocY);
		},
		check: function(other) {
			// If user is clicking and the 'other' entity has a 'clicked' function
			if(ig.input.state('click') && typeof(other.clicked) == 'function') {
				other.clicked();
			}
		},
		kill: function() {
			this.parent();
		},
	});
});