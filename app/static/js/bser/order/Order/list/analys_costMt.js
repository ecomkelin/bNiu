$(function() {
	/* ====== 检查用料 ====== */
	$("body").on('click', '.checkboxOrder', function(e) {
		if($(this).attr("checked")) {
			$(this).removeAttr("checked");
		} else {
			$(this).attr("checked","true");
		}
	})

	let is_mt_analys = false;
	// 用料分析
	$("body").on("click", ".analys_CostMtBtnBox", (e) => {
		if(is_mt_analys) {
			$("#costMts").hide();
		} else {
			$("#costMts").show();
			const OrderIds = new Array();
			$(".checkboxOrder").each(function(index,elem) {
				if($(this).attr("checked")) {
					OrderIds.push($(this).val())
				}
			})
			if(OrderIds.length < 1) {
				$(".costMts").remove();
				alert("请选择订单")
			} else {
				const data = "OrderIds="+OrderIds;
				$.ajax({
					type: "POST",
					url: "/bsOrderCostMtAjax",
					data: data,
					success: function(results) {
						if(results.status === 200) {
							const costMts = results.data.costMts;
							if(costMts && costMts.length > 0) {
								costMtsRender(costMts)
							} else {
								alert("信息错误")
							}
						} else {
							alert(results.message)
						}
					}
				});
			}
		}
		is_mt_analys = !is_mt_analys;
	})
})

const costMtsRender = (costMts) => {
	let elem = ''
	elem += '<table class="table table-striped costMts">';
		elem += '<thead><tr>'
			elem += '<th>用料</th>'
			elem += '<th>供货商</th>'
			elem += '<th class="text-right">用量</th>'
		elem += '</tr></thead>'
		elem += '<tbody>'
			for(let i=0; i<costMts.length; i++) {
				let costMt = costMts[i];
				let Mtrial = costMt.Mtrial;
				elem += '<tr>'
					elem += '<td>'+Mtrial.code+'</td>'
					elem += '<td>'+Mtrial.MtFirm.code+'</td>'
					elem += '<td>'
						elem += '<div class="text-right"><strong>'+costMt.dosage+'</strong></div>'
						for(let j=0; j<costMt.Pterns.length; j++) {
							let ptern = costMt.Pterns[j];
							let Ptern = ptern.Ptern;
							elem += '<div class="row">'
								elem += '<div class="col-6">'+Ptern.code+'</div>'
								elem += '<div class="col-6">'+ptern.dosage+'</div>'
							elem += '</div>'
						}
					elem += '</td>'
				elem += '</tr>'
			}
		elem += '</tbody>'
	elem += '</table>'
	$(".costMts").remove();
	$("#costMts").append(elem);
}