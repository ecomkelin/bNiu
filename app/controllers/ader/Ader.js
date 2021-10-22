const bcrypt = require('bcryptjs');
const _ = require('underscore');

const AderDB = require('../../models/login/Ader');

exports.aderAdd = (req, res) => {
	// console.log("/aderAdd");
	try{
		res.render('./ader/ader/add', {
			title: 'Add Adminnistrator',
			crAder : req.session.crAder,
		});
	} catch(error) {
		return res.redirect('/error?info=aderAdd,Error!&error='+error);
	}
}

exports.aderNew = async(req, res) => {
	// console.log("/aderNew");
	try{
		const obj = req.body.obj;
		obj.code = obj.code.replace(/^\s*/g,"").toUpperCase();
		obj.pwd = await UserPwdBcrypt_FilterProm(obj.pwd);

		const AderSame = await AderDB.findOne({code: obj.code});
		if(AderSame) return res.redirect('/error?info=aderNew,此帐号已经被注册，请重新注册');

		const _ader = new AderDB(obj);
		const AderSave = await _ader.save();

		return res.redirect('/aders');
	} catch(error) {
		return res.redirect('/error?info=aderNew,Error!&error='+error);
	}
}

exports.aders = async(req, res) => {
	// console.log("/aders");
	try{
		const crAder = req.session.crAder;
		const Aders = await AderDB.find();
		return res.render('./ader/ader/list', {title: '用户列表', crAder, Aders });
	} catch(error) {
		return res.redirect('/error?info=aders,Error&error='+error);
	}
}

exports.ader = async(req, res) => {
	// console.log("/ader");
	try{
		const crAder = req.session.crAder;
		const id = req.params.id;
		const Ader = await AderDB.findOne({_id: id});
		if(!Ader) return res.redirect('/error?info=找不到此账号');
		return res.render('./ader/ader/detail', {title: 'admin列表', crAder, Ader });
	} catch(error) {
		return res.redirect('/error?info=ader,Error&error='+error);
	}
}

exports.aderDel = async(req, res) => {
	// console.log("/aderDel");
	try{
		const id = req.params.id;
		const Ader = await AderDB.findOne({_id: id});
		if(!Ader) return res.redirect('/error?info=找不到此账号');
		const AderDel = await AderDB.deleteOne({_id: id});
		res.redirect('/aders');
			
	} catch(error) {
		return res.redirect('/error?info=aderDel,Error&error='+error);
	}
}

const UserPwdBcrypt_FilterProm = (pwd) => {
	// console.log("UserPwdBcrypt_FilterProm");
	return new Promise((resolve, reject) => {
		if(!pwd) reject('请您输入密码');
		pwd = pwd.replace(/^\s*/g,"");
		bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR), function(err, salt) {
			if(err) {
				reject('bcrypt.genSalt error!');
			} else {
				bcrypt.hash(pwd, salt, function(err, password) {
					if(err) {
						reject('bcrypt.hash error!');
					} else {
						resolve(password);
					}
				});
			}
		});
	})
}