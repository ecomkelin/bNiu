$(() => {
	/* ================================ 更新数据 ================================ */
	$("body").on('click', '.jsUpd-field', function(e){
		const target = $(e.target);
		const field = target.data("field");
		const subid = target.data("subid");
		const id = target.data("id");
		$(".jsUpd-ipt-"+field+"-"+subid+"-"+id).toggle();
		$(".jsUpd-sel-"+field+"-"+subid+"-"+id).toggle();
	})
	$("body").on('click', '.jsUpd-span', function(e){
		const target = $(e.target);
		const field = target.data("field");
		const subid = target.data("subid");
		const id = target.data("id");
		$(".jsUpd-ipt-"+field+"-"+subid+"-"+id).toggle();
		$(".jsUpd-sel-"+field+"-"+subid+"-"+id).toggle();
	})
	$("body").on('keydown', '.jsUpd-ipt', function(e){
		if (e.keyCode == 13) {  
			$(this).blur();
		}  
	});
	$("body").on('blur', '.jsUpd-ipt', function(e){
		const target = $(e.target);
		const url = target.data("url");			// 路由
		const field = target.data("field");		// 更改对象的field
		const subid = target.data("subid");		// 如果是更改本对象下的某个数组对象中的值,该数组对象的id
		const id = target.data("id");			// 当前更改对象的ID
		const toup = target.data("toup");			// 是否变为大写
		const orgVal = $(".jsUpd-org-"+field+"-"+subid+"-"+id).val();
		let val = $(this).val();
		if(toup == 1) {
			val = val.replace(/^\s*/g,"").toUpperCase();
		}
		if(val != orgVal) {
			const data = "id="+id+"&field="+field+"&subid="+subid+"&val="+val;
			$.ajax({
				type: "POST",
				url: url,
				data: data,
				success: function(results) {
					if(results.status === 200) {
						$(".jsUpd-span-"+field+"-"+subid+"-"+id).text(val);
						$(".jsUpd-org-"+field+"-"+subid+"-"+id).val(val);
						$(".jsUpd-ipt-"+field+"-"+subid+"-"+id).hide();
						if(field == "rgb") {
							$(".jsColor-"+field+"-"+subid+"-"+id).css("background-color", "#"+val);
						} else if(field == "img") {
							local.reload();
						}
					} else {
						alert(results.message)
					}
				}
			});
		} else {
			$(this).hide();
		}
	})
	$("body").on('change', '.jsUpd-sel', function(e){
		const target = $(e.target);
		const url = target.data("url");			// 路由
		const field = target.data("field");		// 更改对象的field
		const subid = target.data("subid");		// 如果是更改本对象下的某个数组对象中的值,该数组对象的id
		const id = target.data("id");			// 当前更改对象的ID
		const val = $(this).val();
		const text = $(this).find("option:selected").text()
		const data = "id="+id+"&field="+field+"&val="+val;
		$.ajax({
			type: "POST",
			url: url,
			data: data,
			success: function(results) {
				if(results.status === 200) {
					$(".jsUpd-span-"+field+"-"+subid+"-"+id).text(text);
					$(".jsUpd-sel-"+field+"-"+subid+"-"+id).hide();
				} else {
					alert(results.message)
				}
			}
		});
	})


	/* ================================ 单张图片更改 ================================ */
	$("body").on('click', '.jsImg-clickUpd', function(e){
		const htmlIds = $(this).attr("id").split('-');
		const id = htmlIds[1];
		const field = htmlIds[2];
		const sub = htmlIds[3];
		$("#ipt-"+id+"-"+field+"-"+sub).click();
	})
	let orgImgSrc;
	$("body").on('change', '.jsImg-ipt', function(e){
		const htmlIds = $(this).attr("id").split('-');
		const id = htmlIds[1];
		const field = htmlIds[2];
		const sub = htmlIds[3];

		const imgFile = document.getElementById('ipt-'+id+"-"+field+"-"+sub).files[0];
		const imgSrc = window.URL.createObjectURL(imgFile);
		orgImgSrc = document.getElementById('img-'+id+"-"+field+"-"+sub).src;
		document.getElementById('img-'+id+"-"+field+"-"+sub).src = imgSrc;
		$(".jsImg-clickBefore-"+id+"-"+field+"-"+sub).hide();
		$(".jsImg-clickAfter-"+id+"-"+field+"-"+sub).show();
	})
	$("body").on('click', '.jsImg-cancel', function(e){
		const htmlIds = $(this).attr("id").split('-');
		const id = htmlIds[1];
		const field = htmlIds[2];
		const sub = htmlIds[3];
		document.getElementById('img-'+id+"-"+field+"-"+sub).src = orgImgSrc;
		$(".jsImg-clickBefore-"+id+"-"+field+"-"+sub).show();
		$(".jsImg-clickAfter-"+id+"-"+field+"-"+sub).hide();
	})

	/* ================================ 多图片上传 ================================ */
	$("#uploadPics").change(function(e) {
		$(".postsCrtBox").remove();
		const files = document.getElementById('uploadPics').files;
		let elem = ""
		for(let i=0; i<files.length; i++) {
			let src = window.URL.createObjectURL(files[i]);
			elem += '<div class="col-6 mt-3 postsCrtBox">'
				elem += '<img id="postsCrt-'+i+'" class="postsCrt" src='+src+ ' width="100%" height="100px" />'
			elem += '</div>'
		}
		// document.getElementById('crtImgs').src = src;
		$("#crtImgs").append(elem)
	})

	/* ================================ toggle Del ================================ */
	$("body").on('click', '.jsDel-btnClick', function(e){
		$(".jsDel-objElem").toggle();
	})
	/* ================================ toggle Up ================================ */
	$("body").on('click', '.jsUp-btnClick', function(e){
		$(".jsUp-objElem").toggle();
	})
	/* ================================ toggle Detail ================================ */
	$("body").on('click', '.jsDetail-btnClick', function(e){
		$(".jsDetail-objElem").toggle();
	})
	/* ================================ toggle DetailObj ================================ */
	$("body").on('click', '.jsDetail-btnClick-obj', function(e){
		const target = $(e.target);
		const id = target.data("id");
		$(".jsDetail-objElem-"+id).toggle();
	})
})