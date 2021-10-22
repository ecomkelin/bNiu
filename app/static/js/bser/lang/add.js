$(() => {
	$("#codeIpt").blur(function(e) {
		let code = $(this).val();
		if(!code) code = " ";
		code = code.replace(/^\s*/g,"").toUpperCase();
		if(code.length<2 || code.length>3) {
			$("#codeDanger").show();
		} else {
			$("#codeDanger").hide();
			$("#codeIpt").val(code);
		}
	})
	$("#nomeIpt").blur(function(e) {
		let nome = $(this).val();
		if(!nome) nome = " ";
		nome = nome.replace(/^\s*/g,"").toUpperCase();
		if(nome.length<2) {
			$("#nomeDanger").show();
		} else {
			$("#nomeDanger").hide();
			$("#nomeIpt").val(nome);
		}
	})
})