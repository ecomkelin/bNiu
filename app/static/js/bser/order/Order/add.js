let pageIndexCter = 0;
let countIndexCter;
let isMoreIndexCter;
const getIndexCters = (urlQuery, elemId, isReload, role) => {
	// console.log(urlQuery)
	// console.log(elemId)
	// console.log(isReload)
	// console.log(role)

	$.ajax({
		type: "GET",
		url: urlQuery,
		success: function(results) {
			if(results.status === 200) {
				if(pageIndexCter+1 != results.data.page) {
					// 如果数据错误 则不输出
				} else {
					let object = results.data.object;
					let objects = results.data.objects;
					pageIndexCter = results.data.page
					isMoreIndexCter = results.data.isMore
					countIndexCter = results.data.count
					$("#objectCount").text(countIndexCter)
					if(object) {
						$("#headerCterId").val(object._id);
					} else {
						$("#headerCterId").val("");
					}
					headerCtersRender(objects, elemId, isReload, role)
				}
			} else {
				alert(results.message);
			}
		}
	});
}

const headerCtersRender = (objects, elemId, isReload, role) => {
	let elem = ''
	for(let i=0; i<objects.length; i++) {
		let object = objects[i];

		elem += '<button class="headerCterCard btn btn-info mr-3 mt-2" type="button" data-id='+object._id+' data-code='+object.code+'>'
			elem += '编号: '+object.code+'</br>'
			elem += '名字: '+object.nome
		elem += '</button>'
	}
	if(isReload == 1) $(".headerCterCard").remove();
	if(!elemId) elemId = "#headerCtersElem";
	$(elemId).append(elem);
}

$(function() {
	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';

	objectsInit = () => {
		const objectFilter = $("#headerCterFilterAjax").val();
		if(objectFilter) {
			objectParam = objectFilter.split('@')[0];
			elemId = objectFilter.split('@')[1];
			role = objectFilter.split('@')[2];
		}
		urlQuery = objectParam;
	}
	objectsInit();

	$("#odspuAdd-btn").click(function(e) {
		$("#odspuAdd-Form-Box").toggle();
	})

	$("body").on("focus", "#headerCterCode", (e) => {
		serchCter();
	})
	$("body").on("input", "#headerCterCode", (e) => {
		serchCter();
	})
	const serchCter = () => {
		let code = $("#headerCterCode").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		if(code && code.length > 0) {
			code = "&code=" + code;
		} else {
			code = "";
		}

		pageIndexCter = 0;
		urlQuery = objectParam + code;
		getIndexCters(urlQuery, elemId, 1, role);
	}

	$("body").on("click", ".headerCterCard", function(e) {
		const target = $(e.target);
		const id = target.data("id");
		const code = target.data("code");
		$("#headerCterId").val(id);
		$("#headerCterCode").val(code);
		$(".headerCterCard").remove();
	})

	$(window).scroll(function(){
		const scrollTop = $(this).scrollTop();
		const scrollHeight = $(document).height();
		const windowHeight = $(this).height();
		if(scrollTop + windowHeight + 58 > scrollHeight){
			if(isMoreIndexCter == 1) {
				getIndexCters(urlQuery+'&page='+(parseInt(pageIndexCter)+1), elemId, 0, role);
			}
		}
	});
})