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
	$(".MtCategClick").click(function(e) {
		$("#codeSearch").val('');

		$(".MtFirmClick").removeClass("btn-success");
		$(".MtFirmClick").addClass("btn-default");
		$("#MtFirmAll").removeClass("btn-default");
		$("#MtFirmAll").addClass("btn-success");

		$(".MtCategClick").removeClass("btn-success");
		$(".MtCategClick").addClass("btn-default");

		const target = $(e.target);
		let MtCateg = target.data("pdcateg");
		const level = target.data("level");

		let MtCategParam = "";

		if(!MtCateg || MtCateg.length != 24) {
			MtCategParam = "";
			$("#MtCategAll").removeClass("btn-default");
			$("#MtCategAll").addClass("btn-success");
		} else {
			if(level == 1) {
				MtCategParam = "&MtCategFir="+MtCateg;
			} else if(level == 2) {
				MtCategParam = "&MtCategSec="+MtCateg;
			} else if(level == 3) {
				MtCategParam = "&MtCategThd="+MtCateg;
			}
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + MtCategParam;
		getObjects(urlQuery, elemId, 1, role);

		$("#codeSearch").val('');
	})

	/* ====== 点击品类名 显示系列 ====== */
	$(".MtFirmClick").click(function(e) {
		$("#codeSearch").val('');

		$(".MtCategClick").removeClass("btn-success");
		$(".MtCategClick").addClass("btn-default");
		$("#MtCategAll").removeClass("btn-default");
		$("#MtCategAll").addClass("btn-success");

		$(".MtFirmClick").removeClass("btn-success");
		$(".MtFirmClick").addClass("btn-default");

		const target = $(e.target);
		let MtFirm = target.data("pdnome");
		if(!MtFirm || MtFirm.length != 24) {
			MtFirm = "";
			$("#MtFirmAll").removeClass("btn-default");
			$("#MtFirmAll").addClass("btn-success");
		} else {
			MtFirm = "&MtFirm=" + MtFirm;
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + MtFirm;
		getObjects(urlQuery, elemId, 1, role);
	})

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", (e) => {
		$(".MtFirmClick").removeClass("btn-success");
		$(".MtFirmClick").addClass("btn-default");
		$("#MtFirmAll").removeClass("btn-default");
		$("#MtFirmAll").addClass("btn-success");

		$(".MtCategClick").removeClass("btn-success");
		$(".MtCategClick").addClass("btn-default");
		$("#MtCategAll").removeClass("btn-default");
		$("#MtCategAll").addClass("btn-success");

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