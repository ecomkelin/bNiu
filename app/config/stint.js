const Stint = {
	extent: {
		User: {
			code: {regexp: '^[a-zA-Z0-9]*$', min: 4, max: 15},
			pwd: {min: 6, max: 12},
		},
		Firm: {
			code: {regexp: '^[a-zA-Z]*$', len: 4},
			nome: {min: 2},
		},
		Nation: { code: {regexp: '^[a-zA-Z]*$', min: 2, max: 3} },
		Color: {rgb: {regexp: '^[a-fA-F0-9]*$', len: 6}}
	}
}

module.exports = Stint