$(function() {
	/* ============= 材质 增删 ============= */
	$("body").on('click', '.toggleMtrial', function(e) {
		const target = $(e.target);
		const MtrialId = target.data('subid');
		const PdspuId = target.data('objid');
		const option = target.data('option');
		
		$.ajax({
			type: "GET",
			url: '/bsPdspuMtrialUpdAjax?PdspuId='+PdspuId+'&MtrialId='+MtrialId+'&option='+option,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 材质 增删 ============= */
})