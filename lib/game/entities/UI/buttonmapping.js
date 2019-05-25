// So, I want to load this like a map?
// Put the button icons/images in memory, then display them when I select a unit?

ig.module('game.entities.UI.buttonmapping')
.requires('impact.image')
.defines(function() {
ButtonMapping=/*JSON[*/{
	"entities": {
		"BasicUnit": {
			"ui": [{
					"icon": {
						"image": "media/blob.png",
						"size": {
							"x": "64",
							"y": "28"
						},
					}, "text": "YO"
				}]
		},
		"BasicStructure": {
			"ui": [{
					"icon": {
						"image": "media/blob.png",
						"size": {
							"x": "64",
							"y": "28"
						},
					}, "text": "YO"
				}]
		}
	}
}/*]JSON*/;
});