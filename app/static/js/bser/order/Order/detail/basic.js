$(() => {
	$(".preShipAt-btn").click(function(e) {
		$("#preShipAt-ipt").show();
		$("#preShipAt-ipt").focus();
	})
	$("#preShipAt-ipt").change(function(e) {
		const val = $(this).val()
		const strs = val.split('/');
		const preShipAt = strs[2]+'年'+strs[0]+'月'+strs[1]+'日';
		$("#preShipAt-span").text(preShipAt)
		$("#preShipAt-ipt").hide();

		const OrderId = $("#OrderId").val();
		const data = "id="+OrderId+"&field=preShipAt&val="+val;
		$.ajax({
			type: "POST",
			url: "/bsOrderUpdAjax",
			data: data,
			success: function(results) {
				if(results.status == 200) {
					location.reload();
				} else {
					alert(results.message)
				}
			}
		});
	})

	let end_time;
	countdown = ()=> {//倒计时
		var curr_time = parseInt(Date.now());
		var diff_time=parseInt((end_time-curr_time)/1000);// 倒计时时间差
		var h = Math.floor(diff_time / 3600);
		var m = Math.floor((diff_time / 60 % 60));
		var s = Math.floor((diff_time % 60));
		$('.countdownAt').html(h + "时" + m + "分" + s + "秒");
		if (diff_time<=0) {
			$('.countdownAt').html(0 + "时" + 0 + "分" + 0 + "秒");
		};
	}
	const init = () => {
		const preShipAt_ipt = $("#preShipAt-ipt").val();
		if(preShipAt_ipt) {
			end_time = new Date(preShipAt_ipt).setHours(18,0,0,0);
			countdown()
			setInterval('countdown()',2000);
		}
	}
	init();
})