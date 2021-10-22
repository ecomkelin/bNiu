$(() => {
	const ColorStint = JSON.parse($("#ColorStint").val());
	$("#codeIpt").blur(function(e) {
		const code = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(code.length<1) {
			$("#codeDanger").show();
		} else {
			$("#codeDanger").hide();
			$("#codeIpt").val(code);
		}
	})
	$("#rgbIpt").blur(function(e) {
		const rgb = $(this).val().replace(/^\s*/g,"").toUpperCase();
		const regexp = new RegExp(ColorStint.rgb.regexp);
		if(!regexp.test(rgb) || (rgb.length != ColorStint.rgb.len)) {
			$("#rgbDanger").show();
		} else {
			$("#rgbIpt").val(rgb);
			$("#rgbDanger").hide();
		}
	})

	$("#objForm").submit(function(e) {
		const code = $("#codeIpt").val().replace(/^\s*/g,"").toUpperCase();
		const rgb = $("#rgbIpt").val().replace(/^\s*/g,"").toUpperCase();
		const regexp = new RegExp(ColorStint.rgb.regexp);
		if(code.length<1) {
			$("#codeDanger").show();
			e.preventDefault();
		} else if(!regexp.test(rgb) || (rgb.length != ColorStint.rgb.len)) {
			$("#rgbDanger").show();
			$("#rgbIpt").val("FFFFFF")
		}
	})
})