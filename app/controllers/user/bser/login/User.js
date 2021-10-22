const Conf = require('../../../../config/conf.js');
const MdFilter = require('../../../../middle/MdFilter');
const _ = require('underscore');

const UserDB = require('../../../../models/login/User');
const FirmDB = require('../../../../models/login/Firm');

exports.bsUsers = async(req, res) => {
	// console.log("/bsUsers");
	try{
		const crUser = req.session.crUser;
		const Users = await UserDB.find({Firm: crUser.Firm, role: {"$ne": 1}})
		.sort({'shelf': -1, 'Firm': 1, 'role': 1})
		Users.unshift(crUser);

		return res.render('./user/bser/login/User/list', {title: '用户列表', crUser, Users });
	} catch(error) {
		return res.redirect('/error?info=bsUsers,Error&error='+error);
	}
}
exports.bsUsersAjax = async(req, res) => {
	// console.log("/bsUsersAjax");
	try{
		const crUser = req.session.crUser;

		const {param, filter, sortBy, page, pagesize, skip} = UsersParamFilter(req, crUser);
		// console.log(param)
		const count = await UserDB.countDocuments(param);
		const objects = await UserDB.find(param, filter)
			.skip(skip).limit(pagesize)
			.sort(sortBy);
		// 如果是编号查询 首先要看是否有与编号一致的产品
		let object = null;
		if(objects.length > 0 && req.query.code) {
			const code = req.query.code.replace(/^\s*/g,"").toUpperCase();
			object = await UserDB.findOne({code: code, Firm: crUser.Firm}, filter);
		}

		return res.status(200).json({
			status: 200,
			message: '成功获取',
			data: {object, objects, count, page, pagesize}
		});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "bsUsersAjax Error!"});
	}
}
const UsersParamFilter = (req, crUser) => {
	let param = {
		"Firm": crUser.Firm,
		"role": {'$gt': crUser.role},
	};
	const filter = {};
	const sortBy = {};
	if(req.query.keyword) {
		let symbConb = String(req.query.keyword)
		symbConb = symbConb.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		symbConb = new RegExp(symbConb + '.*');
		$or:[{'code': symbConb}, {'nome': symbConb}]
	}

	if(req.query.code) {
		let symbConb = String(req.query.code)
		symbConb = symbConb.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		symbConb = new RegExp(symbConb + '.*');
		param["code"] = symbConb;
	}

	if(req.query.role) {
		let symbConb = parseInt(req.query.role);
		if(!isNaN(symbConb) && symbConb > crUser.role) {
			param["role"] = {'$eq': symbConb};
		}
	}

	if(req.query.sortKey && req.query.sortVal) {
		let sortKey = req.query.sortKey;
		let sortVal = parseInt(req.query.sortVal);
		if(!isNaN(sortVal) && (sortVal == 1 || sortVal == -1)) {
			sortBy[sortKey] = sortVal;
		}
	}

	sortBy['role'] = 1;
	sortBy['updAt'] = -1;

	const {page, pagesize, skip} = MdFilter.page_Filter(req);
	return {param, filter, sortBy, page, pagesize, skip};
}


exports.bsUserAdd = async(req, res) => {
	// console.log('/bsUserAdd');
	try{
		const crUser = req.session.crUser;
		return res.render('./user/bser/login/User/add', {title: '添加用户', crUser});
	} catch(error) {
		return res.redirect('/error?info=bsUserAdd,Error&error='+error);
	}
}

exports.bsUserNew = async(req, res) => {
	// console.log('/bsUserNew');
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		obj.code = await MdFilter.UserCode_FilterProm(obj.code);
		
		const UserSame = await UserDB.findOne({'code': obj.code, Firm: crUser.Firm });
		if(UserSame) return res.redirect('/error?info=bsUserNew,已有此账号，请重新注册');

		obj.pwd = await MdFilter.UserPwdBcrypt_FilterProm(obj.pwd);
		if(obj.role <= crUser.role) return res.redirect('/error?info=bsUserNew,用户角色参数错误');
		if(!Conf.roleNums.includes(parseInt(obj.role))) return res.redirect('/error?info=bsUserNew,用户角色参数错误');
		obj.Firm = crUser.Firm;

		const _object = new UserDB(obj);
		const UserSave = await _object.save();
		return res.redirect('/bsUsers');
	} catch(error) {
		return res.redirect('/error?info=bsUserNew,Error&error='+error);
	}
}

exports.bsUserUpdInfo = async(req, res) => {
	// console.log('/bsUserUpdInfo');
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		if(obj.code) return res.redirect('/error?info=bsUserUpdInfo,不允许有账户参数');
		if(obj.pwd) return res.redirect('/error?info=bsUserUpdInfo,不允许有密码参数');
		if(obj.Firm) return res.redirect('/error?info=bsUserUpdInfo,不允许有公司参数');
		if(obj.role <= crUser.role) return res.redirect('/error?info=bsUserUpdInfo,用户角色参数错误');
		if(!Conf.roleNums.includes(parseInt(obj.role))) return res.redirect('/error?info=bsUserUpdInfo,用户角色参数错误');
		
		const User = await UserDB.findOne({'_id': obj._id});
		if(!User) return res.redirect('/error?info=bsUserUpdInfo,没有找到此用户');
		
		const _object = _.extend(User, obj);
		const UserSave = await _object.save();
		return res.redirect("/bsUser/"+UserSave._id);
	} catch(error) {
		return res.redirect('/error?info=bsUserUpdInfo,Error&error='+error);
	}
}
exports.bsUserUpdPwd = async(req, res) => {
	// console.log('/bsUserUpdPwd');
	try{
		const obj = req.body.obj;
		const User = await UserDB.findOne({'_id': obj._id});
		if(!User) return res.redirect('/error?info=bsUserUpdPwd,没有找到此用户');
		
		User.pwd = await MdFilter.UserPwdBcrypt_FilterProm(obj.pwd);
		const UserSave = await User.save();
		return res.redirect("/bsUser/"+UserSave._id);
	} catch(error) {
		return res.redirect('/error?info=bsUserUpdPwd,Error&error='+error);
	}
}
exports.bsUserUpdCode = async(req, res) => {
	// console.log('/bsUserUpdCode');
	try{
		const crUser = req.session.crUser;
		const obj = req.body.obj;
		const User = await UserDB.findOne({'_id': obj._id});
		if(!User) return res.redirect('/error?info=bsUserUpdCode,没有找到此用户');
		
		code = await MdFilter.UserCode_FilterProm(obj.code);
		// const UserSame = await UserDB.findOne({'code': code, Firm: User.Firm})
		const UserSame = await UserDB.findOne({Firm: crUser.Firm, 'code': code}).where('_id').ne(User._id);
		if(UserSame) return res.redirect('/error?info=bsUserUpdCode,已有此账号');

		User.code = code;
		const UserSave = await User.save();
		return res.redirect("/bsUser/"+UserSave._id);
	} catch(error) {
		return res.redirect('/error?info=bsUserUpdCode,Error&error='+error);
	}
}

exports.bsUser = async(req, res) => {
	// console.log('/bsUser');
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const User = await UserDB.findOne({'_id': id})
			.populate('Firm', 'code nome');
		if(!User) return res.redirect('/error?info=bsUser,没有找到此账号');
		return res.render('./user/bser/login/User/detail', {title: '用户详情', crUser, User});
	} catch(error) {
		return res.redirect('/error?info=bsUser,Error&error='+error);
	}
}
exports.bsUserDel = async(req, res) => {
	// console.log('/bsUserDel');
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const User = await UserDB.findOne({'_id': id});
		if(!User) return res.redirect('/error?info=bsUserDel,没有找到此账号');
		if(User.role <= crUser.role) return res.redirect('/error?info=bsUserDel,您没有此权限');
		const UserDel = await UserDB.deleteOne({'_id': id});
		return res.redirect("/bsUsers");
	} catch(error) {
		return res.redirect('/error?info=bsUserDel,Error&error='+error);
	}
}