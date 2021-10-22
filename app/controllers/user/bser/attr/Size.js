/*
	[尺寸]数据库 可以任意添加修改删除。
	因为其他数据库存储的尺寸全部为数字 在Conf中有储存
*/
const Conf = require('../../../../config/conf.js');
const MdFilter = require('../../../../middle/MdFilter');
const _ = require('underscore');

const LangDB = require('../../../../models/login/Lang');

const SizeDB = require('../../../../models/attr/Size');
const SizeSystDB = require('../../../../models/attr/SizeSyst');

const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsSizes = async(req, res) => {
	// console.log("/bsSizes");
	try{
		const crUser = req.session.crUser;
		const SizeNums = Conf.SizeNums;
		const SizeSysts = await SizeSystDB.find({Firm: crUser.Firm}).sort({"sort": -1, "updAt": -1});
		const Sizes = await SizeDB.find({Firm: crUser.Firm});
		return res.render("./user/bser/attr/Size/list", {title: "尺寸管理", SizeNums, SizeSysts, Sizes, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsSizes,Error&error="+error);
	}
}

exports.bsSizeSystAdd = async(req, res) => {
	// console.log("/bsSizeSystAdd");
	try{
		const crUser = req.session.crUser;
		const Langs = await LangDB.find();
		return res.render("./user/bser/attr/Size/addSizeSyst", {title: "添加尺寸新标准", Langs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsSizeSystAdd,Error&error="+error);
	}
}

exports.bsSizeSystNew = async(req, res) => {
	// console.log("/bsSizeSystNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 2) return res.redirect("/error?info=bsSizeSystNew,objCode");
		const SizeSystSame = await SizeSystDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(SizeSystSame) return res.redirect("/error?info=bsSizeSystNew,SizeSystSame");
		const _object = new SizeSystDB(obj);
		const SizeSave = await	_object.save();
		return res.redirect("/bsSizes");
	} catch(error) {
		return res.redirect("/error?info=bsSizeSystNew,Error&error="+error);
	}
}

exports.bsSizeSystUpdAjax = async(req, res) => {
	// console.log("/bsSizeSystUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Size的id
		const SizeSyst = await SizeSystDB.findOne({'_id': id, Firm: crUser.Firm})
		if(!SizeSyst) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const field = req.body.field;	// 传输数据的类型
		let val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsSizeSystUpdAjax code] 尺寸标准名称不正确"});
			const SizeSystSame = await SizeSystDB.findOne({code: val, Firm: crUser.Firm});
			if(SizeSystSame) return res.json({status: 500, message: "有相同的编号"});			
		} else if(field == "sort"){
			val = parseInt(val);
			if(isNaN(val)) val = 1;
		}
		SizeSyst[field] = val;
		const SizeSystSave = SizeSyst.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsSizeNewAjax = async(req, res) => {
	// console.log("/bsSizeNewAjax");
	try{
		const crUser = req.session.crUser;
		const size = req.body.size;
		const standardId = req.body.standard;
		const symbol = req.body.symbol.replace(/^\s*/g,"").toUpperCase();
		if(!symbol) return res.json({status: 500, message: "请输入尺寸标识, 请刷新重试"});

		const SizeSyst = await SizeSystDB.findOne({'_id': standardId, Firm: crUser.Firm})
		if(!SizeSyst) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const SizeSame = await SizeDB.findOne({SizeSyst: standardId, size: size, Firm: crUser.Firm});
		if(SizeSame) return res.json({status: 500, message: "已经存在, 请刷新重试"});

		const obj = new Object();
		obj.Firm = crUser.Firm;
		obj.SizeSyst = standardId;
		obj.size = size;
		obj.symbol = symbol;

		const _object = new SizeDB(obj);
		const SizeSave = await _object.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}
exports.bsSizeUpdAjax = async(req, res) => {
	// console.log("/bsSizeUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Size的id
		const Size = await SizeDB.findOne({'_id': id, Firm: crUser.Firm});
		if(!Size) return res.json({status: 500, message: "没有找到此尺寸信息, 请刷新重试"});

		const field = req.body.field;	// 传输数据的类型
		const val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		if(!val) {
			const SizeDel = await SizeDB.deleteOne({_id: id, Firm: crUser.Firm});
		} else {
			Size[field] = val;
			const SizeSave = Size.save();
		}
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsSizeSystDel = async(req, res) => {
	// console.log("/bsColorDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const SizeSystExist = await SizeSystDB.findOne({_id: id, Firm: crUser.Firm});
		if(!SizeSystExist) return res.json({status: 500, message: "此尺寸标准已经不存在, 请刷新重试"});


		const SizesDelMany = await SizeDB.deleteMany({SizeSyst: id, Firm: crUser.Firm});
		const SizeSystDel = await SizeSystDB.deleteOne({_id: id, Firm: crUser.Firm});
		const PdspuUpdMany = await PdspuDB.updateMany({SizeSyst: id, Firm: crUser.Firm}, {SizeSyst: null});

		return res.redirect("/bsSizes");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsColorDel,Error&error="+error);
	}
}