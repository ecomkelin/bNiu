const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const moment = require('moment');
const MdFilter = require('../../../../middle/MdFilter');
const FirmDB = require('../../../../models/login/Firm');

const OrderDB = require('../../../../models/order/Order');
const OdspuDB = require('../../../../models/order/Odspu');
const OdskuDB = require('../../../../models/order/Odsku');

const PdspuDB = require('../../../../models/product/Pdspu');
const PdskuDB = require('../../../../models/product/Pdsku');

exports.bsOdskuNewAjax = async(req, res) => {
	// console.log("/bsOdskuNewAjax");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;

		const Pdspu = await PdspuDB.findOne({_id : obj.Pdspu}, {_id: 1});
		if(!Pdspu) res.json({status: 500, message: "bsOdskuNewAjax Pdspu not Exist"});

		const Odspu = await OdspuDB.findOne({_id : obj.Odspu});
		if(!Odspu) res.json({status: 500, message: "bsOdskuNewAjax Odspu not Exist"});
		if(String(Odspu.Pdspu) != String(Pdspu._id)) return res.json({status: 500, message: "bsOdskuNewAjax 订单产品不一致"});

		const Order = await OrderDB.findOne({_id: Odspu.Order});
		if(!Odspu) res.json({status: 500, message: "bsOdskuNewAjax Order not Exist"});

		const Pdsku = await PdskuDB.findOne({_id : obj.Pdsku});
		if(!Pdsku) return res.json({status: 500, message: "bsOdskuNewAjax Pdsku not Exist"});
		if(String(Pdsku.Pdspu) != String(Pdspu._id)) return res.json({status: 500, message: "bsOdskuNewAjax 此产品的SPU不包含此SKU"});
		if(obj.Ptern && obj.Ptern.length == 24){
			if(String(Pdsku.Ptern) != String(obj.Ptern)) return res.json({status: 500, message: "bsOdskuNewAjax 产品SKU的印花不一致"});
		} else {
			if(Pdsku.Ptern != null) return res.json({status: 500, message: "bsOdskuNewAjax null 产品SKU的印花不一致"});
			obj.Ptern = null;
		}
		if(obj.Color && obj.Color.length == 24){
			if(String(Pdsku.Color) != String(obj.Color)) return res.json({status: 500, message: "bsOdskuNewAjax 产品SKU的颜色不一致"});
		} else {
			if(Pdsku.Color != null) return res.json({status: 500, message: "bsOdskuNewAjax null 产品SKU的颜色不一致"});
			obj.Color = null;
		}
		if(obj.size != 0){
			if(String(Pdsku.size) != String(obj.size)) return res.json({status: 500, message: "bsOdskuNewAjax 产品SKU的颜色不一致"});
		} else {
			if(Pdsku.size != null) return res.json({status: 500, message: "bsOdskuNewAjax null 产品SKU的颜色不一致"});
			obj.size = null;
		}

		const OdskuSame = await OdskuDB.findOne({Firm: crUser.Firm, Odspu: Odspu._id, Pdspu: Pdspu._id, Pdsku: Pdsku._id});
		if(OdskuSame) return res.json({status: 500, message: "bsOdskuNewAjax OdskuSame"});

		obj.quan = parseInt(obj.quan);
		if(obj.quan < 0) return res.json({status: 500, message: "bsOdskuNewAjax 采购数量 参数错误 是大于0的整数"});

		const _object = new OdskuDB(obj);
		Odspu.Odskus.push(_object._id);

		const quanBal = obj.quan;
		const totBal = Odspu.price * quanBal;

		Odspu.quan += quanBal;
		Odspu.tot += totBal;

		Order.quan += quanBal;
		Order.tot += totBal;

		const OrderSave = await Order.save();
		const OdspuSave = await Odspu.save();
		const Odsku = await _object.save();
		return res.json({status: 200, data: {Odsku}});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsOdskuNewAjax Error"});
	}
}

exports.bsOdskuUpdAjax = async(req, res) => {
	// console.log("/bsOdskuUpdAjax");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;

		const Odsku = await OdskuDB.findOne({_id : obj._id});
		if(!Odsku) res.json({status: 500, message: "bsOdskuUpdAjax 不存在, 请刷新重试!"});

		const Odspu = await OdspuDB.findOne({_id : Odsku.Odspu});
		if(!Odspu) res.json({status: 500, message: "bsOdskuUpdAjax Odspu not Exist"});

		const Order = await OrderDB.findOne({_id: Odspu.Order});
		if(!Odspu) res.json({status: 500, message: "bsOdskuUpdAjax Order not Exist"});

		if(Order.step == 1) {
			obj.quan = parseInt(obj.quan);
			if(obj.quan < 0) return res.json({status: 500, message: "bsOdskuUpdAjax 采购数量 参数错误 是大于0的整数"});
			const quanBal = obj.quan - Odsku.quan;
			const totBal = Odspu.price * quanBal;

			Odspu.quan += quanBal;
			Odspu.tot += totBal;

			Order.quan += quanBal;
			Order.tot += totBal;

			Odsku.quan = obj.quan;
		} else if(Order.step == 15) {
			if(obj.ship) {
				obj.ship = parseInt(obj.ship);
				if(obj.ship < 0) return res.json({status: 500, message: "bsOdskuUpdAjax 发货数量 参数错误 是大于0的整数"});
				const shipBal = obj.ship - Odsku.ship;
				const totleBal = Odspu.price * shipBal;

				Odspu.ship += shipBal;
				Odspu.totle += totleBal;

				Order.ship += shipBal;
				Order.totle += totleBal;

				Odsku.ship = obj.ship;
			} else if(obj.balance) {
				const shipBal = parseInt(obj.balance);
				const totleBal = Odspu.price * shipBal;
				obj.ship = Odsku.quan + shipBal;
				if(obj.ship < 0) return res.json({status: 500, message: "bsOdskuUpdAjax 宗发货数量不能于0"});
				Odspu.ship += shipBal;
				Odspu.totle += totleBal;

				Order.ship += shipBal;
				Order.totle += totleBal;
				Odsku.ship = obj.ship;
			}
		}

		const OdskuSave = await Odsku.save();
		const OdspuSave = await Odspu.save();
		const OrderSave = await Order.save();
		return res.json({status: 200, data: {Odsku}});
	} catch(error) {
		return res.json({status: 500, message: "bsOdskuUpdAjax Error"});
	}
}