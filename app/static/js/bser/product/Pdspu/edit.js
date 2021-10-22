$(() => {
	$("#objForm").submit(function(e) {
		const code = $("#codeIpt").val().replace(/^\s*/g,"").toUpperCase();
		const price = $("#priceIpt").val();
		const weight = $("#weightIpt").val();
		const cost = $("#costIpt").val();
		const PdNome = $("#PdNomeReq").val().replace(/^\s*/g,"").toUpperCase();

		if(code.length < 3) {
			$("#codeDanger").show();
			e.preventDefault();
		} else if(PdNome.length < 1) {
			$("#PdNomeDanger").show();
			e.preventDefault();
		} else if(!jsFunc_isFloat(price)) {
			$("#priceDanger").show();
			e.preventDefault();
		} else if(weight && weight.length>0 && !jsFunc_isFloat(weight)) {
			$("#weightDanger").show();
			e.preventDefault();
		} else if(cost && cost.length>0 && !jsFunc_isFloat(cost)) {
			$("#costDanger").show();
			e.preventDefault();
		}
	})

	$("#codeIpt").blur(function(e) {
		const code = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(code.length < 3) {
			$("#codeDanger").show();
		} else {
			$("#codeDanger").hide();
		}
	})

	$("#priceIpt").blur(function(e) {
		const price = $(this).val();
		if(!jsFunc_isFloat(price)) {
			$("#priceDanger").show();
		} else {
			$("#priceDanger").hide();
		}
	})

	$("#weightIpt").blur(function(e) {
		const weight = $(this).val();
		if(weight && weight.length > 0) {
			if(!jsFunc_isFloat(weight)) {
				$("#weightDanger").show();
			} else {
				$("#weightDanger").hide();
			}
		}
	})

	$("#costIpt").blur(function(e) {
		const cost = $(this).val();
		if(cost && cost.length > 0) {
			if(!jsFunc_isFloat(cost)) {
				$("#costDanger").show();
			} else {
				$("#costDanger").hide();
			}
		}
	})

	$("body").on("focus", "#PdNomeReq", function(e) {
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(str.length < 1) {
			$("#PdNomeDanger").show();
		} else {
			$("#PdNomeDanger").hide();
		}
		getPdNomes_Func(str);
	})
	$("body").on("input", "#PdNomeReq", function(e) {
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		getPdNomes_Func(str);
		if(str.length < 1) {
			$("#PdNomeDanger").show();
		} else {
			$("#PdNomeDanger").hide();
		}
	})
	const getPdNomes_Func = (str) => {
		$.ajax({
			type: "GET",
			url: '/bsPdNomesAjax?code='+str,
			success: function(results) {
				if(results.status == 200) {
					const data = results.data;
					const PdNome = data.PdNome;
					const PdNomes = data.PdNomes;
					PdNomeBtnRender_Func(PdNome, PdNomes);
				} else {
					alert(results.message);
				}
			}
		});
	}
	const PdNomeBtnRender_Func = (PdNome, PdNomes) => {
		$(".PdNomeBtn").remove();
		$("#PdNomeIpt").val("");
		if(PdNome) {
			$("#PdNomeIpt").val(PdNome._id);
		}
		let elem = "";
		for(let i=0; i<PdNomes.length; i++) {
			const PdNome = PdNomes[i];
			elem += '<button class="PdNomeBtn btn btn-info mr-3 mt-2" type="button" data-id=';
			elem += PdNome._id+' data-code='+PdNome.code+' />'+PdNome.code+'</button>';
		}
		$("#PdNome-box").append(elem);
	}
	$("#PdNome-box").on("click", ".PdNomeBtn", function(e) {
		const target = $(e.target);
		const id = target.data("id");
		const code = target.data("code");

		$(".PdNomeBtn").remove();
		$("#PdNomeDanger").hide();
		$("#PdNomeReq").val(code);
		$("#PdNomeIpt").val(id);
	})



	$("body").on("focus", ".reqPdCateg", function(e) {
		const level = $(this).attr("id").split("-")[2];
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		let PdCategFar = "";
		if(level == 1) {
			PdCategFar = "";
		} else {
			PdCategFar = $("#ipt-PdCateg-"+(level-1)).val();
		}
		getPdCategs_Func(level, str, PdCategFar, 'focus');
	})
	$("body").on("input", ".reqPdCateg", function(e) {
		const level = $(this).attr("id").split("-")[2];
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(level == 1) {
			PdCategFar = "";
		} else {
			PdCategFar = $("#ipt-PdCateg-"+(level-1)).val();
		}
		getPdCategs_Func(level, str, PdCategFar, 'input');
	})
	const getPdCategs_Func = (level, str, PdCategFar, evt) => {
		$.ajax({
			type: "GET",
			url: '/bsPdCategsAjax?level='+level+'&code='+str+'&PdCategFar='+PdCategFar,
			success: function(results) {
				if(results.status == 200) {
					const data = results.data;
					const PdCateg = data.object;
					const PdCategs = data.objects;
					PdCategBtnRender_Func(PdCateg, PdCategs, level, evt);
				} else {
					alert(results.message);
				}
			}
		});
	}
	const PdCategBtnRender_Func = (PdCateg, PdCategs, level, evt) => {
		if(evt == "input") {
			if(level == 1) {
				$(".iptPdCateg").val("");
				$("#req-PdCateg-3").val("");
				$("#req-PdCateg-2").val("");
			} else if(level == 2) {
				$("#ipt-PdCateg-3").val("");
				$("#ipt-PdCateg-2").val("");
				$("#req-PdCateg-3").val("");
			} else if(level == 3) {
				$("#ipt-PdCateg-3").val("");
			}
		}
		$(".PdCategBtn").remove();

		if(PdCateg) {
			$("#ipt-PdCateg-"+level).val(PdCateg._id);
		}

		let elem = "";
		for(let i=0; i<PdCategs.length; i++) {
			const PdCateg = PdCategs[i];
			elem += '<button class="PdCategBtn btn btn-info mr-3 mt-2" type="button" data-id=';
			elem += PdCateg._id+' data-code='+PdCateg.code+' data-level='+PdCateg.level+' />'+PdCateg.code+'</button>';
		}
		$("#PdCateg-box").append(elem);
	}
	$("#PdCateg-box").on("click", ".PdCategBtn", function(e) {
		const target = $(e.target);
		const id = target.data("id");
		const code = target.data("code");
		const level = target.data("level");

		const orgId = $("#ipt-PdCateg-"+level).val();
		if(id != orgId) {
			if(level == 1) {
				$(".iptPdCateg").val("");
				$("#req-PdCateg-3").val("");
				$("#req-PdCateg-2").val("");
			} else if(level == 2) {
				$("#ipt-PdCateg-3").val("");
				$("#ipt-PdCateg-2").val("");
				$("#req-PdCateg-3").val("");
			} else if(level == 3) {
				$("#ipt-PdCateg-3").val("");
			}
		}

		$(".PdCategBtn").remove();
		$("#req-PdCateg-"+level).val(code);
		$("#ipt-PdCateg-"+level).val(id);
	})

})