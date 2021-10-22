$(() => {
	/* ============= 尺寸 添加 ============= */
	$(".sAdd").click(function(e) {
		const target = $(e.target);
		const size = target.data('size');
		const id = target.data('id');
		$.ajax({
			type: "GET",
			url: '/bsPdspuSizeNewAjax?id='+id+'&size='+size,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 尺寸 添加 ============= */
	/* ============= 尺寸 删除 ============= */
	$(".sDel").click(function(e) {
		const target = $(e.target);
		const size = target.data('size');
		const id = target.data('id');
		$.ajax({
			type: "GET",
			url: '/bsPdspuSizeDelAjax?id='+id+'&size='+size,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
	/* ============= 尺寸 增删 ============= */

})