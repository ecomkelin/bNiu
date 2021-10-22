/*
	[语言]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../config/conf.js');
const MdFilter = require('../../../middle/MdFilter');
const _ = require('underscore');

const LangDB = require('../../../models/login/Lang');

exports.bsLangs = async(req, res) => {
	// console.log("/bsLangs");
	try{
		const crUser = req.session.crUser;
		const Langs = await LangDB.find()
			.populate("langs.Lang")
			.sort({"sort": -1, "updAt": -1});
		// Langs.forEach((item) => {console.log(item); });
		return res.render("./user/bser/lang/list", {title: "语言管理", Langs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsLangs,Error&error="+error);
	}
}

exports.bsLangAdd = async(req, res) => {
	// console.log("/bsLangAdd");
	try{
		const crUser = req.session.crUser;
		const Langs = await LangDB.find()
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/lang/add", {title: "添加语言", Langs, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsLangAdd,Error&error="+error);
	}
}

exports.bsLangNew = async(req, res) => {
	// console.log("/bsLangNew");
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		if(obj.code.length < 2 || obj.code.length > 3) return res.redirect("/error?info=bsLangNew,objCode");
		if(!obj.langs[0].nome) return res.redirect("/error?info=bsLangNew,objNome");
		obj.langs.forEach((lang) => {
			if(!lang.nome) lang.nome = '*';
		})
		const LangSame = await LangDB.findOne({code: obj.code});
		if(LangSame) return res.redirect("/error?info=bsLangNew,LangSame");
		const _object = new LangDB(obj);
		const LangSave = await	_object.save();
		const Langs = await LangDB.find({_id: {"$ne": LangSave._id}})
			.sort({"sort": -1, "updAt": -1});
		for(let i=0; i<Langs.length; i++) {
			const Lang = Langs[i];
			Lang.langs.push({Lang: LangSave._id, nome: '*'});
			await Lang.save();
		}
		return res.redirect("/bsLangs");
	} catch(error) {
		return res.redirect("/error?info=bsLangNew,Error&error="+error);
	}
}

exports.bsLangUpdAjax = async(req, res) => {
	// console.log("/bsLangUpdAjax");
	try{
		const id = req.body.id;		// 所要更改的Lang的id
		const Lang = await LangDB.findOne({'_id': id})
		if(!Lang) return res.json({status: 500, message: "没有找到此语言信息, 请刷新重试"});

		const field = req.body.field;	// 要改变的 key
		let val = String(req.body.val).replace(/^\s*/g,"").toUpperCase();		// 数据的值
		
		if(field == "nome") {
			if(val.length < 1) val = '*';
			const lang = Lang.langs.find((item) => {
				return String(item._id) == String(req.body.subid);
			});
			lang.nome = val;
		} else {
			if(field == "code") {
				if(val.length < 2) return res.json({status: 500, message: "国家编号错误"});
				const LangSame = await LangDB.findOne({code: val});
				if(LangSame) return res.json({status: 500, message: "有相同的编号"});
			}
			Lang[field] = val;
		}

		const LangSave = Lang.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}