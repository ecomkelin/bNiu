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
	$(".PdCategClick").click(function(e) {
		$("#codeSearch").val('');

		$(".PdNomeClick").removeClass("btn-success");
		$(".PdNomeClick").addClass("btn-default");
		$("#PdNomeAll").removeClass("btn-default");
		$("#PdNomeAll").addClass("btn-success");

		$(".PdCategClick").removeClass("btn-success");
		$(".PdCategClick").addClass("btn-default");

		const target = $(e.target);
		let PdCateg = target.data("pdcateg");
		const level = target.data("level");

		let PdCategParam = "";

		if(!PdCateg || PdCateg.length != 24) {
			PdCategParam = "";
			$("#PdCategAll").removeClass("btn-default");
			$("#PdCategAll").addClass("btn-success");
		} else {
			if(level == 1) {
				PdCategParam = "&PdCategFir="+PdCateg;
			} else if(level == 2) {
				PdCategParam = "&PdCategSec="+PdCateg;
			} else if(level == 3) {
				PdCategParam = "&PdCategThd="+PdCateg;
			}
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + PdCategParam;
		getObjects(urlQuery, elemId, 1, role);

		$("#codeSearch").val('');
	})

	/* ====== 点击品类名 显示系列 ====== */
	$(".PdNomeClick").click(function(e) {
		$("#codeSearch").val('');

		$(".PdCategClick").removeClass("btn-success");
		$(".PdCategClick").addClass("btn-default");
		$("#PdCategAll").removeClass("btn-default");
		$("#PdCategAll").addClass("btn-success");

		$(".PdNomeClick").removeClass("btn-success");
		$(".PdNomeClick").addClass("btn-default");


		const target = $(e.target);
		let PdNome = target.data("pdnome");
		if(!PdNome || PdNome.length != 24) {
			PdNome = "";
			$("#PdNomeAll").removeClass("btn-default");
			$("#PdNomeAll").addClass("btn-success");
		} else {
			PdNome = "&PdNome=" + PdNome;
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + PdNome;
		getObjects(urlQuery, elemId, 1, role);
	})

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", (e) => {
		$(".PdNomeClick").removeClass("btn-success");
		$(".PdNomeClick").addClass("btn-default");
		$("#PdNomeAll").removeClass("btn-default");
		$("#PdNomeAll").addClass("btn-success");

		$(".PdCategClick").removeClass("btn-success");
		$(".PdCategClick").addClass("btn-default");
		$("#PdCategAll").removeClass("btn-default");
		$("#PdCategAll").addClass("btn-success");

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
		// console.log(scrollTop+windowHeight+58 > scrollHeight)
		// console.log(`isMore: ${isMore}`)
		if(scrollTop + windowHeight + 58 > scrollHeight){
			if(isMore == 1) {
				getObjects(urlQuery+'&page='+(parseInt(page)+1), elemId, 0, role);
			}
		}
	});
})

let page = 0;
let count;
let isMore;
const getObjects = (urlQuery, elemId, isReload, role) => {
	// console.log(urlQuery)
	// console.log(elemId)
	// console.log(isReload)
	// console.log(role)

	$.ajax({
		type: "GET",
		url: urlQuery,
		success: function(results) {
			if(results.status === 200) {
				if(page+1 != results.data.page) {
					// 如果数据错误 则不输出
				} else {
					let objects = results.data.objects;
					page = results.data.page
					page = results.data.page
					isMore = results.data.isMore
					count = results.data.count
					$("#objectCount").text(count)
					if(objects) {
						objectsRender(objects, elemId, isReload, role)
					}
				}
			} else {
				alert(results.message);
			}
		}
	});
}

const objectsRender = (objects, elemId, isReload, role) => {
	let elem = '<div class="row objectsElem">'
		for(let i=0; i<objects.length; i++) {
			let object = objects[i];
			elem += objectRender(object, role);
		}
	elem += '</div>'
	if(isReload == 1) $(".objectsElem").remove();
	if(!elemId) elemId = "#objectsElem";
	$(elemId).append(elem);
}
const objectRender = (object, role) => {
	const getUrl = "/bsPdspuUpdAjax";

	let elem = '';
	elem += '<div class="col-6 col-lg-4 mt-2 text-center border-bottom border-left objectCard">'
		elem += '<img class="js-click-imgEnlarge" src="'+object.photo+'" '
			elem += 'width="100%" height="150px" '
			elem += 'style="object-fit: scale-down;"'
		elem += '/>'
		elem += '<h5>编号: '+object.code+'</h5>'
		elem += '<h5>名称: ';
			if(object.PdNome) {
				elem += object.PdNome.code;
			} else {
				elem += "名称错误"
			}
		elem += '</h5>'
		elem += '<div class="PdCateg">';
			elem += '<span> 分类: '
			if(object.PdCategFir) {
				elem += object.PdCategFir.code;
				if(object.PdCategSec) {
					elem += '<div class="PdCategSec"> 二级分类: '+object.PdCategSec.code+'</div>'
					if(object.PdCategThd) {
						elem += '<div class="PdCategThd"> 三级分类: '+object.PdCategThd.code+'</div>'
					}
				}
			} else {
				elem += "未分类"
			}
		elem += '</div>'
		elem += '<div class="row">'
			elem += '<div class="col-sm-6 text-left">'
				elem += '<span class="bg-white text-info jsUpd-span jsUpd-span-sort-sort-'+object._id;
				elem += '" data-field="sort" data-subid="sort" data-id='+object._id+'>[ '+object.sort+' ]';

				elem += '<input class="jsUpd-org-sort-sort-'+object._id+'" type="hidden" value='+object.sort+'>';

				elem += '<input class="jsUpd-ipt form-control jsUpd-ipt-sort-sort-'+object._id;
				elem += '" type="text" data-field="sort" data-subid="sort" data-id='+object._id;
				elem += ' data-url="/bsPdspuUpdAjax" data-toup=1 value='+object.sort+' style="display:none">'
			elem += '</div>'
			elem += '<div class="col-sm-6 text-right">'
				elem += '<a href="/bsPdspu/'+object._id+'">[查看]</a>'
			elem += '</div>'
		elem += '</div>'
		elem += '<div class="text-right mt-3 jsDel-objElem" style="display:none">'
			elem += '<a class="text-danger" href="/bsPdspuDel/'+object._id+'">[删除]</a>'
		elem += '</div>'
	elem += '</div>'
	return elem;
}