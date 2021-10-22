$(function() {
	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';

	objectsInit = () => {
		const objectFilter = $("#objectFilterAjax").val();
		if(objectFilter) {
			objectParam = objectFilter.split('@')[0];
			elemId = objectFilter.split('@')[1];
			role = objectFilter.split('@')[2];
		}
		urlQuery = objectParam;
		getObjects(urlQuery, elemId, 1, role);
	}
	objectsInit();

	/* ====== 点击产品分类 显示系列 ====== */
	$(".PtCategClick").click(function(e) {
		$("#codeSearch").val('');

		$(".PtFirmClick").removeClass("btn-success");
		$(".PtFirmClick").addClass("btn-default");
		$("#PtFirmAll").removeClass("btn-default");
		$("#PtFirmAll").addClass("btn-success");

		$(".PtCategClick").removeClass("btn-success");
		$(".PtCategClick").addClass("btn-default");

		const target = $(e.target);
		let PtCateg = target.data("pdcateg");
		const level = target.data("level");

		let PtCategParam = "";

		if(!PtCateg || PtCateg.length != 24) {
			PtCategParam = "";
			$("#PtCategAll").removeClass("btn-default");
			$("#PtCategAll").addClass("btn-success");
		} else {
			if(level == 1) {
				PtCategParam = "&PtCategFir="+PtCateg;
			} else if(level == 2) {
				PtCategParam = "&PtCategSec="+PtCateg;
			} else if(level == 3) {
				PtCategParam = "&PtCategThd="+PtCateg;
			}
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + PtCategParam;
		getObjects(urlQuery, elemId, 1, role);

		$("#codeSearch").val('');
	})

	/* ====== 点击品类名 显示系列 ====== */
	$(".PtFirmClick").click(function(e) {
		$("#codeSearch").val('');

		$(".PtCategClick").removeClass("btn-success");
		$(".PtCategClick").addClass("btn-default");
		$("#PtCategAll").removeClass("btn-default");
		$("#PtCategAll").addClass("btn-success");

		$(".PtFirmClick").removeClass("btn-success");
		$(".PtFirmClick").addClass("btn-default");

		const target = $(e.target);
		let PtFirm = target.data("pdnome");
		if(!PtFirm || PtFirm.length != 24) {
			PtFirm = "";
			$("#PtFirmAll").removeClass("btn-default");
			$("#PtFirmAll").addClass("btn-success");
		} else {
			PtFirm = "&PtFirm=" + PtFirm;
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + PtFirm;
		getObjects(urlQuery, elemId, 1, role);
	})

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", (e) => {
		$(".PtFirmClick").removeClass("btn-success");
		$(".PtFirmClick").addClass("btn-default");
		$("#PtFirmAll").removeClass("btn-default");
		$("#PtFirmAll").addClass("btn-success");

		$(".PtCategClick").removeClass("btn-success");
		$(".PtCategClick").addClass("btn-default");
		$("#PtCategAll").removeClass("btn-default");
		$("#PtCategAll").addClass("btn-success");

		let code = $("#codeSearch").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		if(code && code.length > 0) {
			code = "&code=" + code;
		} else {
			code = "";
		}

		page = 0;
		urlQuery = objectParam + code;
		getObjects(urlQuery, elemId, 1, role);
	})

	$(window).scroll(function(){
		const scrollTop = $(this).scrollTop();
		const scrollHeight = $(document).height();
		const windowHeight = $(this).height();
		if(scrollTop + windowHeight + 58 > scrollHeight){
			if(isMore == 1) {
				getObjects(urlQuery+'&page='+(parseInt(page)+1), elemId, 0, role);
			}
		}
	});
})