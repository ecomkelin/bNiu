let interval = "";
let step = "";
let code = "";

const intervalFilter_func = ()=> {
	const fromAt = $("#fromAt").val();
	const toAt = $("#toAt").val();

	interval = "";
	if(fromAt && fromAt.length == 10) {
		interval += "&fromAt="+fromAt;
	}
	if(toAt && toAt.length == 10) {
		interval += "&toAt="+toAt;
	}
}

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

	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", (e) => {
		code = $("#codeSearch").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		$(".stepClick").removeClass("btn-success");
		$(".stepClick").addClass("btn-default");
		$("#stepAll").removeClass("btn-default");
		$("#stepAll").addClass("btn-success");

		if(code && code.length > 0) {
			code = "&code=" + code;
		} else {
			code = "";
		}

		page = 0;
		urlQuery = objectParam + code;
		getObjects(urlQuery, elemId, 1, role);
	})

	/* ====== 根据时间筛选 ====== */
	$("#interval-Orders").click(function(e) {
		intervalFilter_func();
		if(interval.length > 0) {
			page = 0;
			urlQuery = objectParam + interval + step;
			getObjects(urlQuery, elemId, 1, role);
		}
	})

	/* ====== 点击订单状态 显示列表 ====== */
	$(".stepClick").click(function(e) {
		$("#codeSearch").val('');

		$(".stepClick").removeClass("btn-success");
		$(".stepClick").addClass("btn-default");

		$("#fromAt").val("");
		$("#toAt").val("");

		const target = $(e.target);
		step = target.data("step");
		if(!step) {
			step = "";
			$("#stepAll").removeClass("btn-default");
			$("#stepAll").addClass("btn-success");
		} else {
			step = "&step=" + step;
			$(this).removeClass("btn-default");
			$(this).addClass("btn-success");
		}

		page = 0;
		urlQuery = objectParam + step;
		getObjects(urlQuery, elemId, 1, role);
	})

	$(window).scroll(function(){
		const scrollTop = $(this).scrollTop();
		const scrollHeight = $(document).height();
		const windowHeight = $(this).height();
		if(scrollTop + windowHeight >= scrollHeight){
			// console.log(isMore)
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
	let elem = ''
	let checkboxFlag = false;
	for(let i=0; i<objects.length; i++) {
		let object = objects[i];
		let textColor = "text-primary";
		let step = "错误状态"
		let checkboxElem = "";
		if(object.step == 1) {
			textColor = "text-info";
			step = "创建中";
		} else if(object.step == 10) {
			textColor = "text-success";
			step = "处理中";
			checkboxElem += '<input type="checkbox" class="checkboxOrder" id="orderCheckbox-'+object._id+'" name="orders" checked="checked" value='+object._id+'>';
			checkboxFlag = true;
		} else if(object.step == 50) {
			textColor = "text-secondary";
			step = "历史";
		}

		elem += '<div class="row mt-3 border rounded p-3 objectsElem">'
			elem += '<div class="col-md-6 col-lg-4 mt-3">'
				elem += '<a class="'+textColor+'" href="/bsOrder/'+object._id+'">编号: '+object.code+'</a>'
				if(object.note) {
					elem += '<div>备注: ';
						elem += object.note;
					elem += '</div>'
				}
			elem += '</div>'
			elem += '<div class="col-md-6 col-lg-4 mt-3">'
				elem += '<span class="mr-3">' + step + '</span>'
				elem += checkboxElem
				// elem += '<div class="text-right mt-3 jsDel-objElem" style="display:none">'
				// 	elem += '<a class="text-danger" href="/bsOrderDel/'+object._id+'">[删除]</a>'
				// elem += '</div>'
			elem += '</div>'
		elem += '</div>'
	}
	if(checkboxFlag) {
		elem += '<div class="text-right objectsElem analys_CostMtBtnBox mt-5">'
			elem += '<button class="analys_CostMtBtn btn btn-info" type="button">用料分析</button>'
		elem += '</div>'
	}
	$(".analys_CostMtBtnBox").remove();
	if(isReload == 1) $(".objectsElem").remove();
	if(!elemId) elemId = "#objectsElem";
	$(elemId).append(elem);
}
