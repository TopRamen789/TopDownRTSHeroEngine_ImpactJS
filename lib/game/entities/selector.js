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

		initialPosition: {x: 0, y: 0},
		currentPosition: {x: 0, y: 0},


		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.ownedBy = settings.ownedBy;
		},
		update: function() {
			let mouse = {
				x: ig.input.mouse.x + ig.game.screen.x,
				y: ig.input.mouse.y + ig.game.screen.y
			}

			if(this.isClicking) {
				this.pos.x = this.initialPosition.x;
				this.pos.y = this.initialPosition.y;
			} else {
				this.pos.x = mouse.x;
				this.pos.y = mouse.y;
			}

			if(ig.input.pressed('click')) {
				// Save the co-ord of where you initially clicked
				// Allows you to drag and compare to initial click location
				this.isClicking = true;
				this.initialPosition.x = mouse.x;
				this.initialPosition.y = mouse.y;
			} else {
				// Didn't push lmb? Get current position.
				this.currentPosition.x = mouse.x;
				this.currentPosition.y = mouse.y;
			}

			if(ig.input.released('click')) {
				this.isClicking = false;
				this.size.x = 0;
				this.size.y = 0;

				// don't reset selecions unless there actually are possible buildings/units in the potential selection.
				if(this.potentialSelection.length > 0) {
					// clear the current selection and set it to the new current selection.
					// clear old potential selection since it is now the current selection.
					this.currentSelection = [];
					this.currentSelection = this.potentialSelection.slice();
					this.potentialSelection = [];

					this.currentSelection.forEach((val) => {
						val.clicked();
					});
				}
			}

			// Have to make the position of this entity always the top left most corner.

			// E.g.
			// Say you have x size -10 and x position 20 on one entity.
			// then you have x size 10 and x position 9 on other entity.
			// The other entity has a position of 19 max on it's right most side
			// while the original entity has a technical left most position of 10,
			// impact only tests against the left side of the original entity by looking at the x position,
			// thus 19 < 20 and therefore our entities aren't touching.

			// The above is true for testing top and bottom sides on an entity as well.

			if(this.currentPosition.x && this.initialPosition.x && this.isClicking) {
				// if you're going right to left, the current position > initial position.
				let xSize = this.currentPosition.x - this.initialPosition.x;
				if(xSize < 0)
					this.pos.x = this.pos.x + xSize;
				this.size.x = Math.abs(xSize);
			}
			if(this.currentPosition.y && this.initialPosition.y && this.isClicking) {
				// similarly, if you're going down to up, current position > initial position.
				let ySize = this.currentPosition.y - this.initialPosition.y;
				if(ySize < 0)
					this.pos.y = this.pos.y + ySize;
				this.size.y = Math.abs(ySize);
			}
		},
		draw: function() {
			// If you wanna draw stuff, gotta do it in the "draw" method.
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
			if(other.clicked && this.isClicking) {
				let otherIdx = this.potentialSelection.indexOf(other);
				if(otherIdx > -1) {
					this.potentialSelection.splice(otherIdx, 1);
				} else {
					this.potentialSelection.push(other);
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
			}
		},
		kill: function() {
			this.parent();
		},
		debug: function() {
			//
		}
	});
});
