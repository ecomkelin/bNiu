$(function() {
	/* ============= 颜色 增删 ============= */
	$("body").on('click', '.toggleColor', function(e) {
		const target = $(e.target);
		const ColorId = target.data('subid');
		const PdspuId = target.data('objid');
		const rgb = target.data('rgb');
		const code = target.data('code');
		const option = target.data('option');

		if(!code) code = ' ';
		let codeColor = code;
		if(codeColor.length > 8) codeColor = codeColor.slice(0,6) + '...';
		$.ajax({
			type: "GET",
			url: '/bsPdspuColorUpdAjax?PdspuId='+PdspuId+'&ColorId='+ColorId+'&option='+option,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
					// if(option == 1) {
					// 	let elem = "";
					// 	elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="Colored-'+ColorId+'">'
					// 		elem += '<div class="toggleColor border" style="background-color:#'+rgb+'; height: 30px" '
					// 		elem += 'data-objid='+PdspuId+' data-subid='+ColorId+' data-rgb='+rgb+' data-code='+code
					// 		elem +=' data-option=-1, title='+code+'>'
					// 		elem += '</div>'
					// 		elem += '<div class="code text-success" style="Font-size: 8px" title='+code+'>'
					// 			elem += codeColor
					// 		elem += '</div>'
					// 	elem += '</div>'
					// 	$("#ColoredsBox").prepend(elem)
					// 	$("#ColorPool-"+ColorId).remove()
					// } else {
					// 	let elem = "";
					// 	elem += '<div class="col-4 col-md-6 col-xl-1 mt-3" id="ColorPool-'+ColorId+'">'
					// 		elem += '<div class="toggleColor border" style="background-color:#'+rgb+'; height: 30px" '
					// 		elem += 'data-objid='+PdspuId+' data-subid='+ColorId+' data-rgb='+rgb+' data-code='+code
					// 		elem +=' data-option=1, title='+code+'>'
					// 		elem += '</div>'
					// 		elem += '<div class="code" style="Font-size: 8px" title='+code+'>'
					// 			elem += codeColor
					// 		elem += '</div>'
					// 	elem += '</div>'
					// 	$("#ColorPoolsBox").prepend(elem)
					// 	$("#Colored-"+ColorId).remove()
					// }
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 颜色 增删 ============= */
})