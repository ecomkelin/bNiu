const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const moment = require('moment');
const MdFilter = require('../../../../middle/MdFilter');
const FirmDB = require('../../../../models/login/Firm');

const OrderDB = require('../../../../models/order/Order');
const OdspuDB = require('../../../../models/order/Odspu');
const OdskuDB = require('../../../../models/order/Odsku');

exports.bsOrders = async(req, res) => {
	// console.log("/bsOrders");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Orders = await OrderDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/order/Order/list", {title: "订单列表", info, Orders, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsOrders,Error&error="+error);
	}
}

exports.bsOrdersAjax = async(req, res) => {
	// console.log("/bsOrdersAjax");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = OrdersParamFilter(req, crUser);
		const count = await OrderDB.countDocuments(param);
		const objects = await OrderDB.find(param, filter)
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await OrderDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		let isMore = 1;
		if((page-1) * pagesize + objects.length >= count) isMore = 0;
		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize, isMore}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOrdersAjax Error!"});
	}
}
const OrdersParamFilter = (req, crUser) => {
	let param = {
		"Firm": crUser.Firm,
		"step": {"$ne": Conf.OrderStep.history.num}
	};
	const filter = {};
	const sortBy = {};

	if(req.query.code) {
		let symbConb = String(req.query.code)
		symbConb = symbConb.replace(/^\s*/g,"").toUpperCase();
		symbConb = new RegExp(symbConb + '.*');
		param["code"] = {'$in': symbConb};
		param["step"] = {'$ne': null};
	}

	if(req.query.step) {
		if(req.query.step == "all") {
			param["step"] = {"$ne": null};
		} else {
			let symbConb = parseInt(req.query.step)
			param["step"] = symbConb;
		}
	}

	if(req.query.fromAt) {
		let symbConb = new Date(req.query.fromAt).setHours(0,0,0,0);
		param["crtAt"] = {"$gte": symbConb};
	}
	if(req.query.toAt) {
		let symbConb = new Date(req.query.toAt).setHours(23,59,59,0);
		param["crtAt"] = {"$lt": symbConb};
	}

	if(req.query.sortKey && req.query.sortVal) {
		let sortKey = req.query.sortKey;
		let sortVal = parseInt(req.query.sortVal);
		if(!isNaN(sortVal) && (sortVal == 1 || sortVal == -1)) {
			sortBy[sortKey] = sortVal;
		}
	}

	sortBy['crtAt'] = -1;

	const {page, pagesize, skip} = MdFilter.page_Filter(req);
	return {param, filter, sortBy, page, pagesize, skip};
}




exports.bsOrderNew = async(req, res) => {
	// console.log("/bsOrderNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.crter = crUser._id;
		obj.Firm = crUser.Firm;
		const Firm = await FirmDB.findOne({_id: crUser.Firm});
		if(!Firm) return res.redirect("/error?info=bsOrderNew,公司信息错误");

		const preOrder = await OrderDB.findOne({Firm : crUser.Firm })
			.sort({'crtAt': -1})
		obj.code = bsOrderGetCode(preOrder, crUser);

		const OrderSame = await OrderDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(OrderSame) return res.redirect("/error?info=bsOrderNew,OrderSame");

		const _object = new OrderDB(obj);
		const OrderSave = await _object.save();
		return res.redirect("/bsOrder/"+OrderSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsOrderNew,Error&error="+error);
	}
}
const bsOrderGetCode = (preOrder, crUser) => {
	const nowForm = new Date();
	const year = nowForm.getFullYear();
	const month = nowForm.getMonth()+1;
	const Mth = Conf.month[month];

	let codeNum = "0001";
	if(preOrder) {
		const poMonth = Conf.month[preOrder.crtAt.getMonth()+1];
		if(Mth == poMonth) {
			codeNum = String(parseInt(preOrder.code.split(poMonth)[1])+1);
			for(let len = codeNum.length; len < 4; len = codeNum.length) { // 序列号补0
				codeNum = "0" + codeNum;
			}
		}
	}
	
	return String(year%100) + Mth + codeNum;
}

exports.bsOrder = async(req, res) => {
	// console.log("/bsOrder");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;

		const Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("cter")
			.populate("crter")
			.populate({
				path: "OdCostMts",
				populate: [
					{path: "Mtrial", populate: {path: "MtFirm", select: "code"}},
					{path: "Pterns.Ptern", select: "code"},
				]
			})
		if(!Order) return res.json({status: 500, message: "此订单已经不存在, 请刷新重试"});

		return res.render("./user/bser/order/Order/detail", {title: "订单详情", Order, crUser});
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOrderDel,Error&error="+error);
	}
}

exports.bsOrderUpdStepAjax = async(req, res) => {
	// console.log("/bsOrderUpdStepAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.query.id;		// 所要更改的Order的id
		const cr = parseInt(req.query.cr);
		const nt = parseInt(req.query.nt);

		let Order;
		if(cr == 1) {
			Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
				.populate({
					path: "Odspus", options: { sort: { crtAt: -1 }},
					populate: {
						path: "Odskus", populate: {
							path: "Pdsku", populate: [{
								path: "PdCostMts",
								match: {Mtrial: {$ne: null}},
								populate: {path: "Mtrial"}
							}, {
								path: "Pdspu", select: "code"
							}]
						}
					}
				})
		} else {
			Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
		}
		if(!Order) return res.json({status: 500, message: "没有找到此订单信息, 请刷新重试"});

		if(cr != Order.step) return res.json({status: 500, message: "当前step值传递错误, 请刷新重试"});

		if(cr == 1 && (nt == 5 || nt == 10 || nt == 15 || nt == 20)) {
			Order.startAt = Date.now();
			Order.imp = Order.tot;
			if(nt == 20) {
				Order.finishAt = Date.now();
			}

			let errMsgBreak = null;		// 如果发生错误 则需要跳出循环 输出错误
			const OdCostMts = new Array();	// 订单的用料保存
			let OdskuLen = 0;	// 订单下的 sku数量
			// Order.Odspus.forEach((Odspu) => {})
			for(let OdspuIndex = 0; OdspuIndex < Order.Odspus.length; OdspuIndex++) {
				const Odspu = Order.Odspus[OdspuIndex]
				if(errMsgBreak) break;
				// Odspu.Odskus.forEach((Odsku) => {})
				for(let OdskuIndex = 0; OdskuIndex<Odspu.Odskus.length; OdskuIndex++) {
					OdskuLen++;
					const Odsku = Odspu.Odskus[OdskuIndex];		// 找到订单的最小单位 订单SKU
					if(errMsgBreak) break;
					// Odsku.Pdsku.PdCostMts.forEach((PdCostMt) => {})
					for(let PdCostMtIndex = 0; PdCostMtIndex < Odsku.Pdsku.PdCostMts.length; PdCostMtIndex++) {
						const PdCostMt = Odsku.Pdsku.PdCostMts[PdCostMtIndex];	// 找到此产品SKU的每个个用料
						if(errMsgBreak) break;
						if(!PdCostMt.dosage || isNaN(PdCostMt.dosage)) {
							const Pdspu = Odsku.Pdsku.Pdspu;
							errMsgBreak = Pdspu.code+"号产品 没有填写用量, 请补充";
							break;
						} else {
							let i=0;
							for(; i<OdCostMts.length; i++) {
								if(String(OdCostMts[i].Mtrial) == String(PdCostMt.Mtrial._id)) {
									OdCostMts[i].dosage += PdCostMt.dosage * Odsku.quan;
									if(PdCostMt.Mtrial.isPtern == 1) {
										let j=0;
										for(; j<OdCostMts[i].Pterns.length; j++) {
											if(String(OdCostMts[i].Pterns[j].Ptern) == String(Odsku.Pdsku.Ptern)) {
												OdCostMts[i].Pterns[j].dosage += PdCostMt.dosage * Odsku.quan;
												break;
											}
										}
										if(j == OdCostMts[i].Pterns.length) {
											OdCostMts[i].Pterns.push({Ptern: Odsku.Pdsku.Ptern, dosage: PdCostMt.dosage * Odsku.quan});
										}
										// const Pterns = new Array();
										// Pterns.push({Ptern: Odsku.Pdsku.Ptern, dosage: OdCostMt.dosage});
										// OdCostMt.Pterns = Pterns;
									}
									break;
								}
							}
							if(i == OdCostMts.length) {
								const OdCostMt = new Object();
								OdCostMt.Mtrial = PdCostMt.Mtrial._id;
								OdCostMt.dosage = PdCostMt.dosage * Odsku.quan;
								OdCostMt.Pterns = new Array();
								if(PdCostMt.Mtrial.isPtern == 1) {
									OdCostMt.Pterns.push({Ptern: Odsku.Pdsku.Ptern, dosage: OdCostMt.dosage});
								}
								OdCostMts.push(OdCostMt);
							}
						}
					}
				}
			}
			if(errMsgBreak) return res.json({status: 500, message: errMsgBreak});
			if(OdskuLen < 1) return res.json({status: 500, message: "请添加产品"})
			Order.OdCostMts = OdCostMts;

		} else if((cr == 5 || cr == 10 || cr == 15 || cr == 20) && nt == 50) {
			
		} else if((cr == 5 || cr == 10 || cr == 15 || cr == 20 || cr == 50) && nt == 1) {
			Order.OdCostMts = [];
		} else {
			return res.json({status: 500, message: "更改step值传递错误, 请刷新重试"});
		}

		Order.step = nt;

		const OdspuUpdMany = await OdspuDB.updateMany({_id: Order.Odspus}, {step: nt});

		const OrderSave = Order.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsOrderUpdAjax = async(req, res) => {
	// console.log("/bsOrderUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Order的id
		const Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Order) return res.json({status: 500, message: "没有找到此订单信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "preShipAt") {
			if(val.length != 10) return res.json({status: 400, message: "时间参数错误"});
			Order[field] = new Date(val).setHours(0,0,0,0);
		} else {
			return res.json({status: 400, message: "不可修改此数据"});
		}

		const OrderSave = Order.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsOrderDel = async(req, res) => {
	// console.log("/bsOrderDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const Order = await OrderDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Order) return res.json({status: 500, message: "此订单已经不存在, 请刷新重试"});

		const OdskusDeleteMany = await OdskuDB.deleteMany({Odspu: {"$in": Order.Odspus}})
		const OdspusDeleteMany = await OdspuDB.deleteMany({_id: {"$in": Order.Odspus}});

		const OrderDel = await OrderDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsOrders");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOrderDel,Error&error="+error);
	}
}

exports.bsOrderCostMtAjax = async(req, res) => {
	// console.log("/bsOrderCostMtAjax");
	try{
		const OrderIds = req.body.OrderIds;
		if(!OrderIds) return res.json({status: 500, message: "参数错误, 请传输订单编号"});
		const idsArr = OrderIds.split(",")
		const ids = new Array();
		idsArr.forEach((item) => {
			ids.push(item);
		})
		const Orders = await OrderDB.find({_id: {$in: ids}}, {OdCostMts: 1, code: 1})
			.populate({
				path: "OdCostMts.Mtrial",
				select: "code MtFirm",
				populate: {path: "MtFirm", select: "code"}
			})
			.populate({
				path: "OdCostMts.Pterns.Ptern",
				select: "code"
			})
		const costMts = new Array();
		Orders.forEach((Order) => {		// 分出 单个订单
			Order.OdCostMts.forEach((OdCostMt) => {	// 每个订单下 分别的用料 
				let i = 0;
				for(; i<costMts.length; i++) {
					const costMt = costMts[i];
					// 如果此用料已经保存
					if(OdCostMt.Mtrial._id == costMt.Mtrial._id) {
						costMt.dosage += OdCostMt.dosage;

						for(let n=0; n<OdCostMt.Pterns.length; n++) {	// 找出每个用料下的所有印花
							let m=0;
							for(; m<costMt.Pterns.length; m++) {
								if(String(costMt.Pterns[m].Ptern._id) == String(OdCostMt.Pterns[n].Ptern._id)) {
									costMt.Pterns[m].dosage += OdCostMt.Pterns[n].dosage;
									break;
								}
							}
							if(m == costMt.Pterns.length) {
								costMt.Pterns.push(OdCostMt.Pterns[n]);
								/* 不能push进取对象 */
								costMt.Pterns[costMt.Pterns.length-1].Ptern = OdCostMt.Pterns[n].Ptern;
							}
						}
						break;
					}
				}
				if(i == costMts.length) {		// 以每种用料为基础 放入用料列表中
					costMts.push(OdCostMt); 
				}
			})
		})
		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {
				costMts
			}
		});
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: "bsOrderCostMtAjax Error!"});
	}
}

exports.bsOrderAnalysAjax = async(req, res) => {
	// console.log("/bsOrderAnalys");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = OrdersParamFilter(req, crUser);

		const objects = await OrderDB.find(param, {Odspus: 1})
			.populate([
				{
					path: "Odspus", select: "quan Pdspu", 
					populate: {path: "Pdspu", select: "code", populate: {path: "PdNome", select: "code"}}
				}
			])
			.sort(sortBy);
		const AnalysPdspus = new Array();
		objects.forEach(order => {
			order.Odspus.forEach(odspu => {
				// console.log(odspu)
				let i = 0;
				for(;i<AnalysPdspus.length; i++) {
					if(String(odspu.Pdspu._id) == AnalysPdspus[i].id) {
						AnalysPdspus[i].quan += parseInt(odspu.quan);
						break;
					}
				}
				if(i == AnalysPdspus.length) {
					const AnalysPdspu = new Object();
					AnalysPdspu.id = String(odspu.Pdspu._id);
					AnalysPdspu.code = String(odspu.Pdspu.code);
					AnalysPdspu.nome = String(odspu.Pdspu.PdNome.code);
					AnalysPdspu.quan = parseInt(odspu.quan);
					AnalysPdspus.push(AnalysPdspu);
				}
			})
		})
		function compare(p){ //这是比较函数
			return function(m,n){
				var a = m[p];
				var b = n[p];
				return b - a; //升序
			}
		}
		AnalysPdspus.sort(compare("quan"));
		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {AnalysPdspus}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOrderAnalys Error!"});
	}
}