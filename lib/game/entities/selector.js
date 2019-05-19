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

		// if I put A* on each entity and told them to move to another area...
		// I guess I'd tell them to move to their positions relative to the given position.
		// building or reading a tilemap would be much better than using the x/y positions of the game.
		
		// ig.Game.CollisionMap is a map that contains possible collisions.
		// I wonder how much detail I can add to it...

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			
			this.ownedBy = settings.ownedBy;
			ig.global.selector = this;
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

			if(ig.input.released('click')) {
				this.isClicking = false;
				this.checkSelector();
				this.size = {
					x: 0,
					y: 0
				};
			}

			if(ig.input.released('c')) {
				// get mouse coordinates
				// feed to current selection as a command
				this.currentSelection.forEach((val) => {
					val.moveCommand(mouse);
				});
			};
		},
		checkSelector: function() {
			let selectorBounds = {
				leftX: this.pos.x,
				rightX: this.pos.x + this.size.x,
				topY: this.pos.y,
				bottomY: this.pos.y + this.size.y
			};

			this.currentSelection.forEach((val) => {
				val.deselect();
			});

			// Ok, I've got selector bounds
			let newCurrentSelection = [];
			this.potentialSelection.forEach((val) => {
				// Test x and y position of each potentially selected entity against selector's bounds.
				// Take half of each val's size, so that as long as our selector is over a half of one side, then we can still select the entity.
				let valBounds = {
					x: val.pos.x + (val.size.x/2),
					y: val.pos.y + (val.size.y/2)
				};

				// there's something still wrong about our y positions...
				if((valBounds.x > selectorBounds.leftX && valBounds.x < selectorBounds.rightX) &&
					(valBounds.y > selectorBounds.topY && valBounds.y < selectorBounds.bottomY)) {
					newCurrentSelection.push(val);
				}
			});

			newCurrentSelection.forEach((val) => {
				val.select();
			});

			this.currentSelection = newCurrentSelection;
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
			// if the entity we're colliding with is selectable
			if(other.select && this.isClicking) {
				// if they're not already in the potential selection
				// add them to the selection.
				let otherIdx = this.potentialSelection.indexOf(other);
				if(!(otherIdx > -1))
					this.potentialSelection.push(other);
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
