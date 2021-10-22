const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const moment = require('moment');
const MdFilter = require('../../../../middle/MdFilter');
const FirmDB = require('../../../../models/login/Firm');

const OrderDB = require('../../../../models/order/Order');
const OdspuDB = require('../../../../models/order/Odspu');
const OdskuDB = require('../../../../models/order/Odsku');

const PdspuDB = require('../../../../models/product/Pdspu');


exports.bsOdspus = async(req, res) => {
	// console.log("/bsOdspus");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Odspus = await OdspuDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/order/Odspu/list", {title: "订单列表", info, Odspus, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsOdspus,Error&error="+error);
	}
}

exports.bsOdspusAjax = async(req, res) => {
	// console.log("/bsOdspusAjax");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = OdspusParamFilter(req, crUser);
		if(req.query.Order) {
			const Order = await OrderDB.findOne({_id: req.query.Order, Firm: crUser.Firm});
			if(!Order) return res.json({status: 500, message: "订单信息错误"})
			param["Order"] = Order._id;
		}

		const count = await OdspuDB.countDocuments(param);
		const objects = await OdspuDB.find(param, filter)
			.populate({path: "Pdspu", populate: [
				{path: "Pdskus"},
				{path: "Pterns"},
				{path: "Colors"},
			]})
			.populate("Pterns")
			.populate("Colors")
			.populate("Odskus")
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await OdspuDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOdspusAjax Error!"});
	}
}
const OdspusParamFilter = (req, crUser) => {
	let param = {
		"Firm": crUser.Firm,
	};
	const filter = {};
	const sortBy = {};

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

exports.bsOdspuAjax = async(req, res) => {
	// console.log("/bsOdspuAjax");
	try{
		const crUser = req.session.crUser;

		const param = {Firm: crUser.Firm, _id: req.query.id};

		const object = await OdspuDB.findOne(param)
			.populate("Pterns")
			.populate("Colors")
			.populate("SizeSyst")
		if(!object) return res.json({status: 500, message: "没有此产品"});

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOdspuAjax Error!"});
	}
}



exports.bsOdspuNew = async(req, res) => {
	// console.log("/bsOdspuNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const Firm = await FirmDB.findOne({_id: crUser.Firm});
		if(!Firm) return res.redirect("/error?info=bsOdspuNew,Firm not Exist");

		const Pdspu = await PdspuDB.findOne({_id : obj.Pdspu, Firm: crUser.Firm});
		if(!Pdspu) return res.redirect("/error?info=bsOdspuNew,Pdspu not Exist");
		obj.price = Pdspu.price;

		const Order = await OrderDB.findOne({_id : obj.Order, Firm: crUser.Firm});
		if(!Order) return res.redirect("/error?info=bsOdspuNew,Order not Exist");
		obj.cter = Order.cter;
		obj.crter = Order.crter;
		obj.Firm = Order.Firm;

		if(obj.Pterns) {
			if(!(obj.Pterns instanceof Array)) {
				obj.Pterns = [obj.Pterns];
			}
		}
		if(obj.Colors) {
			if(!(obj.Colors instanceof Array)) {
				obj.Colors = [obj.Colors];
			}
		}
		if(obj.sizes) {
			if(!(obj.sizes instanceof Array)) {
				obj.sizes = [obj.sizes];
			}
		}

		const OdspuSame = await OdspuDB.findOne({Order: Order._id, Pdspu: Pdspu._id});
		if(OdspuSame) return res.redirect("/error?info=bsOdspuNew,此订单中已经预定了此产品");

		const _object = new OdspuDB(obj);
		const OdspuSave = await _object.save();

		Order.Odspus.unshift(OdspuSave._id);
		const OrderSave = await Order.save();

		return res.redirect("/bsOrder/"+Order._id);
	} catch(error) {
		return res.redirect("/error?info=bsOdspuNew,Error&error="+error);
	}
}
exports.bsOdspuNewAjax = async(req, res) => {
	// console.log("/bsOdspuNewAjax");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const Firm = await FirmDB.findOne({_id: crUser.Firm});
		if(!Firm) return res.json({status: 500, message: "bsOdspuNewAjax Firm not Exist"});

		const Pdspu = await PdspuDB.findOne({_id : obj.Pdspu});
		if(!Pdspu) res.json({status: 500, message: "bsOdspuNewAjax Pdspu not Exist"});

		const Order = await OrderDB.findOne({_id : obj.Order});
		if(!Order) res.json({status: 500, message: "bsOdspuNewAjax Order not Exist"});
		obj.cter = Order.cter;
		obj.crter = Order.crter;
		obj.Firm = Order.Firm;

		const OdspuSame = await OdspuDB.findOne({Firm: crUser.Firm, Order: Order._id, Pdspu: Pdspu._id});
		if(OdspuSame) return res.json({status: 500, message: "bsOdspuNewAjax OdspuSame"});

		const _object = new OdspuDB(obj);
		const OdspuSave = await _object.save();
		return res.redirect("/bsOdspus");
	} catch(error) {
		return res.json({status: 500, message: "bsOdspuNewAjax Error"});
	}
}


exports.bsOdspu = async(req, res) => {
	// console.log("/bsOdspu");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;

		const Odspu = await OdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("cter")
			.populate("crter")
			.populate({
				path: "Odskus", options: { sort: { crtAt: -1 }},
				populate: [{path: "Pdsku"}, {path: "Pterns"}, {path: "Colors"}, {path: "Odskus"}]
			})
		if(!Odspu) return res.json({status: 500, message: "此订单已经不存在, 请刷新重试"});
		return res.render("./user/bser/order/Odspu/detail", {title: "订单详情", Odspu, crUser});
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOdspuDel,Error&error="+error);
	}
}

exports.bsOdspuUpdAjax = async(req, res) => {
	// console.log("/bsOdspuUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Odspu的id
		const Odspu = await OdspuDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Odspu) return res.json({status: 500, message: "没有找到此订单信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsOdspuUpdAjax code] 订单不正确"});
			const OdspuSame = await OdspuDB.findOne({code: val, Firm: crUser.Firm});
			if(OdspuSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsOdspuUpdAjax sort] 排序为数字, 请传递正确的参数"});
		}

		Odspu[field] = val;

		const OdspuSave = Odspu.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsOdspuDel = async(req, res) => {
	// console.log("/bsOdspuDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const Odspu = await OdspuDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Odspu) return res.redirect("/error?info=bsOdspuDel,此订单已经不存在, 请刷新重试");

		const Order = await OrderDB.findOne({_id: Odspu.Order}, {Odspus: 1});
		if(!Order) return res.redirect("/error?info=bsOdspuDel,所属订单不存在, 请刷新重试");
		Order.Odspus.remove(id);
		const OrderSave = await Order.save();

		const Odsku = await OdskuDB.deleteMany({Odspu: id});

		const OdspuDel = await OdspuDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsOrder/"+Order._id);
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsOdspuDel,Error&error="+error);
	}
}