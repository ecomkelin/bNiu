$(() => {
	$("#objForm").submit(function(e) {
		const code = $("#codeIpt").val().replace(/^\s*/g,"").toUpperCase();

		if(code.length < 1) {
			$("#codeDanger").show();
			e.preventDefault();
		}
	})

	$("#codeIpt").blur(function(e) {
		const code = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(code.length < 1) {
			$("#codeDanger").show();
		} else {
			$("#codeDanger").hide();
		}
	})


	$("body").on("focus", ".reqPtCateg", function(e) {
		const level = $(this).attr("id").split("-")[2];
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		let PtCategFar = "";
		if(level == 1) {
			PtCategFar = "";
		} else {
			PtCategFar = $("#ipt-PtCateg-"+(level-1)).val();
		}
		getPtCategs_Func(level, str, PtCategFar, 'focus');
	})
	$("body").on("input", ".reqPtCateg", function(e) {
		const level = $(this).attr("id").split("-")[2];
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(level == 1) {
			PtCategFar = "";
		} else {
			PtCategFar = $("#ipt-PtCateg-"+(level-1)).val();
		}
		getPtCategs_Func(level, str, PtCategFar, 'input');
	})
	const getPtCategs_Func = (level, str, PtCategFar, evt) => {
		$.ajax({
			type: "GET",
			url: '/bsPtCategsAjax?level='+level+'&code='+str+'&PtCategFar='+PtCategFar,
			success: function(results) {
				if(results.status == 200) {
					const data = results.data;
					const PtCateg = data.object;
					const PtCategs = data.objects;
					PtCategBtnRender_Func(PtCateg, PtCategs, level, evt);
				} else {
					alert(results.message);
				}
			}
		});
	}
	const PtCategBtnRender_Func = (PtCateg, PtCategs, level, evt) => {
		if(evt == "input") {
			if(level == 1) {
				$(".iptPtCateg").val("");
				$("#req-PtCateg-3").val("");
				$("#req-PtCateg-2").val("");
			} else if(level == 2) {
				$("#ipt-PtCateg-3").val("");
				$("#ipt-PtCateg-2").val("");
				$("#req-PtCateg-3").val("");
			} else if(level == 3) {
				$("#ipt-PtCateg-3").val("");
			}
		}
		$(".PtCategBtn").remove();

		if(PtCateg) {
			$("#ipt-PtCateg-"+level).val(PtCateg._id);
		}

		let elem = "";
		for(let i=0; i<PtCategs.length; i++) {
			const PtCateg = PtCategs[i];
			elem += '<button class="PtCategBtn btn btn-info mr-3 mt-2" type="button" data-id=';
			elem += PtCateg._id+' data-code='+PtCateg.code+' data-level='+PtCateg.level+' />'+PtCateg.code+'</button>';
		}
		$("#PtCateg-box").append(elem);
	}
	$("#PtCateg-box").on("click", ".PtCategBtn", function(e) {
		const target = $(e.target);
		const id = target.data("id");
		const code = target.data("code");
		const level = target.data("level");

		const orgId = $("#ipt-PtCateg-"+level).val();
		if(id != orgId) {
			if(level == 1) {
				$(".iptPtCateg").val("");
				$("#req-PtCateg-3").val("");
				$("#req-PtCateg-2").val("");
			} else if(level == 2) {
				$("#ipt-PtCateg-3").val("");
				$("#ipt-PtCateg-2").val("");
				$("#req-PtCateg-3").val("");
			} else if(level == 3) {
				$("#ipt-PtCateg-3").val("");
			}
		}

		$(".PtCategBtn").remove();
		$("#req-PtCateg-"+level).val(code);
		$("#ipt-PtCateg-"+level).val(id);
	})

})