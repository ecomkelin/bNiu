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
					objectsRender(objects, elemId, isReload, role)
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
	const getUrl = "/bsColorUpdAjax";

	let elem = '';
	elem += '<div class="col-6 col-lg-4 mt-2 text-center border-bottom border-left objectCard">'
		elem += '<img class="js-click-imgEnlarge" src="'+object.photo+'" '
			elem += 'width="100%" height="150px" '
			elem += 'style="object-fit: scale-down;"'
		elem += '/>'
		elem += '<h5>编号: '+object.code+'</h5>'
		elem += '<div class="border" style="width: 100%; background-color: #'+object.rgb+'">'
			elem += '<span class="bg-white">RGB: '+object.rgb+'</span>'
		elem += '</div>'
		elem += '<div class="row">'
			elem += '<div class="col-sm-6 text-left">'
				elem += '<span class="bg-white text-info jsUpd-span jsUpd-span-sort-sort-'+object._id;
				elem += '" data-field="sort" data-subid="sort" data-id='+object._id+'>[ '+object.sort+' ]';

				elem += '<input class="jsUpd-org-sort-sort-'+object._id+'" type="hidden" value='+object.sort+'>';

				elem += '<input class="jsUpd-ipt form-control jsUpd-ipt-sort-sort-'+object._id;
				elem += '" type="text" data-field="sort" data-subid="sort" data-id='+object._id;
				elem += ' data-url="/bsColorUpdAjax" data-toup=1 value='+object.sort+' style="display:none">'
			elem += '</div>'
			elem += '<div class="col-sm-6 text-right">'
				elem += '<a href="/bsColor/'+object._id+'">[查看]</a>'
			elem += '</div>'
		elem += '</div>'
		elem += '<div class="text-right mt-3 jsDel-objElem" style="display:none">'
			elem += '<a class="text-danger" href="/bsColorDel/'+object._id+'">[删除]</a>'
		elem += '</div>'
	elem += '</div>'
	return elem;
}