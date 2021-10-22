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


	$("body").on("focus", ".reqMtCateg", function(e) {
		const level = $(this).attr("id").split("-")[2];
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		let MtCategFar = "";
		if(level == 1) {
			MtCategFar = "";
		} else {
			MtCategFar = $("#ipt-MtCateg-"+(level-1)).val();
		}
		getMtCategs_Func(level, str, MtCategFar, 'focus');
	})
	$("body").on("input", ".reqMtCateg", function(e) {
		const level = $(this).attr("id").split("-")[2];
		const str = $(this).val().replace(/^\s*/g,"").toUpperCase();
		if(level == 1) {
			MtCategFar = "";
		} else {
			MtCategFar = $("#ipt-MtCateg-"+(level-1)).val();
		}
		getMtCategs_Func(level, str, MtCategFar, 'input');
	})
	const getMtCategs_Func = (level, str, MtCategFar, evt) => {
		$.ajax({
			type: "GET",
			url: '/bsMtCategsAjax?level='+level+'&code='+str+'&MtCategFar='+MtCategFar,
			success: function(results) {
				if(results.status == 200) {
					const data = results.data;
					const MtCateg = data.object;
					const MtCategs = data.objects;
					MtCategBtnRender_Func(MtCateg, MtCategs, level, evt);
				} else {
					alert(results.message);
				}
			}
		});
	}
	const MtCategBtnRender_Func = (MtCateg, MtCategs, level, evt) => {
		if(evt == "input") {
			if(level == 1) {
				$(".iptMtCateg").val("");
				$("#req-MtCateg-3").val("");
				$("#req-MtCateg-2").val("");
			} else if(level == 2) {
				$("#ipt-MtCateg-3").val("");
				$("#ipt-MtCateg-2").val("");
				$("#req-MtCateg-3").val("");
			} else if(level == 3) {
				$("#ipt-MtCateg-3").val("");
			}
		}
		$(".MtCategBtn").remove();

		if(MtCateg) {
			$("#ipt-MtCateg-"+level).val(MtCateg._id);
		}

		let elem = "";
		for(let i=0; i<MtCategs.length; i++) {
			const MtCateg = MtCategs[i];
			elem += '<button class="MtCategBtn btn btn-info mr-3 mt-2" type="button" data-id=';
			elem += MtCateg._id+' data-code='+MtCateg.code+' data-level='+MtCateg.level+' />'+MtCateg.code+'</button>';
		}
		$("#MtCateg-box").append(elem);
	}
	$("#MtCateg-box").on("click", ".MtCategBtn", function(e) {
		const target = $(e.target);
		const id = target.data("id");
		const code = target.data("code");
		const level = target.data("level");

		const orgId = $("#ipt-MtCateg-"+level).val();
		if(id != orgId) {
			if(level == 1) {
				$(".iptMtCateg").val("");
				$("#req-MtCateg-3").val("");
				$("#req-MtCateg-2").val("");
			} else if(level == 2) {
				$("#ipt-MtCateg-3").val("");
				$("#ipt-MtCateg-2").val("");
				$("#req-MtCateg-3").val("");
			} else if(level == 3) {
				$("#ipt-MtCateg-3").val("");
			}
		}

		$(".MtCategBtn").remove();
		$("#req-MtCateg-"+level).val(code);
		$("#ipt-MtCateg-"+level).val(id);
	})

})