/*
	[产品spu]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');
const MdFilter = require('../../../../middle/MdFilter');

const PdspuDB = require('../../../../models/product/Pdspu');
const PdCategDB = require('../../../../models/product/PdCateg');
const PdNomeDB = require('../../../../models/product/PdNome');
const SizeSystDB = require('../../../../models/attr/SizeSyst');

const SizeDB = require('../../../../models/attr/Size');

const PdCostMtDB = require('../../../../models/product/PdCostMt');
const PdskuDB = require('../../../../models/product/Pdsku');

const OrderDB = require('../../../../models/order/Order');
const OdspuDB = require('../../../../models/order/Odspu');

exports.bsPdspus = async(req, res) => {
	// console.log("/bsPdspus");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const PdNomes = await PdNomeDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		const PdCategs = await PdCategDB.find({level: 1, Firm: crUser.Firm})
			.populate({path: "PdCategSons", populate: {path: "PdCategSons"}})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/product/Pdspu/list", {title: "产品列表", info, PdNomes, PdCategs, crUser});
	} catch(error) {
		console.log(error)
		return res.redirect("/error?info=bsPdspus,Error&error="+error);
	}
}
exports.bsPdspusAjax = async(req, res) => {
	// console.log("/bsPdspusAjax");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = PdspusParamFilter(req, crUser);
		if(req.query.xOrder) {
			const Order = await OrderDB.findOne({_id: req.query.xOrder},{Odspus: 1})
				// .populate("Odspus", "Pdspu")
				.populate({path: "Odspus", select: "Pdspu"})
			if(Order && Order.Odspus && Order.Odspus.length>0) {
				const xPdspus = new Array();
				Order.Odspus.forEach((item) => {
					if(item.Pdspu) {
						xPdspus.push(item.Pdspu);
					}
				});
				param["_id"] = {'$nin': xPdspus};
			}
		}
		const count = await PdspuDB.countDocuments(param);
		const objects = await PdspuDB.find(param, filter)
			.populate("PdCategFir")
			.populate("PdCategSec")
			.populate("PdCategThd")
			.populate("PdNome")
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await PdspuDB.findOne({code: code, Firm: crUser.Firm}, filter);
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
		return res.json({status: 500, message: "bsPdspusAjax Error!"});
	}
}
const PdspusParamFilter = (req, crUser) => {
	let param = {
		"Firm": crUser.Firm,
	};
	const filter = {};
	const sortBy = {};

	if(req.query.code) {
		let symbConb = String(req.query.code)
		symbConb = symbConb.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		symbConb = new RegExp(symbConb + '.*');
		param["code"] = symbConb;
	}

	if(req.query.PdNome) {
		let symbConb = req.query.PdNome
		if(symbConb.length == 24) {
			param["PdNome"] = {'$eq': symbConb};
		}
	}

	if(req.query.PdCategFir) {
		let symbConb = req.query.PdCategFir
		if(symbConb.length == 24) {
			param["PdCategFir"] = {'$eq': symbConb};
		}
	}

	if(req.query.PdCategSec) {
		let symbConb = req.query.PdCategSec
		if(symbConb.length == 24) {
			param["PdCategSec"] = {'$eq': symbConb};
		}
	}

	if(req.query.PdCategThd) {
		let symbConb = req.query.PdCategThd
		if(symbConb.length == 24) {
			param["PdCategThd"] = {'$eq': symbConb};
		}
	}

	if(req.query.sortKey && req.query.sortVal) {
		let sortKey = req.query.sortKey;
		let sortVal = parseInt(req.query.sortVal);
		if(!isNaN(sortVal) && (sortVal == 1 || sortVal == -1)) {
			sortBy[sortKey] = sortVal;
		}
	}

	sortBy['sort'] = -1;
	sortBy['updAt'] = -1;

	const {page, pagesize, skip} = MdFilter.page_Filter(req);
	return {param, filter, sortBy, page, pagesize, skip};
}

exports.bsPdspuAjax = async(req, res) => {
	// console.log("/bsPdspuAjax");
	try{
		const crUser = req.session.crUser;

		const param = {Firm: crUser.Firm, _id: req.query.id};

		const object = await PdspuDB.findOne(param)
			.populate("PdNome")
			.populate("Pterns")
			.populate("Colors")
		if(!object) return res.json({status: 500, message: "没有此产品"});

		let SizeSystId = null;
		if(object.SizeSyst) SizeSystId = object.SizeSyst._id;

		const Sizes = await SizeDB.find({SizeSyst: SizeSystId, Firm: crUser.Firm});

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsPdspuAjax Error!"});
	}
}



exports.bsPdspuAdd = async(req, res) => {
	// console.log("/bsPdspuAdd");
	try{
		const crUser = req.session.crUser;
		const SizeSysts = await SizeSystDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/product/Pdspu/add", {title: "添加新产品", SizeSysts, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuAdd,Error&error="+error);
	}
}


const PdspuFilter_Func = async(req) => {
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		// Pdspu值的判断
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 3) return {obj: null, info: "PdspuFilter_Func,编号长度最小为3"};
		obj.price = parseFloat(obj.price);
		if(isNaN(obj.price)) return {obj: null, info: "PdspuFilter_Func,请输入正确售价"};
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return {obj: null, info: "PdspuFilter_Func,请输入正确成本格式, 可以不输入"};
		}
		if(obj.weight) {
			obj.weight = parseFloat(obj.weight);
			if(isNaN(obj.weight)) return {obj: null, info: "PdspuFilter_Func,请输入正确的重量值, 可以不输入"};
		}

		if(obj.PdCategFir) {
			const PdCategFir = await PdCategDB.findOne({_id: obj.PdCategFir, Firm: crUser.Firm})
				.populate({path: "PdCategSons", populate: {path: "PdCategSons"}});
			if(!PdCategFir) return {obj: null, info: "/error?info=PdspuFilter_Func,没有此分类(Fir)"};
			if(obj.PdCategSec) {
				const PdCategSec = PdCategFir.PdCategSons.find((item) => {return item._id == String(obj.PdCategSec);});
				if(!PdCategSec) return {obj: null, info: "/error?info=PdspuFilter_Func,没有此分类(Sec)"}
				if(obj.PdCategThd) {
					const PdCategThd = PdCategSec.PdCategSons.find((item) => {return item._id == String(obj.PdCategThd);});
					if(!PdCategThd) return {obj: null, info: "/error?info=PdspuFilter_Func,没有此分类(Thd)"};
				} else {
					obj.PdCategThd = null;
				}
			} else {
				obj.PdCategSec = null;
				obj.PdCategThd = null;
			}
		} else {
			obj.PdCategFir = null;
			obj.PdCategSec = null;
			obj.PdCategThd = null;
		}

		if(obj.PdNome) {
			const PdNome = await PdNomeDB.findOne({_id: obj.PdNome, Firm: crUser.Firm});
			if(!PdNome) return {obj: null, info: "/error?info=PdspuFilter_Func,没有此名称"};
		} else {	// 如果没有此名称 则自动添加
			const codePdNome = req.body.codePdNome.replace(/^\s*/g,"").toUpperCase();
			if(codePdNome.length < 1) return {obj: null, info: "/error?info=bsPdNomeNew,codePdNome"};
			const PdNomeSame = await PdNomeDB.findOne({code: codePdNome, Firm: crUser.Firm});
			if(PdNomeSame) {
				obj.PdNome = PdNomeSame._id;
			} else {
				const objPdNome = new Object();
				objPdNome.Firm = crUser.Firm;
				objPdNome.code = codePdNome;
				const _objectPdNome = new PdNomeDB(objPdNome);
				const PdNomeSave = await _objectPdNome.save();
				obj.PdNome = PdNomeSave._id;
			}
		}
		if(obj.SizeSyst) {
			const SizeSyst = await SizeSystDB.findOne({_id: obj.SizeSyst, Firm: crUser.Firm});
			if(!SizeSyst) return {obj: null, info: "/error?info=PdspuFilter_Func,没有此尺寸标准"};
		} else {
			obj.PdNome = null;
		}


		return {obj, info: null};
	} catch(error) {
		console.log(error);
		return {obj: null, info: "/error?info=PdspuFilter_Func,Error&error="+error};
	}
}
exports.bsPdspuNew = async(req, res) => {
	// console.log("/bsPdspuNew");
	try{
		const crUser = req.session.crUser;
		const {obj, info} = await PdspuFilter_Func(req);
		if(!obj) return res.redirect("/bsPdspus?info="+info);
		// Pdspu值的初始化
		obj.Firm = crUser.Firm;
		obj.photo = Conf.photo.Pdspu.def;

		const PdspuSame = await PdspuDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(PdspuSame) return res.redirect("/error?info=bsPdspuNew,PdspuSame");

		const _object = new PdspuDB(obj);
		// 自动添加 PdCostMt
		const objPdCostMt = new Object();
		objPdCostMt.Firm = crUser.Firm;
		objPdCostMt.Pdspu = _object._id;
		const _objPdCostMt = new PdCostMtDB(objPdCostMt);
		_object.PdCostMts.push(_objPdCostMt._id);
		// 自动添加 Pdsku
		const objPdsku = new Object();
		objPdsku.Firm = crUser.Firm;
		objPdsku.Pdspu = _object._id;
		objPdsku.stock = 0;
		objPdsku.sale = 0;
		objPdsku.PdCostMts = [_objPdCostMt._id];
		const _objPdsku = new PdskuDB(objPdsku);
		_object.Pdskus.push(_objPdsku._id);

		const PdspuSave = await _object.save();
		const PdCostMtSave = await _objPdCostMt.save();
		const PdskuSave = await _objPdsku.save();

		return res.redirect("/bsPdspus");
	} catch(error) {
		console.log(error)
		return res.redirect("/error?info=bsPdspuNew,Error&error="+error);
	}
}
exports.bsPdspuUpd = async(req, res) => {
	// console.log("/bsPdspuUpd");
	try{
		const crUser = req.session.crUser;

		const Pdspu = await PdspuDB.findOne({_id: req.body.obj._id, Firm: crUser.Firm});
		if(!Pdspu) return res.redirect("/error?info=bsPdspuUpd,没有找到此材料信息");

		const {obj, info} = await PdspuFilter_Func(req);
		if(!obj) return res.redirect("/bsPdspus?info="+info);

		const PdspuSame = await PdspuDB.findOne({_id: {"$ne": obj._id}, code: obj.code, Firm: crUser.Firm});
		if(PdspuSame) return res.redirect("/error?info=bsPdspuUpd,有相同的编号");

		const _object = _.extend(Pdspu, obj);
		const PdspuSave = await _object.save();
		return res.redirect("/bsPdspu/"+PdspuSave._id);
	} catch(error) {
		console.log(error)
		return res.redirect("/error?info=bsPdspuUpd,Error&error="+error);
	}
}
exports.bsPdspuUpdAjax = async(req, res) => {
	// console.log("/bsPdspuUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Pdspu的id
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Pdspu) return res.json({status: 500, message: "没有找到此产品信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		console.log(field)
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PdspuSame = await PdspuDB.findOne({code: val, Firm: crUser.Firm});
			if(PdspuSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "photo") {
			val = String(val).replace(/^\s*/g,"");
			if(val != Pdspu[field]) {
				MdFile.delFile(Pdspu[field]);
				if(!val) val = Conf.photo.Pdspu.def;
			}
		} else if(field == "PdNome") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "名称填写错误"});
			const PdNome = await PdNomeDB.findOne({Firm: crUser.Firm, code: val, Firm: crUser.Firm});
			if(PdNome) {
				val = PdNome._id;
			} else {
				const objPdNome = new Object();
				objPdNome.Firm = crUser.Firm;
				objPdNome.code = val;

				const _objectPdNome = new PdNomeDB(objPdNome);
				const PdNomeSave = await _objectPdNome.save();
				val = PdNomeSave._id;
			}

		} else if(field == "SizeSyst") {
			if(val.length != 24) return res.json({status: 500, message: "尺寸标准操作错误"});
			const SizeSyst = await SizeSystDB.findOne({_id: val, Firm: crUser.Firm});
			if(!SizeSyst) return res.json({status: 500, message: "尺寸标准没有找到"})
		} else if(field == "PdCategFir") {
			if(val.length != 24) return res.json({status: 500, message: "分类修改 参数错误(Fir)"});
			const PdCategFir = await PdCategDB.findOne({_id: val, Firm: crUser.Firm});
			if(!PdCategFir) return res.json({status: 500, message: "没有找到分类(Fir)"})
		} else if(field == "PdCategSec") {
			if(val.length != 24) return res.json({status: 500, message: "分类修改 参数错误(Sec)"});
			const PdCategSec = await PdCategDB.findOne({_id: val, Firm: crUser.Firm});
			if(!PdCategSec) return res.json({status: 500, message: "没有找到分类(Sec)"})
		} else if(field == "PdCategThd") {
			if(val.length != 24) return res.json({status: 500, message: "分类修改 参数错误(Thd)"});
			const PdCategThd = await PdCategDB.findOne({_id: val, Firm: crUser.Firm});
			if(!PdCategThd) return res.json({status: 500, message: "没有找到分类(Thd)"})
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsPdspuUpdAjax sort] 排序为数字, 请传递正确的参数"});
		} else {
			return res.json({status: 500, message: "参数错误"});
		}

		Pdspu[field] = val;

		const PdspuSave = Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: error});
	}
}
exports.bsPdspuPhotoUpd = async(req, res) => {
	// console.log("/bsPdspuPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Pdspu = await PdspuDB.findOne({_id: obj._id, Firm: crUser.Firm});
		if(!Pdspu) return res.redirect("/error?info=没有找到此产品信息");
		const delPhoto = Pdspu.photo;
		Pdspu.photo = photo;
		const PdspuSave = await Pdspu.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsPdspu/"+PdspuSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPdspuPhotoUpd,Error&error="+error);
	}
}


exports.bsPdspu = async(req, res) => {
	// console.log("/bsPdspu");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PdCategFir")
			.populate("PdCategSec")
			.populate("PdCategThd")
			.populate("PdNome")
			.populate("Mtrials")
			.populate("SizeSyst")
			.populate("Colors")
			.populate("Pterns")
			.populate("PdCostMts")
			.populate("Pdskus")
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		let SizeSystId = null;
		if(Pdspu.SizeSyst) SizeSystId = Pdspu.SizeSyst._id;

		// const Sizes = await SizeDB.find({SizeSyst: SizeSystId, Firm: crUser.Firm});
		const SizeSysts = await SizeSystDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});

		return res.render("./user/bser/product/Pdspu/detail", {title: "产品详情", Pdspu, SizeSysts, crUser});
	} catch(error) {
		console.log(error)
		return res.redirect("/error?info=bsPdspu,Error&error="+error);
	}
}
exports.bsPdspuUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PdCategFir")
			.populate("PdCategSec")
			.populate("PdCategThd")
			.populate("PdNome");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");

		const SizeSysts = await SizeSystDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/product/Pdspu/update/basicUp", {title: "产品更新", Pdspu, SizeSysts, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}

exports.bsPdspuDel = async(req, res) => {
	// console.log("/bsPdNomeDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const PdspuExist = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("Odspus");
		if(!PdspuExist) return res.redirect("/bsPdspus?info=此产品已经不存在 请刷新查看");
		if(!PdspuExist.Odspus || PdspuExist.Odspus.length > 0) return res.redirect("/bsPdspus?info=此产品还有订单, 不可删除");

		const PdskuDelMany = await PdskuDB.deleteMany({Pdspu: id, Firm: crUser.Firm});
		const PdCostMtDelMany = await PdCostMtDB.deleteMany({Pdspu: id, Firm: crUser.Firm});

		const PdspuDel = await PdspuDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsPdspus");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPdNomeDel,Error&error="+error);
	}
}