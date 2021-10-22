$(() => {
	$(".new-span").click(function(e) {
		const target = $(e.target);
		const size = target.data("size");
		const standard = target.data("standard");
		$(".new-ipt-"+size+"-"+standard).toggle();
	})
	$(".new-ipt").keydown(function(e) {
		if (e.keyCode == 13) {  
			$(this).blur();
		}  
	});
	$(".new-ipt").blur(function(e) {
		const target = $(e.target);
		const url = target.data("url");
		const size = target.data("size");
		const standard = target.data("standard");
		const symbol = $(this).val().replace(/^\s*/g,"").toUpperCase();
		const data = "size="+size+"&standard="+standard+"&symbol="+symbol;
		$.ajax({
			type: "POST",
			url: url,
			data: data,
			success: function(results) {
				if(results.status === 200) {
					location.reload();
				} else {
					alert(results.message)
				}
			}
		});
	})
})