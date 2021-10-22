const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFilter = require('../../../../middle/MdFilter');

const MtFirmDB = require('../../../../models/material/MtFirm');
const MtrialDB = require('../../../../models/material/Mtrial');

exports.bsMtFirms = async(req, res) => {
	// console.log("/bsMtFirms");
	try{
		const info = req.query.info;
		const crUser = req.session.crUser;
		const MtFirms = await MtFirmDB.find({Firm: crUser.Firm}).sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/material/MtFirm/list", {title: "供货商列表", info, MtFirms, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtFirms,Error&error="+error);
	}
}

exports.bsMtFirmsAjax = async(req, res) => {
	// console.log("/bsMtFirms");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = MtFirmsParamFilter(req, crUser);
		const count = await MtFirmDB.countDocuments(param);
		const MtFirms = await MtFirmDB.find(param, filter)
			.skip(skip).limit(pagesize)
			.sort(sortBy);

		let MtFirm = null;
		if(MtFirms.length > 0) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			MtFirm = await MtFirmDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {MtFirm, MtFirms, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsMtFirmsAjax Error!"});
	}
}
const MtFirmsParamFilter = (req, crUser) => {
	let param = {
		"Firm": crUser.Firm,
	};
	const filter = {};
	const sortBy = {};

	if(req.query.code) {
		let symbConb = String(req.query.code)
		symbConb = symbConb.replace(/^\s*/g,"").toUpperCase();
		symbConb = new RegExp(symbConb + '.*');
		param["code"] = {'$in': symbConb};
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




exports.bsMtFirmAdd = async(req, res) => {
	// console.log("/bsMtFirmAdd");
	try{
		const crUser = req.session.crUser;
		return res.render("./user/bser/material/MtFirm/add", {title: "添加供货商", crUser});
	} catch(error) {
		return res.redirect("/error?info=bsMtFirmAdd,Error&error="+error);
	}
}

exports.bsMtFirmNew = async(req, res) => {
	// console.log("/bsMtFirmNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.Firm = crUser.Firm;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 1) return res.redirect("/error?info=bsMtFirmNew,objCode");
		const MtFirmSame = await MtFirmDB.findOne({code: obj.code, Firm: crUser.Firm});
		if(MtFirmSame) return res.redirect("/error?info=bsMtFirmNew,MtFirmSame");

		const _object = new MtFirmDB(obj);
		const MtFirmSave = await _object.save();
		return res.redirect("/bsMtFirms");
	} catch(error) {
		console.log(error)
		return res.redirect("/error?info=bsMtFirmNew,Error&error="+error);
	}
}
exports.bsMtFirmUpdAjax = async(req, res) => {
	// console.log("/bsMtFirmUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的MtFirm的id
		const MtFirm = await MtFirmDB.findOne({_id: id, Firm: crUser.Firm})
		if(!MtFirm) return res.json({status: 500, message: "没有找到此供货商信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "code") {
			val = String(val).replace(/^\s*/g,"").toUpperCase();
			if(val.length < 1) return res.json({status: 500, message: "[bsMtFirmUpdAjax code] 供应商名称不正确"});
			const MtFirmSame = await MtFirmDB.findOne({code: val, Firm: crUser.Firm});
			if(MtFirmSame) return res.json({status: 500, message: "有相同的编号"});
		} else if(field == "sort") {
			val = parseInt(val);
			if(isNaN(val)) return res.json({status: 500, message: "[bsMtFirmUpdAjax sort] 排序为数字, 请传递正确的参数"});
		}

		MtFirm[field] = val;

		const MtFirmSave = MtFirm.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}

exports.bsMtFirmDel = async(req, res) => {
	// console.log("/bsMtFirmDel");
	try{
		const crUser = req.session.crUser;

		const id = req.params.id;
		const MtFirmExist = await MtFirmDB.findOne({_id: id, Firm: crUser.Firm});
		if(!MtFirmExist) return res.json({status: 500, message: "此供应商已经不存在, 请刷新重试"});

		const Mtrial = await MtrialDB.findOne({MtFirm: id, Firm: crUser.Firm});
		if(Mtrial) return res.redirect("/bsMtFirms?info=在 ["+Mtrial.code+"] 等材料已经使用此供应商, 不可删除。 除非把相应材料删除");

		const MtFirmDel = await MtFirmDB.deleteOne({_id: id, Firm: crUser.Firm});
		return res.redirect("/bsMtFirms");
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsMtFirmDel,Error&error="+error);
	}
}