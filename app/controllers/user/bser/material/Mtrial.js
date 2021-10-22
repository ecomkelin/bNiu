/*
	[材料]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');
const MdFilter = require('../../../../middle/MdFilter');

const MtFirmDB = require('../../../../models/material/MtFirm');
const MtCategDB = require('../../../../models/material/MtCateg');
const MtrialDB = require('../../../../models/material/Mtrial');

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsMtrials = async(req, res) => {
	// console.log("/bsMtrials");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const MtCategs = await MtCategDB.find({level: 1, Firm: crUser.Firm})
			.populate({path: "MtCategSons", populate: {path: "MtCategSons"}})
			.sort({"sort": -1, "updAt": -1});
		const MtFirms = await MtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/material/Mtrial/list", {title: "材料列表", info, MtCategs, MtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrials,Error&error="+error);
	}
}

exports.bsMtrialsAjax = async(req, res) => {
	// console.log("/bsMtrials");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = MtrialsParamFilter(req, crUser);
		const count = await MtrialDB.countDocuments(param);
		const objects = await MtrialDB.find(param, filter)
			.populate("MtFirm")
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await MtrialDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsMtrialsAjax Error!"});
	}
}
const MtrialsParamFilter = (req, crUser) => {
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

	if(req.query.MtFirm) {
		let symbConb = req.query.MtFirm
		if(symbConb.length == 24) {
			param["MtFirm"] = {'$eq': symbConb};
		}
	}

	if(req.query.MtCategFir) {
		let symbConb = req.query.MtCategFir
		if(symbConb.length == 24) {
			param["MtCategFir"] = {'$eq': symbConb};
		}
	}

	if(req.query.MtCategSec) {
		let symbConb = req.query.MtCategSec
		if(symbConb.length == 24) {
			param["MtCategSec"] = {'$eq': symbConb};
		}
	}

	if(req.query.MtCategThd) {
		let symbConb = req.query.MtCategThd
		if(symbConb.length == 24) {
			param["MtCategThd"] = {'$eq': symbConb};
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




exports.bsMtrialAdd = async(req, res) => {
	// console.log("/bsMtrialAdd");
	try{
		const crUser = req.session.crUser;
		const MtFirms = await MtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		if(!MtFirms || MtFirms.length < 1) return res.redirect("./error?info=请先添加材料供应商");
		return res.render("./user/bser/material/Mtrial/add", {title: "添加新材料", crUser, MtFirms});
	} catch(error) {
		return res.redirect("/error?info=bsMtrialAdd,Error&error="+error);
	}
}


const MtrialFilter_Func = async(req) => {
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return {obj: null, info: "/error?info=MtrialFilter_Func,请输入编号"}
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return {obj: null, info: "/error?info=MtrialFilter_Func, 请输入正确成本格式, 可以不输入"};
		}

		if(!obj.MtFirm) return {obj: null, info: "/error?info=MtrialFilter_Func, 请选择印花厂"};
		const MtFirm = await MtFirmDB.findOne({_id: obj.MtFirm, Firm: crUser.Firm});
		if(!MtFirm) return {obj: null, info: "/error?info=MtrialFilter_Func, 没有此印花厂"};

		if(obj.MtCategFir) {
			const MtCategFir = await MtCategDB.findOne({_id: obj.MtCategFir, Firm: crUser.Firm})
				.populate({path: "MtCategSons", populate: {path: "MtCategSons"}});
			if(!MtCategFir) return {obj: null, info: "/error?info=MtrialFilter_Func,没有此分类(Fir)"};
			if(obj.MtCategSec) {
				const MtCategSec = MtCategFir.MtCategSons.find((item) => {return item._id == String(obj.MtCategSec);});
				if(!MtCategSec) return {obj: null, info: "/error?info=MtrialFilter_Func,没有此分类(Sec)"}
				if(obj.MtCategThd) {
					const MtCategThd = MtCategSec.MtCategSons.find((item) => {return item._id == String(obj.MtCategThd);});
					if(!MtCategThd) return {obj: null, info: "/error?info=MtrialFilter_Func,没有此分类(Thd)"};
				} else {
					obj.MtCategThd = null;
				}
			} else {
				obj.MtCategSec = null;
				obj.MtCategThd = null;
			}
		} else {
			obj.MtCategFir = null;
			obj.MtCategSec = null;
			obj.MtCategThd = null;
		}


		return {obj, info: null};
	} catch(error) {
		console.log(error);
		return {obj: null, info: "/error?info=MtrialFilter_Func,Error&error="+error};
	}
}
exports.bsMtrialNew = async(req, res) => {
	// console.log("/bsMtrialNew");
	try{
		const crUser = req.session.crUser;

		const {obj, info} = await MtrialFilter_Func(req);

		obj.Firm = crUser.Firm;
		obj.photo = Conf.photo.Mtrial.def;

		const MtrialSame = await MtrialDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(MtrialSame) return res.redirect("/error?info=bsMtrialNew,编号相同");

		const _object = new MtrialDB(obj);
		const MtrialSave = await _object.save();
		return res.redirect("/bsMtrials");
	} catch(error) {
		return res.redirect("/error?info=bsMtrialNew,Error&error="+error);
	}
}
exports.bsMtrialUpd = async(req, res) => {
	// console.log("/bsMtrialUpd");
	try{
		const crUser = req.session.crUser;

		const Mtrial = await MtrialDB.findOne({_id: req.body.obj._id, Firm: crUser.Firm});
		if(!Mtrial) return res.redirect("/error?info=bsMtrialUpd,没有找到此材料信息");

		const {obj, info} = await MtrialFilter_Func(req);

		const MtrialSame = await MtrialDB.findOne({_id: {"$ne": obj._id}, code: obj.code, Firm: crUser.Firm});
		if(MtrialSame) return res.redirect("/error?info=bsMtrialUpd,有相同的编号");

		const _object = _.extend(Mtrial, obj);
		const MtrialSave = await _object.save();
		return res.redirect("/bsMtrial/"+MtrialSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsMtrialUpd,Error&error="+error);
	}
}


exports.bsMtrialUpdAjax = async(req, res) => {
	// console.log("/bsMtrialUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Mtrial的id
		const Mtrial = await MtrialDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Mtrial) return res.json({status: 500, message: "没有找到此材料信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const MtrialSame = await MtrialDB.findOne({code: val, Firm: crUser.Firm});
			if(MtrialSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "photo") {
			val = String(val).replace(/^\s*/g,"");
			if(val != Mtrial[field]) {
				MdFile.delFile(Mtrial[field]);
				if(!val) val = Conf.photo.Mtrial.def;
			}
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsMtrialUpdAjax sort] 排序为数字, 请传递正确的参数"});
		} else if(field == "MtFirm") {
			if(val.length != 24) return res.json({status: 500, message: "[bsMtrialUpdAjax sort] 没有找到您选择的供应商"});
			const MtFirm = await MtFirmDB.findOne({_id: val, Firm: crUser.Firm});
			if(!MtFirm) return res.json({status: 500, message: "[bsMtrialUpdAjax sort] 没有找到您选择的供应商"});
		} else if(field == "MtCateg") {
			if(val.length != 24) {
				val=null;
			} else {
				const MtCateg = await MtCategDB.findOne({_id: val, Firm: crUser.Firm});
				if(!MtCateg) val=null;
			}
		} else {
			return res.json({status: 500, message: "[bsMtrialUpdAjax sort] 您操作错误, 如果坚持操作, 请联系管理员"});
		}

		Mtrial[field] = val;

		const MtrialSave = Mtrial.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}


exports.bsMtrialDel = async(req, res) => {
	// console.log("/bsMtrialDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const MtrialExist = await MtrialDB.findOne({_id: id, Firm: crUser.Firm});
		if(!MtrialExist) return res.json({status: 500, message: "此材料已经不存在, 请刷新重试"});

		const Pdspu = await PdspuDB.findOne({Mtrials: id, Firm: crUser.Firm});
		if(Pdspu) return res.redirect("/bsMtrials?info=在 ["+Pdspu.code+"] 等产品已经使用此材料, 不可删除。 除非把相应产品删除");

		const MtrialDel = await MtrialDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsMtrials");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsMtrialDel,Error&error="+error);
	}
}











exports.bsMtrialPhotoUpd = async(req, res) => {
	// console.log("/bsMtrialPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Mtrial = await MtrialDB.findOne({_id: obj._id, Firm: crUser.Firm});
		if(!Mtrial) return res.redirect("/error?info=没有找到此材料信息");
		const delPhoto = Mtrial.photo;
		Mtrial.photo = photo;
		const MtrialSave = await Mtrial.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsMtrial/"+MtrialSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsMtrialPhotoUpd,Error&error="+error);
	}
}

















exports.bsMtrial = async(req, res) => {
	// console.log("/bsMtrial");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Mtrial = await MtrialDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("MtCategFir")
			.populate("MtCategSec")
			.populate("MtCategThd")
			.populate("MtFirm")
		if(!Mtrial) return res.redirect("/error?info=不存在此分类");
		const MtFirms = await MtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/material/Mtrial/detail", {title: "材料详情", Mtrial, MtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrial,Error&error="+error);
	}
}
exports.bsMtrialUp = async(req, res) => {
	// console.log("/bsMtrialUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Mtrial = await MtrialDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("MtCategFir")
			.populate("MtCategSec")
			.populate("MtCategThd");
		if(!Mtrial) return res.redirect("/error?info=不存在此分类");

		const MtFirms = await MtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		if(!MtFirms || MtFirms.length < 1) return res.redirect("./error?info=请先添加材料供应商");
		return res.render("./user/bser/material/Mtrial/update", {title: "材料更新", Mtrial, MtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtrialUp,Error&error="+error);
	}
}
