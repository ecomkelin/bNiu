$(function() {
	let OrderId = $("#OrderId").val();
	let OrderStep = $("#OrderStep").val();

	let page = 0;
	let count;
	let isMore;
	const getObjects = (urlQuery, elemId, isReload, role) => {
		$.ajax({
			type: "GET",
			url: urlQuery,
			success: function(results) {
				if(results.status === 200) {
					if(page+1 != results.data.page) {
						// 如果数据错误 则不输出
					} else {
						let objects = results.data.objects;
						page = results.data.page
						isMore = results.data.isMore
						count = results.data.count
						$("#objectCount").text(count)
						if(objects) {
							objectsRender(objects, elemId, isReload, role)
						}
					}
				} else {
					alert(results.message);
				}
			}
		});
	}

	const objectsRender = (objects, elemId, isReload, role) => {
		let elem = ''
		for(let i=0; i<objects.length; i++) {
			let object = objects[i];
			elem += '<div class="row mt-3 border rounded p-3 OdspusElem">'
				if(object.Pdspu) {
					let Pdspu = object.Pdspu;
					elem += '<div class="col-6">'
						elem += '<a href="/bsPdspu/'+Pdspu._id+'">产品编号: '+Pdspu.code+'</a>'
					elem += '</div>'
					elem += '<div class="col-6 ">'
						elem += '<div class="text-right jsDel-objElem" style="display:none">'
							elem += '<a class="text-danger" href="/bsOdspuDel/'+object._id+'">[清空]</a>'
						elem += '</div>'
					elem += '</div>'
					elem += OdskusTableRender(object);
				} else {
					elem += '<div class="col-12">产品错误</div>'
				}
			elem += '</div>'
		}
		if(isReload == 1) $(".OdspusElem").remove();
		if(!elemId) elemId = "#OdspusElem";
		$(elemId).append(elem);
	}
	const OdskusTableRender = (Odspu) => {
		// console.log("OdskusTableRender")
		let Pdspu = Odspu.Pdspu;

		let Pterns = new Array();
		if(Odspu.Pterns && Odspu.Pterns.length > 0) {
			Pterns = Odspu.Pterns;
		}  else {
			Pterns.push({_id: null, code: "Pattern Unico"});
		}

		let Colors = new Array();
		if(Odspu.Colors && Odspu.Colors.length > 0) {
			Colors = Odspu.Colors;
		} else {
			Colors.push({_id: null, code: "Color Unico"});
		}

		let sizes = new Array();
		if(Odspu.sizes && Odspu.sizes.length > 0) {
			sizes = Odspu.sizes;
		} else {
			sizes.push(0);
		}

		let widthTr = 100/(sizes.length+1);

		let elem = "";
		for(let PternsCyc=0; PternsCyc<Pterns.length; PternsCyc++) {
			const Ptern = Pterns[PternsCyc];
			let Ptern_Odskus = Odspu.Odskus.filter((Odsku_item) => {if((Odsku_item.Ptern == Ptern._id) || (String(Odsku_item.Ptern) == String(Ptern._id))) return true; return false; });
			let Ptern_Pdskus = Pdspu.Pdskus.filter((Pdsku_item) => {if((Pdsku_item.Ptern == Ptern._id) || (String(Pdsku_item.Ptern) == String(Ptern._id))) return true; return false; });
			// elem += '<div>'+Ptern_Odskus.length+'</div>'
			elem += '<div class="PternTable col-12 py-3 pl-5" id="PternTable-'+Ptern._id+'">'
				elem += '<div class="row mt-3">'
					elem += '<div class="col-md-2 text-center">';
						if(Ptern._id) {
							elem += '<img class="js-click-imgEnlarge" src="'+Ptern.photo+'" alt="Ptern Photo Lost" '
							elem += 'width="100%" height="80px" style="object-fit: scale-down;">'
						}
						elem += Ptern.code
					elem += '</div>'
					elem += '<div class="col-md-10">';
						elem += '<table class="table table-hover table-bordered text-center">'
							elem += '<thead>'
								elem += '<tr>'
									elem += '<th width='+widthTr+'%></th>'
									for(let sizesCycle=0; sizesCycle<sizes.length; sizesCycle++) {
										let size = sizes[sizesCycle];
										elem += '<th width='+widthTr+'%>'+ size +'</th>'
									}
								elem += '</tr>'
							elem += '</thead>'
							elem += '</tbody>'
								for(let ColorsCyc=0; ColorsCyc<Colors.length; ColorsCyc++) {
									let Color = Colors[ColorsCyc]
									let Color_Odskus = Ptern_Odskus.filter((Odsku_item) => {if((Odsku_item.Color == Color._id) || (String(Odsku_item.Color) == String(Color._id))) return true; return false; });
									let Color_Pdskus = Ptern_Pdskus.filter((Pdsku_item) => {if((Pdsku_item.Color == Color._id) || (String(Pdsku_item.Color) == String(Color._id))) return true; return false; });
									elem += '<tr>'
										// elem += '<td>'+Color_Odskus.length+'</td>'
										elem += '<td>'+Color.code+'</td>'
										for(let sizesCyc=0; sizesCyc<sizes.length; sizesCyc++) {
											let size = sizes[sizesCyc]
											let size_Odskus = Color_Odskus;
											let size_Pdskus = Color_Pdskus;
											if(size != 0) {
												size_Odskus = Color_Odskus.filter((Odsku_item) => {return Odsku_item.size == size});
												size_Pdskus = Color_Pdskus.filter((Pdsku_item) => {return Pdsku_item.size == size});
											}
											elem += '<td>'
												let Odsku = new Object();
												if(size_Odskus) Odsku = size_Odskus[0];
												if(OrderStep == 1) {
													elem += OdskuQuanRender(Odspu, Odsku, Ptern, Color, size, size_Pdskus[0]);
												} else if(OrderStep == 10 || OrderStep == 50) {
													elem += OdskuFinishRender(Odsku)
												} else if(OrderStep == 15) {
													elem += OdskuShipRender(Odsku, size_Pdskus[0])
												}
											elem += '</td>'
										}
									elem += '</tr>'
								}
							elem += '</tbody>'
						elem += '</table>'
					elem += '</div>'
				elem += '</div>'

			elem += '</div>'
		}
		return elem;
	}
	let OdspuNewLen = 0;
	const OdskuQuanRender = (Odspu, Odsku, Ptern, Color, size, Pdsku) =>{
		OdspuNewLen++;
		let elem = "";
		if(Odsku) {
			elem += '<form class="bsOdskuUpdAjax-Form" id="bsOdskuUpdAjax-Form-'+OdspuNewLen+'">'
				elem += '<input type="hidden" name="obj[_id]" value='+Odsku._id+'>';
				elem += '<input type="hidden" id="bsOdskuUpdAjax-orgQuan-'+OdspuNewLen+'" value='+Odsku.quan+'>';
				elem += '<input type="number" class="ajaxQuanIpt iptsty" data-edit="bsOdskuUpdAjax" data-len='+OdspuNewLen+' name="obj[quan]" value='+Odsku.quan+'>';
			elem += '</form>';
		} else {
			elem += '<form class="bsOdskuNewAjax-Form" id="bsOdskuNewAjax-Form-'+OdspuNewLen+'">'
				elem += '<input type="hidden" name="obj[Odspu]" value='+Odspu._id+'>';
				elem += '<input type="hidden" name="obj[Pdspu]" value='+Odspu.Pdspu._id+'>';
				elem += '<input type="hidden" name="obj[Ptern]" value='+Ptern._id+'>';
				elem += '<input type="hidden" name="obj[Color]" value='+Color._id+'>';
				elem += '<input type="hidden" name="obj[Pdsku]" value='+Pdsku._id+'>';
				elem += '<input type="hidden" name="obj[size]" value='+size+'>';
				elem += '<input type="hidden" id="bsOdskuNewAjax-orgQuan-'+OdspuNewLen+'" value=0>';
				elem += '<input type="number" class="ajaxQuanIpt iptsty" data-edit="bsOdskuNewAjax" data-len='+OdspuNewLen+' name="obj[quan]" value=0>';
			elem += '</form>';
		}
		return elem;
	}
	const OdskuShipRender = (Odsku, Pdsku) =>{
		let elem = "";
		if(Odsku) {
			elem += '<span class="mr-5" title="订量">'+Odsku.quan+'</span>';
			elem += '<span title="库存">'+Pdsku.stock+'</span>';
			elem += '<form class="bsOdskuUpdAjax-Form" id="bsOdskuUpdAjax-Form-'+Odsku._id+'">'
				elem += '<input type="hidden" name="obj[_id]" value='+Odsku._id+'>';
				elem += '<input type="hidden" id="bsOdskuUpdAjax-orgQuan-'+Odsku._id+'" value='+Odsku.ship+'>';
				elem += '<input type="number" class="ajaxQuanIpt iptsty" data-edit="bsOdskuUpdAjax" data-len='+Odsku._id+' name="obj[ship]" value='+Odsku.ship+'>';
			elem += '</form>';
		}
		return elem;
	}
	const OdskuFinishRender = (Odsku) =>{
		let elem = "";
		if(Odsku) {
			elem += '<span class="mr-5" title="订量">'+Odsku.quan+'</span>';
			// elem += '<span title="发货量">'+Odsku.ship+'</span>';
		}
		return elem;
	}
	$("body").on("blur", ".ajaxQuanIpt", function(e) {
		const target = $(e.target);
		const edit = target.data("edit");
		const len = target.data("len");
		const orgQuan = parseInt($("#"+edit+"-orgQuan-"+len).val());
		const quan = parseInt($(this).val());
		if(quan >= 0 && quan != orgQuan) {
			const form = $("#"+edit+"-Form-"+len);
			const data = form.serialize();
			$.ajax({
				type: "POST",
				url: "/"+edit,
				data: data,
				success: function(results) {
					if(results.status == 200) {
						let Odsku = results.data.Odsku;
						$("#"+edit+"-orgQuan-"+len).val(Odsku.quan);
					} else {
						alert(results.message);
					}
				}
			});
		}
	})
	
	/* ====== 初始加载 =====*/
	let urlQuery = '';
	let objectParam = '';
	let elemId = '';
	let role = '';
	objectsInit = () => {
		const objectFilter = $("#OdspusFilterAjax").val();
		if(objectFilter) {
			objectParam = objectFilter.split('@')[0];
			elemId = objectFilter.split('@')[1];
			role = objectFilter.split('@')[2];
		}
		urlQuery = objectParam;
		getObjects(urlQuery, elemId, 1, role);
	}
	objectsInit();


	/* ====== 根据搜索关键词 显示系列 ====== */
	$("body").on("input", "#codeSearch", function(e) {
		let code = $("#codeSearch").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		if(code && code.length > 0) {
			code = "&code=" + code;
		} else {
			code = "";
		}

		page = 0;
		urlQuery = objectParam + code;
		getObjects(urlQuery, elemId, 1, role);
	})

	$(window).scroll(function(){
		const scrollTop = $(this).scrollTop();
		const scrollHeight = $(document).height();
		const windowHeight = $(this).height();
		if(scrollTop + windowHeight + 58 > scrollHeight){
			if(isMore == 1) {
				getObjects(urlQuery+'&page='+(parseInt(page)+1), elemId, 0, role);
			}
		}
	});


	/* ====== 更新状态 ====== */
	$("body").on("click", ".changeStep", function(e) {
		const target = $(e.target);
		const url = target.data("url");
		const id = target.data("id");
		const cr = target.data("cr");
		const nt = target.data("nt");
		$.ajax({
			type: "GET",
			url: url+"?id="+id+"&cr="+cr+"&nt="+nt,
			success: function(results) {
				if(results.status === 200) {
					location.reload();
				} else {
					alert(results.message);
				}
			}
		});
	})
})