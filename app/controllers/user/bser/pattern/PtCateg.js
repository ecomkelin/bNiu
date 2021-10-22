const Conf = require('../../../../config/conf.js');
const MdFile = require('../../../../middle/MdFile');
const MdFilter = require('../../../../middle/MdFilter');
const _ = require('underscore');

const PtCategDB = require('../../../../models/pattern/PtCateg');
const PternDB = require('../../../../models/pattern/Ptern');

exports.bsPtCategs = async(req, res) => {
	// console.log("/bsPtCategs");
	try{
		const crUser = req.session.crUser;
		const PtCategFirs = await PtCategDB.find({level: 1, Firm: crUser.Firm})
			.populate({
				path: "PtCategSons",
				options: { sort: { sort: -1 }},
				populate: {
					path: "PtCategSons",
					options: { sort: { sort: -1 }}
				}
			})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/pattern/PtCateg/list", {title: "印花分类管理", PtCategFirs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategs,Error&error="+error);
	}
}
exports.bsPtCategsAjax = async(req, res) => {
	// console.log("/bsPtCategs");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = PtCategsParamFilter(req, crUser);
		const count = await PtCategDB.countDocuments(param);
		const objects = await PtCategDB.find(param, filter)
			.populate({path: "PtCategSons", populate: {path: "PtCategSons"}})
			.skip(skip).limit(pagesize)
			.sort(sortBy);
		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await PtCategDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsPtCategsAjax Error!"});
	}
}
const PtCategsParamFilter = (req, crUser) => {
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

	if(req.query.PtCategFar) {
		let symbConb = req.query.PtCategFar;
		if(symbConb.length == 24) {
			param["PtCategFar"] = {'$eq': symbConb};
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




exports.bsPtCategAdd = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		let PtCategFar = null;
		if(req.query.PtCategFar) {
			PtCategFar = await PtCategDB.findOne({_id: req.query.PtCategFar, Firm: crUser.Firm});
			if(PtCategFar.level == 3 || PtCategFar.isBottom == 1) res.redirect("/error?info=bsPtCategAdd, 已经是底层, 不可再划分分类");
		}
		return res.render("./user/bser/pattern/PtCateg/add", {title: "添加新印花分类", PtCategFar, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategAdd,Error&error="+error);
	}
}

exports.bsPtCategNew = async(req, res) => {
	// console.log("/bsPtCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPtCategNew,objCode");

		const PtCategSame = await PtCategDB.findOne({code: obj.code, PtCategFar: obj.PtCategFar, Firm: crUser.Firm});
		if(PtCategSame) return res.redirect("/error?info=bsPtCategNew,有相同的编号");

		const _object = new PtCategDB(obj);
		let level = 1;
		if(obj.PtCategFar) {
			const PtCategFar = await PtCategDB.findOne({_id: obj.PtCategFar, Firm: crUser.Firm});
			if(!PtCategFar) return res.redirect("/error?info=没有找到父分类");
			if(PtCategFar.level == 3) return res.redirect("/error?info=不可再划分分类");
			level = PtCategFar.level+1;
			PtCategFar.PtCategSons.push(_object._id);
			const PtCategFarSave = await PtCategFar.save();
		}
		_object.level = level;

		const PtCategSave = await _object.save();
		return res.redirect("/bsPtCategs");
	} catch(error) {
		return res.redirect("/error?info=bsPtCategNew,Error&error="+error);
	}
}

exports.bsPtCategUpdAjax = async(req, res) => {
	// console.log("/bsPtCategUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的PtCateg的id
		const PtCateg = await PtCategDB.findOne({_id: id, Firm: crUser.Firm});
		if(!PtCateg) return res.json({status: 500, message: "没有找到此印花分类信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "编号填写错误"});
			const PtCategSame = await PtCategDB.findOne({code: val, PdCategFar: PtCateg.PtCategFar, Firm: crUser.Firm});
			if(PtCategSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsPtCategUpdAjax sort] 排序为数字, 请传递正确的参数"});
		} else if(field == "isBottom") {
			val = parseInt(val);
			if(val == 1) {
				if(PtCateg.PtCategSons.length > 0) return res.json({status: 500, message: "[bsPtCategUpdAjax sort] 请先删除子分类"});
			} else if(val == -1){
				if(PtCateg.level == 3) return res.json({status: 500, message: "[bsPtCategUpdAjax sort] 只能是最底层"});
			} else {
				return res.json({status: 500, message: "[bsPtCategUpdAjax sort] 底层参数错误"});
			}
		} else {
			return res.json({status: 500, message: "[bsPtCategUpdAjax sort] 您操作错误, 如果坚持操作, 请联系管理员"});
		}

		PtCateg[field] = val;

		const PtCategSave = PtCateg.save();
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
exports.bsPtCategDel = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PtCateg = await PtCategDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PtCategFar")
			.populate("PtCategSons")
		if(!PtCateg) return res.redirect("/error?info=不存在此分类");

		if(PtCateg.PtCategSons && PtCateg.PtCategSons.length > 0) return res.redirect("/error?info=请先删除子分类");

		if(PtCateg.PtCategFar) {
			const PtCategFar = PtCateg.PtCategFar;
			PtCategFar.PtCategSons.remove(id);
			PtCategFar.save();
		}

		// const PternUpdMany = await PternDB.updateMany({PtCateg: id }, {PtCateg: null});
		if(PtCateg.level == 1) {
			PternUpdMany = await PternDB.updateMany({PtCategFir: id, Firm: crUser.Firm}, {PtCategFir: null, PtCategSec: null, PtCategThd: null});
		} else if(PtCateg.level == 2) {
			PternUpdMany = await PternDB.updateMany({PtCategSec: id, Firm: crUser.Firm}, {PtCategSec: null, PtCategThd: null});
		} else if(PtCateg.level == 3) {
			PternUpdMany = await PternDB.updateMany({PtCategThd: id, Firm: crUser.Firm}, {PtCategThd: null});
		} else {
			return ("/bsPtCategs?info=删除错误");
		}

		const PtCategDel = await PtCategDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsPtCategs");
	} catch(error) {
		// console.log(error)
		return res.redirect("/error?info=bsPtCategDel,Error&error="+error);
	}
}













exports.bsPtCateg = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PtCateg = await PtCategDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("PtCategFar")
			.populate("PtCategSons")
		if(!PtCateg) return res.redirect("/error?info=不存在此分类");
		return res.render("./user/bser/pattern/PtCateg/detail", {title: "印花分类详情", PtCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCateg,Error&error="+error);
	}
}
exports.bsPtCategUp = async(req, res) => {
	// console.log("/bsPtCategAdd");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const PtCateg = await PtCategDB.findOne({_id: id, Firm: crUser.Firm})
		if(!PtCateg) return res.redirect("/error?info=不存在此分类");

		return res.render("./user/bser/pattern/PtCateg/update", {title: "印花分类详情", PtCateg, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPtCategUp,Error&error="+error);
	}
}
/*
	[印花分类]数据库 修改
	改变是否为底层 要作一个判断
		如果有子分类 则不可为底层
		如果本身层级为3 则只能为底层
*/
exports.bsPtCategUpd = async(req, res) => {
	// console.log("/bsPtCategNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsPtCategNew,objCode");

		const PtCateg = await PtCategDB.findOne({_id: obj._id, Firm: crUser.Firm});
		if(!PtCateg) return res.redirect("/error?info=bsPtCategNew,不存在此分类");

		const PtCategSame = await PtCategDB.findOne({_id: {"$ne": obj._id}, code: obj.code, PtCategFar: obj.PtCategFar, Firm: crUser.Firm});
		if(PtCategSame) return res.redirect("/error?info=bsPtCategNew,有相同的编号");

		if(obj.isBottom == Conf.isBottom.y.num) {
			if(PtCateg.PtCategSons && PtCateg.PtCategSons.length > 0) return res.redirect("/error?info=bsPtCategNew,有子分类, 不可变为底层");
		}
		else if(obj.isBottom == Conf.isBottom.n.num) {
			if(PtCateg.level == 3) return res.redirect("/error?info=bsPtCategNew,已经是level3底层, 不可变为非底层")
		}

		const _object = _.extend(PtCateg, obj);
		const PtCategSave = await _object.save();
		return res.redirect("/bsPtCateg/"+PtCategSave._id);
	} catch(error) {
		return res.redirect("/error?info=bsPtCategNew,Error&error="+error);
	}
}