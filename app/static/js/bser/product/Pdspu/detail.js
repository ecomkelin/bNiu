$(() => {
	$(".pageBtn").click(function(e) {
		$(".pageBtn").removeClass("btn-success");
		$(".pageBtn").addClass("btn-default");
		$(this).removeClass("btn-default");
		$(this).addClass("btn-success");

		const optionPage = $(this).attr("id").split('-')[1];
		$(".page").hide();
		$("#page-"+optionPage).show();
	})

	$(".PternOption").click(function(e) {
		const id = $(this).attr("id");
		$(".PternTable").hide();
		$("#PternTable-"+id).show();
	})
	$(".PternAll").click(function(e) {
		$(".PternTable").show();
	})
})