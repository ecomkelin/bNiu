const Stint = require('../../config/stint.js');
const FirmDB = require('../../models/login/Firm');
const UserDB = require('../../models/login/User');
const _ = require('underscore');

exports.adFirms = async(req, res) => {
	// console.log("/adFirms");
	try{
		const crAder = req.session.crAder;
		const Firms = await FirmDB.find();
		// return res.render('./ader/User/Firm/list', {title: 'Firm List', crAder, Firms});
		if(!Firms) {
			return res.redirect('/error?info=adFirms,!Firms');
		} else if(Firms.length == 0) {
			return res.redirect('/adFirmAdd');
		} else if(Firms.length > 1) {
			return res.render('./ader/User/Firm/list', {title: 'Firm List', crAder, Firms});
		} else {
			return res.redirect('/adFirm/'+Firms[0]._id);
		}
	} catch(error) {
		return res.redirect('/error?info=adFirms,Error&error='+error);
	}
}

exports.adFirmAdd = async(req, res) => {
	// console.log("/adFirmAdd");
	try{
		const Firms = await FirmDB.find();
		if(Firms.length > 0) return res.redirect('/error?info=不可添加新的公司, 因为已经存在.');
		return res.render('./ader/User/Firm/add', {title: '注册新的公司', crAder : req.session.crAder});
	} catch(error) {
		return res.redirect('/error?info=adFirmAdd,Error&error='+error);
	}
}

const aderFirmBasicFilter_FuncProm = (obj) => {
	// console.log("aderFirmBasicFilter_FuncProm");
	return new Promise((resolve, reject) => {
		let info = null;

		if(!obj.code) {info = "请输入公司账号 code"; } else if(!obj.nome) {info = "请输入公司名称 nome"; }

		if(!info) {
			obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
			const regexp = new RegExp(Stint.extent.Firm.code.regexp);
			if(obj.code.length != Stint.extent.Firm.code.len || !regexp.test(obj.code)) info = "公司编号长度必须是"+Stint.extent.Firm.code.len+"位英文字母";
			obj.nome = obj.nome.replace(/^\s*/g,"").toUpperCase();
			if(obj.nome.length < Stint.extent.Firm.nome.min) info = "公司名称长度不能小于"+Stint.extent.Firm.nome.min;
		}

		if(info) {
			reject(info);
		} else {
			resolve(obj);
		}
	})
}
exports.adFirmNew = async(req, res) => {
	// console.log("/adFirmNew");
	try{
		let obj = req.body.obj;
		obj = await aderFirmBasicFilter_FuncProm(obj);

		const param = {
			$or:[{'code': obj.code}, {'nome': obj.nome}]
		};
		const FirmSame = await FirmDB.findOne(param);
		if(FirmSame) {
			let info = "不可添加";
			if(FirmSame.code == obj.code) info = "此公司编号已经存在";
			if(FirmSame.nome == obj.nome) info = "此公司名称已经存在";
			return res.redirect('/error?info=adFirmNew,'+info);
		}

		const _object = new FirmDB(obj);
		const objSave = await _object.save();
		return res.redirect('/adFirms');
	} catch(error) {
		return res.redirect('/error?info=adFirmNew,Error&error='+error);
	}
	
}


exports.adFirmUpd = async(req, res) => {
	// console.log("/adFirmUpd");
	try{
		let obj = req.body.obj;
		obj = await aderFirmBasicFilter_FuncProm(obj);
		const param = {
			$or:[{'code': obj.code}, {'nome': obj.nome}]
		};

		const Firm = await FirmDB.findOne({_id: obj._id});
		if(!Firm) return res.redirect('/error?info=adFirmUpd,此公司已经被删除，请刷新查看');

		const FirmSame = await FirmDB.findOne({code: obj.code}).where('_id').ne(obj._id);
		if(FirmSame) return res.redirect('/error?info=adFirmUpd,已经有这个名字的公司');

		const _object = _.extend(Firm, obj);
		const FirmSave = await _object.save();
		return res.redirect("/adFirm/"+FirmSave._id);
	} catch(error) {
		return res.redirect('/error?info=adFirmUpd,Error&error='+error);
	}
}



exports.adFirm = async(req, res) => {
	// console.log("/adFirm");
	try{
		const id = req.params.id;
		const Firm = await FirmDB.findOne({_id: id});
		if(!Firm) return res.redirect('/error?info=adFirm,这个公司已经被删除');

		return res.render('./ader/User/Firm/detail', {
			crAder: req.session.crAder,
			title: "公司信息",
			Firm
		});
	} catch(error) {
		return res.redirect('/error?info=adFirm,Error&error='+error);
	}
}




exports.adFirmDel = async(req, res)=> {
	// console.log("/adFirmDel");
	try{
		const id = req.params.id;
		const FirmExist = await FirmDB.findOne({_id: id});
		if(!FirmExist) return res.redirect('/error?info=adFirmDel,这个公司已经被删除');
		
		const existUsers = await UserDB.countDocuments({Firm: id});
		if(existUsers > 0) return res.redirect('/error?info=adFirmDel,此公司中还有员工，请先删除此公司的员工');

		const FirmDel = await FirmDB.deleteOne({_id: id});
		return res.redirect("/adFirms");
	} catch(error) {
		return res.redirect('/error?info=adFirmDel,Error&error='+error);
	}
}


exports.adFirmDelAjax = async(req, res) => {
	// console.log("/adFirmDelAjax");
	try{
		const id = req.query.id;
		const Firm = await FirmDB.findOne({_id: id});
		if(!Firm) return res.json({status: 500, message: '已被删除，按F5刷新页面查看. adFirmDelAjax'});
		const existUsers = await UserDB.countDocuments({Firm: id});
		if(existUsers > 0) return res.json({status: 500, message: "此公司中还有员工，请先删除此公司的员工. adFirmDelAjax"});

		const FirmDel = FirmDB.deleteOne({_id: id});
		return res.json({status: 200});
	} catch(error) {
		return res.json({status: 400, message: '公司删除错误, 请联系管理员。 错误码: adFirmDelAjax'});
	}
}
