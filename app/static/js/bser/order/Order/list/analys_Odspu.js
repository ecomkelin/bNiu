$(function() {
	let is_Odspu_analys = false;
	$("#interval-analys").click(function(e) {
		if(is_Odspu_analys) {
			$("#analysOdspu").hide();
		} else {
			intervalFilter_func();
			$.ajax({
				type: "GET",
				url: "/bsOrderAnalysAjax?"+interval+step,
				success: function(results) {
					if(results.status === 200) {
						const AnalysPdspus = results.data.AnalysPdspus;
						PdspusRender(AnalysPdspus)
					} else {
						alert(results.message)
					}
				}
			});
		}
		is_Odspu_analys = !is_Odspu_analys;
	})
})

const PdspusRender = (AnalysPdspus) => {
	let elem = ''
	elem += '<table class="table table-striped analysOdspu">';
		elem += '<thead><tr>'
			elem += '<th>产品</th>'
			elem += '<th>数量</th>'
		elem += '</tr></thead>'
		elem += '<tbody>'
			for(let i=0; i<AnalysPdspus.length; i++) {
				let AnalysOdspu = AnalysPdspus[i];
				elem += '<tr>'
					elem += '<td>['+AnalysOdspu.code+']'+AnalysOdspu.nome+'</td>'
					elem += '<td>'+AnalysOdspu.quan+'</td>'
				elem += '</tr>'
			}
		elem += '</tbody>'
	elem += '</table>'
	$(".analysOdspu").remove();
	$("#analysOdspu").append(elem);
}