/* global ig, EntitySelector */
ig.module(
	'game.entities.selector'
)
.requires(
	'impact.entity',
	'impact.debug.debug'
)
.defines(function(){
	EntitySelector = ig.Entity.extend({
		size: {x: 1, y: 1},
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.BOTH,
		collides: ig.Entity.COLLIDES.NEVER,

		isClicking: false,
		name: "Selector",

		potentialSelection: [],
		currentSelection: [],

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.ownedBy = settings.ownedBy;
		},
		update: function() {
			// Update the position to follow the mouse cursor.
			let mouseX = ig.input.mouse.x + ig.game.screen.x;
			let mouseY = ig.input.mouse.y + ig.game.screen.y;

			if(this.isClicking) {
				this.pos.x = this.clickLocX;
				this.pos.y = this.clickLocY;
			} else {
				this.pos.x = mouseX;
				this.pos.y = mouseY;
			}

			if(ig.input.pressed('click')) {
				// Save the co-ord of where you initially clicked
				// Allows you to drag and compare to initial click location
				this.isClicking = true;
				this.clickLocX = mouseX;
				this.clickLocY = mouseY;
			} else {
				// We might not have released click
				this.releaseLocX = mouseX;
				this.releaseLocY = mouseY;
			}

			if(ig.input.released('click')) {
				this.isClicking = false;
				this.size.x = 0;
				this.size.y = 0;
			}

			// on top of the sizing, we need to make sure the position is correct.
			// I need to learn how the positioning works in here.
			if(this.releaseLocX && this.clickLocX && this.isClicking)
				this.size.x = this.releaseLocX - this.clickLocX;
			if(this.releaseLocY && this.clickLocY && this.isClicking)
				this.size.y = this.releaseLocY - this.clickLocY;

			// I may need to teach this how to scan for units/buildings
			// after that I can then 'select' them.
			// actually, it looks like a static .checkEntities() method is called on Entity.js
			// wherein it checks all entities against each other, and if 2 entities are overlapping this method is called
			// it eventually calls a.check(b) or b.check(a), unless they actually collide via ACTIVE or FIXED
			// ig.Entity.solveCollision is called.
		},
		draw: function() {
			// Ok, if you wanna draw stuff, gotta do it in the "draw" method.
			if(this.isClicking) {
				ig.system.context.strokeStyle = "#0f0";
				ig.system.context.lineWidth = 1.0;
				ig.system.context.strokeRect(
					ig.system.getDrawPos(this.pos.x - ig.game.screen.x) - 0.5,
					ig.system.getDrawPos(this.pos.y - ig.game.screen.y) - 0.5,
					this.size.x * ig.system.scale,
					this.size.y * ig.system.scale
				);
			}
		},
		check: function(other) {
			// If user is clicking and the 'other' entity has a 'clicked' function
			// resulting in being added to a selection and/or a sound being played.

			// if the other entity has a clickable action
			if(other.clicked) {
				this.potentialSelction.add(other);
				if(this.potentialSelection.indexOf(other) > -1) {
					this.potentialSelectio.remove(other);
				}
				// if the current state is in 'click'
				// or the current state is not in 'click', but they've collided with our selection box..
				// if(ig.input.state('click')) {

				// Ok, if the other entity is within our selector and we JUST released the click button...
				// then we should "click" them.
				
				// Augh.... Gross.
				// if the other entity is inside of this entity, it won't treat it as a collision...
				// which means I'll need to create my own overlap detector...

				// which probably means I need to set a global variable from here and check that on the update function of other entities
				// I think that adds a lot of overhead.
				// It's not a sexy fix because of update. I suppose each entity's update is running 'check' in the background somewhere.

				// Ooh! As it collides, we add a hover action
				// probabaly add it to a potential selection, then make whatever is in the potential selection THE selection when we release the 'click' button.
				// if it's already in the potential selection and we collide with it again, then we remove it.

				// I might be able to create a better 'scanner'.
				if(ig.input.released('click')) {
					other.clicked();
				}
			}
		},
		kill: function() {
			this.parent();
		},
	});
});