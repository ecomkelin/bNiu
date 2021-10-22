/*
	[印花 样板]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');
const MdFilter = require('../../../../middle/MdFilter');

const PtFirmDB = require('../../../../models/pattern/PtFirm');
const PtCategDB = require('../../../../models/pattern/PtCateg');
const PternDB = require('../../../../models/pattern/Ptern');

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsPterns = async(req, res) => {
	// console.log("/bsPterns");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const PtCategs = await PtCategDB.find({level: 1, Firm: crUser.Firm})
			.populate({path: "PtCategSons", populate: {path: "PtCategSons"}})
			.sort({"sort": -1, "updAt": -1});
		const PtFirms = await PtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/pattern/Ptern/list", {title: "印花列表", info, PtCategs, PtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPterns,Error&error="+error);
	}
}

exports.bsPternsAjax = async(req, res) => {
	// console.log("/bsPterns");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = PternsParamFilter(req, crUser);
		const count = await PternDB.countDocuments(param);
		const objects = await PternDB.find(param, filter)
			.populate("PtFirm")
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await PternDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsPternsAjax Error!"});
	}
}
const PternsParamFilter = (req, crUser) => {
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

	if(req.query.PtFirm) {
		let symbConb = req.query.PtFirm
		if(symbConb.length == 24) {
			param["PtFirm"] = {'$eq': symbConb};
		}
	}

	if(req.query.PtCategFir) {
		let symbConb = req.query.PtCategFir
		if(symbConb.length == 24) {
			param["PtCategFir"] = {'$eq': symbConb};
		}
	}

	if(req.query.PtCategSec) {
		let symbConb = req.query.PtCategSec
		if(symbConb.length == 24) {
			param["PtCategSec"] = {'$eq': symbConb};
		}
	}

	if(req.query.PtCategThd) {
		let symbConb = req.query.PtCategThd
		if(symbConb.length == 24) {
			param["PtCategThd"] = {'$eq': symbConb};
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




exports.bsPternAdd = async(req, res) => {
	// console.log("/bsPternAdd");
	try{
		const crUser = req.session.crUser;
		const PtFirms = await PtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		if(!PtFirms || PtFirms.length < 1) return res.redirect("./error?info=请先添加印花厂");
		return res.render("./user/bser/pattern/Ptern/add", {title: "添加新印花", crUser, PtFirms});
	} catch(error) {
		return res.redirect("/error?info=bsPternAdd,Error&error="+error);
	}
}


const PterFilter_Func = async(req) => {
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return {obj: null, info: "/error?info=PterFilter_Func,请输入编号"}
		if(obj.cost) {
			obj.cost = parseFloat(obj.cost);
			if(isNaN(obj.cost)) return {obj: null, info: "/error?info=PterFilter_Func, 请输入正确成本格式, 可以不输入"};
		}

		if(!obj.PtFirm) return {obj: null, info: "/error?info=PterFilter_Func, 请选择印花厂"};
		const PtFirm = await PtFirmDB.findOne({_id: obj.PtFirm, Firm: crUser.Firm});
		if(!PtFirm) return {obj: null, info: "/error?info=PterFilter_Func, 没有此印花厂"};

		if(obj.PtCategFir) {
			const PtCategFir = await PtCategDB.findOne({_id: obj.PtCategFir, Firm: crUser.Firm})
				.populate({path: "PtCategSons", populate: {path: "PtCategSons"}});
			if(!PtCategFir) return {obj: null, info: "/error?info=PterFilter_Func,没有此分类(Fir)"};
			if(obj.PtCategSec) {
				const PtCategSec = PtCategFir.PtCategSons.find((item) => {return item._id == String(obj.PtCategSec);});
				if(!PtCategSec) return {obj: null, info: "/error?info=PterFilter_Func,没有此分类(Sec)"}
				if(obj.PtCategThd) {
					const PtCategThd = PtCategSec.PtCategSons.find((item) => {return item._id == String(obj.PtCategThd);});
					if(!PtCategThd) return {obj: null, info: "/error?info=PterFilter_Func,没有此分类(Thd)"};
				} else {
					obj.PtCategThd = null;
				}
			} else {
				obj.PtCategSec = null;
				obj.PtCategThd = null;
			}
		} else {
			obj.PtCategFir = null;
			obj.PtCategSec = null;
			obj.PtCategThd = null;
		}


		return {obj, info: null};
	} catch(error) {
		console.log(error);
		return {obj: null, info: "/error?info=PterFilter_Func,Error&error="+error};
	}
}
exports.bsPternNew = async(req, res) => {
	// console.log("/bsPternNew");
	try{
		const crUser = req.session.crUser;

		const {obj, info} = await PterFilter_Func(req);

		obj.Firm = crUser.Firm;
		obj.photo = Conf.photo.Ptern.def;

		const PternSame = await PternDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(PternSame) return res.redirect("/error?info=bsPternNew,PternSame");

		const _object = new PternDB(obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPterns");
	} catch(error) {
		return res.redirect("/error?info=bsPternNew,Error&error="+error);
	}
}
exports.bsPternUpd = async(req, res) => {
	// console.log("/bsPternUpd");
	try{
		const crUser = req.session.crUser;

		const Ptern = await PternDB.findOne({_id: req.body.obj._id, Firm: crUser.Firm});
		if(!Ptern) return res.redirect("/error?info=bsPternUpd,没有找到此印花信息");

		const {obj, info} = await PterFilter_Func(req);

		const PternSame = await PternDB.findOne({_id: {"$ne": obj._id}, code: obj.code, Firm: crUser.Firm});
		if(PternSame) return res.redirect("/error?info=bsPternUpd,有相同的编号");

		const _object = _.extend(Ptern, obj);
		const PternSave = await _object.save();
		return res.redirect("/bsPtern/"+PternSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPternUpd,Error&error="+error);
	}
}


exports.bsPternUpdAjax = async(req, res) => {
	// console.log("/bsPternUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Ptern的id
		const Ptern = await PternDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Ptern) return res.json({status: 500, message: "没有找到此印花信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PternSame = await PternDB.findOne({code: val, Firm: crUser.Firm});
			if(PternSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "photo") {
			val = String(val).replace(/^\s*/g,"");
			if(val != Ptern[field]) {
				MdFile.delFile(Ptern[field]);
				if(!val) val = Conf.photo.Ptern.def;
			}
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsPternUpdAjax sort] 排序为数字, 请传递正确的参数"});
		} else if(field == "PtFirm") {
			if(val.length != 24) return res.json({status: 500, message: "[bsPternUpdAjax sort] 没有找到您选择的印花厂"});
			const PtFirm = await PtFirmDB.findOne({_id: val, Firm: crUser.Firm});
			if(!PtFirm) return res.json({status: 500, message: "[bsPternUpdAjax sort] 没有找到您选择的印花厂"});
		} else if(field == "PtCateg") {
			if(val.length != 24) {
				val=null;
			} else {
				const PtCateg = await PtCategDB.findOne({_id: val, Firm: crUser.Firm});
				if(!PtCateg) val=null;
			}
		} else {
			return res.json({status: 500, message: "[bsPternUpdAjax sort] 您操作错误, 如果坚持操作, 请联系管理员"});
		}

		Ptern[field] = val;

		const PternSave = Ptern.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}


exports.bsPternDel = async(req, res) => {
	// console.log("/bsPternDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const PternExist = await PternDB.findOne({_id: id, Firm: crUser.Firm});
		if(!PternExist) return res.json({status: 500, message: "此印花已经不存在, 请刷新重试"});

		const Pdspu = await PdspuDB.findOne({Pterns: id, Firm: crUser.Firm});
		if(Pdspu) return res.redirect("/bsPterns?info=在 ["+Pdspu.code+"] 等产品已经使用此印花, 不可删除。 除非把相应产品删除");

		const PternDel = await PternDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsPterns");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPternDel,Error&error="+error);
	}
}











exports.bsPternPhotoUpd = async(req, res) => {
	// console.log("/bsPternPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Ptern = await PternDB.findOne({_id: obj._id, Firm: crUser.Firm});
		if(!Ptern) return res.redirect("/error?info=没有找到此印花信息");
		const delPhoto = Ptern.photo;
		Ptern.photo = photo;
		const PternSave = await Ptern.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsPtern/"+PternSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPternPhotoUpd,Error&error="+error);
	}
}

















exports.bsPtern = async(req, res) => {
	// console.log("/bsPtern");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Ptern = await PternDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PtCategFir")
			.populate("PtCategSec")
			.populate("PtCategThd")
			.populate("PtFirm")
		if(!Ptern) return res.redirect("/error?info=不存在此分类");
		const PtFirms = await PtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/pattern/Ptern/detail", {title: "印花详情", Ptern, PtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtern,Error&error="+error);
	}
}
exports.bsPternUp = async(req, res) => {
	// console.log("/bsPternUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Ptern = await PternDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PtCategFir")
			.populate("PtCategSec")
			.populate("PtCategThd");
		if(!Ptern) return res.redirect("/error?info=不存在此分类");

		const PtFirms = await PtFirmDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		if(!PtFirms || PtFirms.length < 1) return res.redirect("./error?info=请先添加印花厂");
		return res.render("./user/bser/pattern/Ptern/update", {title: "印花更新", Ptern, PtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPternUp,Error&error="+error);
	}
}