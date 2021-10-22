$(function() {
	/* ============= 印花 增删 ============= */
	$("body").on('click', '.togglePtern', function(e) {
		const target = $(e.target);
		const PternId = target.data('subid');
		const PdspuId = target.data('objid');
		const option = target.data('option');
		
		$.ajax({
			type: "GET",
			url: '/bsPdspuPternUpdAjax?PdspuId='+PdspuId+'&PternId='+PternId+'&option='+option,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 印花 增删 ============= */
})