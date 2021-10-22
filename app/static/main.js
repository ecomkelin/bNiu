/* ========================================= */
// css: 
// 	.js-browserWidth-pc				*重要 根据浏览器宽度 显示隐藏 用作电脑版开发和手机版开发 电脑版
// 	.js-browserWidth-mb				*重要 根据浏览器宽度 显示隐藏 用作电脑版开发和手机版开发 手机版
// 	.js-browserHeight-autoHeight	根据浏览器高度自动计算本类的高度, 一般用作首页元素的位置控制
// 	.js-browserHeight-quarter		根据浏览器高度自动计算本类的高度, 一般用作首页元素的位置控制
// 	.js-browserHeight-half			根据浏览器高度自动计算本类的高度, 一般用作首页元素的位置控制
// 	.js-browserHeight-quarter3		根据浏览器高度自动计算本类的高度, 一般用作首页元素的位置控制
// 	.js-browserHeight-autoFooter	根据浏览器高度自动计算footer的位置, 一般用作让footer沉底
// 	.js-input-focusHideZero 		input标签使用, 当前焦点input的值如果为0 则隐藏
// 	.js-scroll-DwHide 				鼠标滚动事件 如果鼠标滚轮向下滚动 则加入此类的标签 隐藏
// 	.js-scroll-UpHide 				鼠标滚动事件 如果鼠标滚轮向上滚动 则加入此类的标签 隐藏
// 	.js-scroll-DwHideUpShow 		鼠标滚动事件 如果鼠标滚轮向下滚动 则加入此类的标签 隐藏， 鼠标滚轮向上滚动 则显示
// 	.js-scroll-DwShowUpHide 		鼠标滚动事件 如果鼠标滚轮向下滚动 则加入此类的标签 显示 鼠标滚轮向上滚动 则隐藏
// 	.js-click-imgEnlarge			img 标签使用, 如果当前img标签 加上此类 则可以放大到幕布, 需要#js-picZoom-* 等id配合
// 	#js-picZoom-*					配合图片放大用的
// js: 
// 	jsFunc_isNumber(paramNumber) 										: 判断参数 paramNumber 是否是数字
//		int和float都为真 例子 ".1" "2." 为假 "10.023" "2" 为真
//		真返回 true 假返回 false
// 	jsFunc_transformTime(time = +new Date(), start =0, end = 19)		: 格式化时间	返回值如: "2021-01-29 12:49:29"
//		time 可以是时间戳 也可以是时间格式
//		start end 为返回时间字符串的起始和终止位置
//	jsFunc_timeSpan(time = +new Date())									: 计算time到现在的时间跨度 x年/月/日/时/分 前
//		
/* ========================================= */
$(() => {
	resizeWindow();
	$(window).resize(() => {		//当浏览器大小变化时
		resizeWindow()
	});
	// 如果js-input中的值为0FocusDelZero 则隐藏  如果js-input中的值为0FocusDelZero 则隐藏
	let ipt0 = true; // 记录进入焦点是数据是否为0,如果为0则失去焦点且没有输入时变回0
	// $(".js-input-focusHideZero").focus(function(e) {
	$("body").on('focus', '.js-input-focusHideZero', function(e){
		let thisVal = String($(this).val());
		if(thisVal == "0") {
			ipt0 = true;
			$(this).val('');
		} else {
			ipt0 = false;
		}
	})
	// $(".js-input-focusHideZero").blur(function(e) {
	$("body").on('blur', '.js-input-focusHideZero', function(e){
		let thisVal = $(this).val();
		if(ipt0 == true && (!thisVal || thisVal == "")) {
			$(this).val(0)
		}
	})

	/* ================================ 图片放大 ================================ */
	$("body").on('click', '.js-click-imgEnlarge', function(e){
		const target = $(e.target);
		const info = target.data('info');
		if(info) {
			$("#js-picZoom-info").text(info)
		} else {
			$("#js-picZoom-info").text("")
		}
		const _this = $(this);//将当前的js-click-imgEnlarge元素作为_this传入函数
		imgShowFront("#js-picZoom-outerdiv", "#js-picZoom-innerdiv", "#js-picZoom-zoomImg", _this);
	});

	$("body").on('click', '.js-click-printBtn', function(e) {
		window.print();
	})
})

/* ============= 页面滚动 隐藏导航栏 ============= */
let scrollHeightMain=0, tempMain=0;
$(window).scroll(event => {
	scrollHeightMain=$(this).scrollTop();
	if(tempMain<scrollHeightMain){
		$(".js-scroll-DwHide").hide();
		$(".js-scroll-DwHideUpShow").hide();
		$(".js-scroll-DwShowUpHide").show();
	} else if(tempMain>scrollHeightMain){
		$(".js-scroll-UpHide").hide();
		$(".js-scroll-DwHideUpShow").show();
		$(".js-scroll-DwShowUpHide").hide();
	}
	setTimeout(()=>tempMain=scrollHeightMain,0)
});

/* ============= 自适应 函数 ============= */
const resizeWindow = () => {
	// 根据浏览器宽度 显示电脑版或手机版
	let minH = 0;
	if($(window).width() >= 1024) {		// pad横屏
		minH = 650;
		$('.js-browserWidth-pc').show()
		$('.js-browserWidth-mb').hide()
	}else {
		minH = 550;
		$('.js-browserWidth-pc').hide()
		$('.js-browserWidth-mb').show()
	}
	// 自动补充 footer和body之间的间距
	const browH = $(window).height()
	const bodyH = $(document.body).height()
	$(".js-browserHeight-half").height((browH)/2)
	$(".js-browserHeight-quarter").height((browH)/4)
	$(".js-browserHeight-quarter3").height((browH)*3/4)
	$('.js-browserHeight-autoHeight').height(browH-minH)
	if(bodyH < browH) {
		footH = browH - bodyH
		$('.js-browserHeight-autoFooter').height(footH)
	}
}

/* =================================== 图片放大 =================================== */
const imgShowFront = (outerdiv, innerdiv, zoomImg, _this) => {
	const src = _this.attr("src");//获取当前点击的js-click-imgEnlarge元素中的src属性
	$(zoomImg).attr("src", src);//设置#zoomImg元素的src属性
	/*获取当前点击图片的真实大小，并显示弹出层及大图*/
	$("<img/>").attr("src", src).on('load', function(){
		const windowW = $(window).width();//获取当前窗口宽度
		const windowH = $(window).height();//获取当前窗口高度
		const realWidth = this.width;//获取图片真实宽度
		const realHeight = this.height;//获取图片真实高度
		const scale = 0.8;//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
		let imgWidth, imgHeight;
		if(realHeight>windowH*scale) { //判断图片高度
			imgHeight = windowH*scale;//如大于窗口高度，图片高度进行缩放
			imgWidth = imgHeight/realHeight*realWidth;//等比例缩放宽度
			if(imgWidth>windowW*scale) { //如宽度扔大于窗口宽度
				imgWidth = windowW*scale;//再对宽度进行缩放
			}
		} else if(realWidth>windowW*scale) { //如图片高度合适，判断图片宽度
			imgWidth = windowW*scale;//如大于窗口宽度，图片宽度进行缩放
			imgHeight = imgWidth/realWidth*realHeight;//等比例缩放高度
		} else if(realWidth<windowW*scale/2) { //如图片高度合适，判断图片宽度
			imgWidth = realWidth*2;//如大于窗口宽度，图片宽度进行缩放
			if(imgWidth<windowW*scale/2) {
				imgWidth *= 2;
			}
			imgHeight = imgWidth/realWidth*realHeight;//等比例缩放高度
			if(imgHeight>windowH*scale) { //如高度大于窗口高度
				imgWidth /= 2;
				imgHeight = imgWidth/realWidth*realHeight;//等比例缩放高度
			}
		} else { //如果图片真实高度和宽度都符合要求，高宽不变
			imgWidth = realWidth;
			imgHeight = realHeight;
		}
		$(zoomImg).css("width",imgWidth);//以最终的宽度对图片缩放

		const w = (windowW-imgWidth)/2;//计算图片与窗口左边距
		const h = (windowH-imgHeight)/2;//计算图片与窗口上边距
		$(innerdiv).css({"top":h, "left":w});//设置#innerdiv的top和left属性
		$(outerdiv).fadeIn("fast");//淡入显示#outerdiv及.js-click-imgEnlarge
	});

	$(outerdiv).click(function(){ //再次点击淡出消失弹出层
		$(this).fadeOut("fast");
	});
}

/* ============ 是否是小数 ============ */
const jsFunc_isFloat = num => {
	num = String(num).replace(/^\s*/g,"");
	if(num.length == 0) return false;
	const nums = num.split('.');
	if(nums.length > 2) return false;
	const n0 = parseInt(nums[0]);
	if(isNaN(n0)) return false;
	if(nums.length == 1) return true;
	const n1 = parseInt(nums[1]);
	if(isNaN(n1)) return false; 
	return true;
}

const jsFunc_transformTime = (time = +new Date(), start =0, end = 19) => {
	// if(!isNaN(time)) time = new Date(time);	// 如果
	const date = new Date(time);
	return date.toJSON().substr(start, end).replace('T', ' ');
}
const jsFunc_timeSpan = (time = +new Date()) => {
	if(isNaN(time)) time = time.getTime();
	const now = Date.now();
	const tsNum = now - date.getTime();
	const years = Math.floor(tsNum/(365*24*3600*1000));
	if(years > 1) {
		return years + '年前'
	} 
	const months=Math.floor(tsNum/(30*24*3600*1000))
	if(months > 1) {
		return months + '个月前'
	} 
	const days=Math.floor(tsNum/(24*3600*1000))
	if(days > 1) {
		return days + '天前'
	} 
	const hours=Math.floor(tsNum/(3600*1000))
	if(hours > 1) {
		return hours + '小时前'
	}
	const minits=Math.floor(tsNum/(60*1000))
	if(minits > 1) {
		return minits + '分钟前'
	}
	const seconds=Math.floor(tsNum/(1000))
	if(seconds < 1) seconds = 1;
	return seconds + '秒前'
}