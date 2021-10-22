/*
	[颜色]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const Stint = require('../../../../config/stint.js');
const MdFile = require('../../../../middle/MdFile');
const MdFilter = require('../../../../middle/MdFilter');
const _ = require('underscore');

const LangDB = require('../../../../models/login/Lang');

const ColorDB = require('../../../../models/attr/Color');

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsColors = async(req, res) => {
	// console.log("/bsColors");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const Colors = await ColorDB.find({Firm: crUser.Firm}).sort({"sort": -1, 'updAt': -1});
		return res.render("./user/bser/attr/Color/list", {title: "颜色列表", info, Colors, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsColors,Error&error="+error);
	}
}
exports.bsColorsAjax = async(req, res) => {
	// console.log("/bsColors");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = ColorsParamFilter(req, crUser);
		const count = await ColorDB.countDocuments(param);
		const objects = await ColorDB.find(param, filter)
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await ColorDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsColorsAjax Error!"});
	}
}
const ColorsParamFilter = (req, crUser) => {
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

exports.bsColorAdd = async(req, res) => {
	// console.log("/bsColorAdd");
	try{
		const crUser = req.session.crUser;
		const ColorStint = Stint.extent.Color;
		return res.render("./user/bser/attr/Color/add", {title: "添加新颜色", ColorStint, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsColorAdd,Error&error="+error);
	}
}

exports.bsColorNew = async(req, res) => {
	// console.log("/bsColorNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.photo = Conf.photo.Color.def;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsColorNew,objCode");
		const ColorSame = await ColorDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(ColorSame) return res.redirect("/error?info=bsColorNew,ColorSame");

		const regexp = new RegExp(Stint.extent.Color.rgb.regexp);
		if(!regexp.test(obj.rgb) || (obj.rgb.length != Stint.extent.Color.rgb.len)) {
			obj.rgb = "FFFFFF";
		}
		const _object = new ColorDB(obj);
		const ColorSave = await	_object.save();
		return res.redirect("/bsColors");
	} catch(error) {
		return res.redirect("/error?info=bsColorNew,Error&error="+error);
	}
}
exports.bsColorUpdAjax = async(req, res) => {
	// console.log("/bsColorUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Color的id
		const Color = await ColorDB.findOne({'_id': id, Firm: crUser.Firm})
		if(!Color) return res.json({status: 500, message: "没有找到此颜色信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsColorUpdAjax code] 颜色名称不正确"});
			const ColorSame = await ColorDB.findOne({code: val, Firm: crUser.Firm});
			if(ColorSame) return res.json({status: 500, message: "[bsColorUpdAjax code] 颜色名称已经存在, 请刷新重试"});
		} else if(field == "rgb") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			const regexp = new RegExp(Stint.extent.Color.rgb.regexp);
			if(!regexp.test(val) || (val.length != Stint.extent.Color.rgb.len)) {
				return res.json({status: 500, message: "[bsColorUpdAjax rgb] 颜色名称不正确 必须是6位RGB字符"});
			}
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsColorUpdAjax sort] 排序为数字, 请传递正确的参数"});
		}
		Color[field] = val;

		const ColorSave = Color.save();
		return res.json({status: 200, message: "修改完成"})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}


exports.bsColorDel = async(req, res) => {
	// console.log("/bsColorDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const ColorExist = await ColorDB.findOne({_id: id, Firm: crUser.Firm});
		if(!ColorExist) return res.json({status: 500, message: "此颜色已经不存在, 请刷新重试"});

		const Pdspu = await PdspuDB.findOne({Colors: id, Firm: crUser.Firm});
		if(Pdspu) return res.redirect("/bsColors?info=在 ["+Pdspu.code+"] 等产品已经使用此颜色, 不可删除。 除非把相应产品删除");

		const ColorDel = await ColorDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsColors");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsColorDel,Error&error="+error);
	}
}

exports.bsColor = async(req, res) => {
	// console.log("/bsColor");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Color = await ColorDB.findOne({_id: id, Firm: crUser.Firm})
		if(!Color) return res.redirect("/error?info=不存在此颜色");
		return res.render("./user/bser/attr/Color/detail", {title: "颜色详情", Color, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsColor,Error&error="+error);
	}
}



exports.bsColorPhotoUpd = async(req, res) => {
	// console.log("/bsColorPhotoUpd");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const photo = req.body.files[0];
		const Color = await ColorDB.findOne({_id: obj._id, Firm: crUser.Firm});
		if(!Color) return res.redirect("/error?info=没有找到此印花信息");
		const delPhoto = Color.photo;
		Color.photo = photo;
		const ColorSave = await Color.save();
		MdFile.delFile(delPhoto);
		return res.redirect("/bsColor/"+ColorSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsColorPhotoUpd,Error&error="+error);
	}
}