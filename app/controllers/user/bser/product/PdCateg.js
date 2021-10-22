const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const MdFilter = require('../../../../middle/MdFilter');
const _ = require('underscore');

const PdCategDB = require('../../../../models/product/PdCateg');
const PdspuDB = require('../../../../models/product/Pdspu');

exports.bsPdCategs = async(req, res) => {
	// console.log("/bsPdCategs");
	try{
		const crUser = req.session.crUser;
		const PdCategFirs = await PdCategDB.find({level: 1, Firm: crUser.Firm})
			.populate({
				path: "PdCategSons",
				options: { sort: { "sort": -1, "updAt": -1}},
				populate: {
					path: "PdCategSons",
					options: { sort: { "sort": -1, "updAt": -1}}
				}
			})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/product/PdCateg/list", {title: "产品分类管理", PdCategFirs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategs,Error&error="+error);
	}
}
exports.bsPdCategsAjax = async(req, res) => {
	// console.log("/bsPdCategs");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = PdCategsParamFilter(req, crUser);
		const count = await PdCategDB.countDocuments(param);
		const objects = await PdCategDB.find(param, filter)
			.populate({path: "PdCategSons", populate: {path: "PdCategSons"}})
			.skip(skip).limit(pagesize)
			.sort(sortBy);
		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await PdCategDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		// console.log(error)
		return res.json({status: 500, message: "bsPdCategsAjax Error!"});
	}
}
const PdCategsParamFilter = (req, crUser) => {
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

	if(req.query.level) {
		let symbConb = parseInt(req.query.level);
		if(symbConb >=1 && symbConb <=3) {
			param["level"] = {'$eq': symbConb};
		}
	}

	if(req.query.PdCategFar) {
		let symbConb = req.query.PdCategFar;
		if(symbConb.length == 24) {
			param["PdCategFar"] = {'$eq': symbConb};
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

exports.bsPdCategAdd = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		let PdCategFar = null;
		if(req.query.PdCategFar) {
			PdCategFar = await PdCategDB.findOne({_id: req.query.PdCategFar, Firm: crUser.Firm});
			if(PdCategFar.level == 3 || PdCategFar.isBottom == 1) res.redirect("/error?info=bsPdCategAdd, 已经是底层, 不可再划分分类");
		}
		return res.render("./user/bser/product/PdCateg/add", {title: "添加新产品分类", PdCategFar, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}

exports.bsPdCategNew = async(req, res) => {
	// console.log("/bsPdCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPdCategNew,objCode");

		const PdCategSame = await PdCategDB.findOne({code: obj.code, PdCategFar: obj.PdCategFar, Firm: crUser.Firm});
		if(PdCategSame) return res.redirect("/error?info=bsPdCategNew,有相同的编号");

		const _object = new PdCategDB(obj);
		let level = 1;
		if(obj.PdCategFar) {
			const PdCategFar = await PdCategDB.findOne({_id: obj.PdCategFar, Firm: crUser.Firm});
			if(!PdCategFar) return res.redirect("/error?info=没有找到父分类");
			if(PdCategFar.level == 3) return res.redirect("/error?info=不可再划分分类");
			level = PdCategFar.level+1;
			PdCategFar.PdCategSons.push(_object._id);
			const PdCategFarSave = await PdCategFar.save();
		}
		_object.level = level;

		const PdCategSave = await _object.save();
		return res.redirect("/bsPdCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPdCategNew,Error&error="+error);
	}
}

exports.bsPdCategUpdAjax = async(req, res) => {
	// console.log("/bsPdCategUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的PdCateg的id
		const PdCateg = await PdCategDB.findOne({_id: id, Firm: crUser.Firm})
		if(!PdCateg) return res.json({status: 500, message: "没有找到此产品分类信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PdCategSame = await PdCategDB.findOne({code: val, PdCategFar: PdCateg.PdCategFar, Firm: crUser.Firm});
			if(PdCategSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsPdCategUpdAjax sort] 排序为数字, 请传递正确的参数"});
		} else if(field == "isBottom") {
			console.log(val)
			val = parseInt(val);
			if(val == 1) {
				if(PdCateg.PdCategSons.length > 0) return res.json({status: 500, message: "[bsPdCategUpdAjax sort] 请先删除子分类"});
			} else if(val == -1){
				if(PdCateg.level == 3) return res.json({status: 500, message: "[bsPdCategUpdAjax sort] 只能是最底层"});
			} else {
				return res.json({status: 500, message: "[bsPdCategUpdAjax sort] 底层参数错误"});
			}
		} else {
			return res.json({status: 500, message: "[bsPdCategUpdAjax sort] 您操作错误, 如果坚持操作, 请联系管理员"});
		}

		PdCateg[field] = val;

		const PdCategSave = PdCateg.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

/*
	[材质分类]数据库 删除
	首先要判断是否有子分类 如果没有则继续删除
	再 把父分类中的此类删除 也要把相应的[材质]数据库中的分类变为不分类
*/
exports.bsPdCategDel = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PdCateg = await PdCategDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PdCategFar")
			.populate("PdCategSons")
		if(!PdCateg) return res.redirect("/error?info=不存在此分类");

		if(PdCateg.PdCategSons && PdCateg.PdCategSons.length > 0) return res.redirect("/error?info=请先删除子分类");

		if(PdCateg.PdCategFar) {
			const PdCategFar = PdCateg.PdCategFar;
			PdCategFar.PdCategSons.remove(id);
			PdCategFar.save();
		}

		if(PdCateg.level == 1) {
			PdspuUpdMany = await PdspuDB.updateMany({PdCategFir: id, Firm: crUser.Firm}, {PdCategFir: null, PdCategSec: null, PdCategThd: null});
		} else if(PdCateg.level == 2) {
			PdspuUpdMany = await PdspuDB.updateMany({PdCategSec: id, Firm: crUser.Firm}, {PdCategSec: null, PdCategThd: null});
		} else if(PdCateg.level == 3) {
			PdspuUpdMany = await PdspuDB.updateMany({PdCategThd: id, Firm: crUser.Firm}, {PdCategThd: null});
		} else {
			return ("/bsPdCategs?info=删除错误");
		}

		const PdCategDel = await PdCategDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsPdCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}













exports.bsPdCateg = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PdCateg = await PdCategDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PdCategFar")
			.populate("PdCategSons")
		if(!PdCateg) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/product/PdCateg/detail", {title: "产品分类详情", PdCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}
exports.bsPdCategUp = async(req, res) => {
	// console.log("/bsPdCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PdCateg = await PdCategDB.findOne({_id: id, Firm: crUser.Firm})
		if(!PdCateg) return res.redirect("/error?info=不存在此分类");

		return res.render("./user/bser/product/PdCateg/update", {title: "产品分类详情", PdCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdCategAdd,Error&error="+error);
	}
}
/*
	[材质分类]数据库 修改
	改变是否为底层 要作一个判断
		如果有子分类 则不可为底层
		如果本身层级为3 则只能为底层
*/
exports.bsPdCategUpd = async(req, res) => {
	// console.log("/bsPdCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPdCategNew,objCode");

		const PdCateg = await PdCategDB.findOne({_id: obj._id, Firm: crUser.Firm});
		if(!PdCateg) return res.redirect("/error?info=bsPdCategNew,不存在此分类");

		const PdCategSame = await PdCategDB.findOne({_id: {"$ne": obj._id}, code: obj.code, PdCategFar: obj.PdCategFar, Firm: crUser.Firm});
		if(PdCategSame) return res.redirect("/error?info=bsPdCategNew,有相同的编号");

		if(obj.isBottom == Conf.isBottom.y.num) {
			if(PdCateg.PdCategSons && PdCateg.PdCategSons.length > 0) return res.redirect("/error?info=bsPdCategNew,有子分类, 不可变为底层");
		}
		else if(obj.isBottom == Conf.isBottom.n.num) {
			if(PdCateg.level == 3) return res.redirect("/error?info=bsPdCategNew,已经是level3底层, 不可变为非底层")
		}

		const _object = _.extend(PdCateg, obj);
		const PdCategSave = await _object.save();
		return res.redirect("/bsPdCateg/"+PdCategSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPdCategNew,Error&error="+error);
	}
}