requirejs(["canvashelper.js"], function(canvasHelper) {
	//why does it have to be a canvas?
	//

	//canvasHelper.thing();

	var levelMaker = (function() {
		//

		function defineTilesize() {
			//
		}

		function buildArrays() {
			//
		}

		function buildLevel() {
			return {
				name: "", //background, collision, main
				width: "", //array length size
				height: "", //array height size
				linkWithCollision: "",
				visible: "",
				tilesetName: "",
				repeat: "",
				preRender: "",
				distance: "",
				tilesize: "", //tilesize width AND height
				foreground: "",
				data: ""
			};
		}

		return {
			build: buildLevel
		};
	});
});