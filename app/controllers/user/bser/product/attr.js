/*
	[产品spu]数据库 可以添加修改 但不可以删除。
	因为如果有其他数据库占据了 此颜色的id后 删除此颜色 其他数据库会不方便
*/
const Conf = require('../../../../config/conf.js');
const _ = require('underscore');
const MdFile = require('../../../../middle/MdFile');

const PdspuDB = require('../../../../models/product/Pdspu');
const SizeSystDB = require('../../../../models/attr/SizeSyst');

const SizeDB = require('../../../../models/attr/Size');
const ColorDB = require('../../../../models/attr/Color');
const PternDB = require('../../../../models/pattern/Ptern');

const MtrialDB = require('../../../../models/material/Mtrial');

const PdCostMtDB = require('../../../../models/product/PdCostMt');
const PdskuDB = require('../../../../models/product/Pdsku');

const OdspuDB = require('../../../../models/order/Odspu');

exports.bsPdspuMtrialUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("Mtrials");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Mtrials = await MtrialDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});
		return res.render("./user/bser/product/Pdspu/update/pdMtrialsUp", {title: "产品印花更新", Pdspu, Mtrials, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuMtrialUpdAjax = async(req, res) => {
	try {
		const crUser = req.session.crUser;
		const PdspuId = req.query.PdspuId;
		const MtrialId = req.query.MtrialId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: PdspuId, Firm: crUser.Firm}, {Mtrials: 1, PdCostMts: 1});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此印花图案"});

		// 因为只要增删产品的材料 就会变动所有pdsku, 所以提前把所有Pdsku全部拿出来, 以免后面循环查找
		const PdskuAlls = await PdskuDB.find({Pdspu: PdspuId, Firm: crUser.Firm});
		const isExist = Pdspu.Mtrials.includes(MtrialId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此印花图案, 不可重复添加, 请刷新重试"});
			Pdspu.Mtrials.unshift(MtrialId);
			// 在Pdspu下 为每个没有 Mtrial值的 PdCostMts 添加一个含有 Mtrial = MtrialId 的 PdCostMt;
			const crtObjParam = {Pdspu: PdspuId, Mtrial: null, Firm: crUser.Firm};
			const crtObj = {Mtrial: MtrialId};
			const PdCostMts = await PdCostMtDB.find(crtObjParam);
			for(let i=0; i<PdCostMts.length; i++) {
				const PdCostMt = PdCostMts[i];
				const objPdCostMt = new Object();
				objPdCostMt.Firm = PdCostMt.Firm;
				objPdCostMt.Pdspu = PdCostMt.Pdspu;
				if(crtObj.size) {objPdCostMt.size = crtObj.size; } else{objPdCostMt.size = PdCostMt.size; }
				if(crtObj.Mtrial) {objPdCostMt.Mtrial = crtObj.Mtrial; } else {objPdCostMt.Mtrial = PdCostMt.Mtrial; }
				const PdCostMtSame = await PdCostMtDB.findOne({Firm: crUser.Firm, Pdspu: PdspuId, size: objPdCostMt.size, Mtrial: objPdCostMt.Mtrial});
				if(!PdCostMtSame) {
					const _objPdCostMt = new PdCostMtDB(objPdCostMt);
					const PdCostMtSave = await _objPdCostMt.save();
					Pdspu.PdCostMts.push(PdCostMtSave._id);

					// 为 Pdsku 添加PdCostMts  Pdskus 的size 对应的是 PdCostMtSave 的size 
					const Pdskus = PdskuAlls.filter((item) => {return item.size == PdCostMtSave.size;});
					for(let j=0; j<Pdskus.length; j++) {
						const Pdsku = Pdskus[j];
						Pdsku.PdCostMts.push(PdCostMtSave._id);
						const PdskuSave = await Pdsku.save();
					}
				}
			}
		} else {
			// if(isExist == false) return res.json({status: 500, message: "此印花图案已被删除, 请刷新查看"});
			Pdspu.Mtrials.remove(MtrialId)

			const delObjParam = {Pdspu: PdspuId, Mtrial: MtrialId, Firm: crUser.Firm};
			const PdCostMts = await PdCostMtDB.find(delObjParam);
			for(let i=0; i<PdCostMts.length; i++) {
				const PdCostMt = PdCostMts[i];
				// 删除Pdspu下 PdCostMts中 所有包含 Mtrial: MtrialId的 PdCostMts
				Pdspu.PdCostMts.remove(PdCostMt._id);
				// 删除Pdsku下 PdCostMts中 所有包含 Mtrial: MtrialId的 PdCostMts
				const Pdskus = PdskuAlls.filter((item) => {return item.size == PdCostMt.size;});
				for(let j=0; j<Pdskus.length; j++) {
					const Pdsku = Pdskus[j];
					Pdsku.PdCostMts.remove(PdCostMt._id);
					const PdskuSave = await Pdsku.save();
				}
			}

			const PdCostMtsDelMany = await PdCostMtDB.deleteMany(delObjParam);
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		return res.json({status: 500, message: "/bsPdspuMtrialUpdAjax Error: "+error});
	}
}


exports.bsPdspuSizeUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Sizes = await SizeDB.find({SizeSyst: Pdspu.SizeSyst, Firm: crUser.Firm});

		return res.render("./user/bser/product/Pdspu/update/pdsizesUp", {title: "产品尺寸更新", Pdspu, Sizes, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuSizeNewAjax = async(req, res) => {
	// console.log("/bsPdspuSizeNewAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.query.id;
		const size = req.query.size;

		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});

		let sizeNew = 10;
		if(!Pdspu.sizes || Pdspu.sizes.length == 0) {
			// Pdspu.sizes.push(sizeNew);
		} else {
			if(size == "l"){
				let sizel = Pdspu.sizes[0];
				const Sizel = await SizeDB.findOne({SizeSyst: Pdspu.SizeSyst, symbol: sizel})
				if(Sizel) sizel = Sizel.size;

				if(sizel <= Conf.SizeNums[0]) return res.json({status: 500, message: "已经不可添加, 请联系管理员"});
				sizeNew = sizel-1;
			} else {
				let sizer = Pdspu.sizes[Pdspu.sizes.length-1];
				const Sizer = await SizeDB.findOne({SizeSyst: Pdspu.SizeSyst, symbol: sizer})
				if(Sizer) sizer = Sizer.size;

				if(sizer >= Conf.SizeNums[Conf.SizeNums.length-1]) return res.json({status: 500, message: "已经不可添加, 请联系管理员"});
				sizeNew = sizer+1;
			}
		}
		const Size = await SizeDB.findOne({SizeSyst: Pdspu.SizeSyst, size: sizeNew})
		if(Size) sizeNew = Size.symbol;
		if(size == "l") {
			Pdspu.sizes.unshift(sizeNew);
		} else {
			Pdspu.sizes.push(sizeNew);
		}
		
		const crtObjParam = {Pdspu: id, size: null, Firm: crUser.Firm};
		const crtObj = {size: sizeNew};

		// 在Pdspu下 为每个没有 size值的 PdCostMts 添加一个含有 size = sizeNew 的 PdCostMt;
		const PdCostMts = await PdCostMtDB.find(crtObjParam);
		const skuCostMtsArr = new Array();
		for(let i=0; i<PdCostMts.length; i++) {
			const PdCostMt = PdCostMts[i];
			const objPdCostMt = new Object();
			objPdCostMt.Firm = PdCostMt.Firm;
			objPdCostMt.Pdspu = PdCostMt.Pdspu;
			if(crtObj.size) {objPdCostMt.size = crtObj.size; } else{objPdCostMt.size = PdCostMt.size; }
			if(crtObj.Mtrial) {objPdCostMt.Mtrial = crtObj.Mtrial; } else {objPdCostMt.Mtrial = PdCostMt.Mtrial; }
			const PdCostMtSame = await PdCostMtDB.findOne({Pdspu: id, size: objPdCostMt.size, Mtrial: objPdCostMt.Mtrial, Firm: crUser.Firm});
			if(!PdCostMtSame) {
				const _objPdCostMt = new PdCostMtDB(objPdCostMt);
				const PdCostMtSave = await _objPdCostMt.save();
				Pdspu.PdCostMts.push(PdCostMtSave._id);

				// 为Pdsku添加PdCostMts
				skuCostMtsArr.push(PdCostMtSave._id);
			}
		}

		// 在Pdspu下 为每个没有 size值的 sizes 添加一个含有 size = sizeNew 的 size;
		const Pdskus = await PdskuDB.find(crtObjParam);
		for(let i=0; i<Pdskus.length; i++) {
			const Pdsku = Pdskus[i];
			const objPdsku = new Object();
			objPdsku.Firm = Pdsku.Firm;
			objPdsku.Pdspu = Pdsku.Pdspu;
			objPdsku.PdCostMts = skuCostMtsArr;
			if(crtObj.size) {objPdsku.size = crtObj.size; } else{objPdsku.size = Pdsku.size; }
			if(crtObj.Color) {objPdsku.Color = crtObj.Color; } else {objPdsku.Color = Pdsku.Color; }
			if(crtObj.Ptern) {objPdsku.Ptern = crtObj.Ptern; } else {objPdsku.Ptern = Pdsku.Ptern; }
			const PdskuSame = await PdskuDB.findOne({Pdspu: id, size: objPdsku.size, Color: objPdsku.Color, Ptern: objPdsku.Ptern, Firm: crUser.Firm});
			if(!PdskuSame) {
				const _objPdsku = new PdskuDB(objPdsku);
				const PdskuSave = await _objPdsku.save();
				Pdspu.Pdskus.push(PdskuSave._id);
			}
		}

		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuSizeNewAjax Error: "+error});
	}
}
exports.bsPdspuSizeDelAjax = async(req, res) => {
	// console.log("/bsPdspuSizeDelAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.query.id;
		const size = req.query.size;

		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("Odspus");
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});
		if(!Pdspu.sizes || Pdspu.sizes.length == 0) return res.json({status: 500, message: "此模特没有尺寸, 请添加"});

		let sizeDel = "-1";
		if(size == "l"){
			sizeDel = Pdspu.sizes[0];
			Pdspu.sizes.shift();
		} else {
			sizeDel = Pdspu.sizes[Pdspu.sizes.length-1]
			Pdspu.sizes.pop();
		}

		// 要作一个判断 如果此Pdspu下的 Odspus中 无论任何一个 只要包含 此 sizeDel 则不可删除
		const Odspus = Pdspu.Odspus;
		if(Odspus.length > 0) {
			const result = Odspus.some((item) => {
				return item.sizes.includes(sizeDel);
			});
			if(result) return res.json({status: 500, message: "还有未完成的订单 包含此尺寸, 暂时不可删除"});
		}

		const delObjParam = {Pdspu: id, size: sizeDel, Firm: crUser.Firm};

		// 删除Pdspu下 PdCostMts中 所有包含 size: sizeDel PdCostMts
		const PdCostMts = await PdCostMtDB.find(delObjParam, {_id: 1});
		for(let i=0; i<PdCostMts.length; i++) {
			Pdspu.PdCostMts.remove(PdCostMts[i]._id);
		}
		const PdCostMtsDelMany = await PdCostMtDB.deleteMany(delObjParam);


		// 删除Pdspu下 Pdskus中 所有包含 size: sizeDel 的 Pdskus
		const Pdskus = await PdskuDB.find(delObjParam, {_id: 1});
		for(let i=0; i<Pdskus.length; i++) {
			Pdspu.Pdskus.remove(Pdskus[i]._id);
		}
		const PdskusDelMany = await PdskuDB.deleteMany(delObjParam);

		const PdspuSave = await Pdspu.save()
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuSizeDelAjax Error: "+error});
	}
}


exports.bsPdspuColorUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("Colors");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Colors = await ColorDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1});

		return res.render("./user/bser/product/Pdspu/update/pdColorsUp", {title: "产品颜色更新", Pdspu, Colors, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuColorUpdAjax = async(req, res) => {
	// console.log("/bsPdspuColorUpdAjax");
	try {
		const crUser = req.session.crUser;
		const PdspuId = req.query.PdspuId;
		const ColorId = req.query.ColorId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: PdspuId, Firm: crUser.Firm})
			.populate("Odspus");
		if(!Pdspu) return res.json({status: 500, message: "没有找到此模特"});

		const isExist = Pdspu.Colors.includes(ColorId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此颜色, 不可重复添加, 请刷新重试"});
			Pdspu.Colors.unshift(ColorId);

			const crtObjParam = {Pdspu: PdspuId, Color: null, Firm: crUser.Firm};
			const crtObj = {Color: ColorId};
			// 在Pdspu下 为每个没有 Color 值的 Colors 添加一个含有 ColorId 的 Color;
			const Pdskus = await PdskuDB.find(crtObjParam);
			for(let i=0; i<Pdskus.length; i++) {
				const Pdsku = Pdskus[i];
				const objPdsku = new Object();
				objPdsku.Firm = Pdsku.Firm;
				objPdsku.Pdspu = Pdsku.Pdspu;
				objPdsku.PdCostMts = Pdsku.PdCostMts;
				if(crtObj.size) {objPdsku.size = crtObj.size; } else{objPdsku.size = Pdsku.size; }
				if(crtObj.Color) {objPdsku.Color = crtObj.Color; } else {objPdsku.Color = Pdsku.Color; }
				if(crtObj.Ptern) {objPdsku.Ptern = crtObj.Ptern; } else {objPdsku.Ptern = Pdsku.Ptern; }
				const PdskuSame = await PdskuDB.findOne({Pdspu: PdspuId, size: objPdsku.size, Color: objPdsku.Color, Ptern: objPdsku.Ptern, Firm: crUser.Firm});
				if(!PdskuSame) {
					const _objPdsku = new PdskuDB(objPdsku);
					const PdskuSave = await _objPdsku.save();
					Pdspu.Pdskus.push(PdskuSave._id);
				}
			}
		} else {
			// if(isExist == false) return res.json({status: 500, message: "此颜色已被删除, 请刷新查看"});

			// 要作一个判断 如果此Pdspu下的 Odspus中 无论任何一个 只要包含 此 ColorId 则不可删除
			const Odspus = Pdspu.Odspus;
			if(Odspus.length > 0) {
				const result = Odspus.some((item) => {
					return item.Colors.includes(ColorId);
				});
				if(result) return res.json({status: 500, message: "还有未完成的订单 包含此颜色, 暂时不可删除"});
			}

			Pdspu.Colors.remove(ColorId)
			const delObjParam = {Pdspu: PdspuId, Color: ColorId, Firm: crUser.Firm};
			// 删除Pdspu下 Pdskus中 所有包含 ColorId 的 Pdskus
			const Pdskus = await PdskuDB.find(delObjParam, {_id: 1});
			for(let i=0; i<Pdskus.length; i++) {
				Pdspu.Pdskus.remove(Pdskus[i]._id);
			}

			const PdskusDelMany = await PdskuDB.deleteMany(delObjParam);
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuColorUpdAjax Error: "+error});
	}
}

exports.bsPdspuPternUp = async(req, res) => {
	// console.log("/bsPdspuUp");
	try{
		const crUser = req.session.crUser;
		const id = req.params.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm})
			.populate("Pterns");
		if(!Pdspu) return res.redirect("/error?info=不存在此产品");
		const Pterns = await PternDB.find({Firm: crUser.Firm})
			.sort({"sort": -1, "updAt": -1})
		return res.render("./user/bser/product/Pdspu/update/pdPternsUp", {title: "产品印花更新", Pdspu, Pterns, crUser});
	} catch(error) {
		return res.redirect("/error?info=bsPdspuUp,Error&error="+error);
	}
}
exports.bsPdspuPternUpdAjax = async(req, res) => {
	// console.log("/bsPdspuPternUpdAjax");
	try {
		const crUser = req.session.crUser;
		const PdspuId = req.query.PdspuId;
		const PternId = req.query.PternId;
		const option = parseInt(req.query.option);
		const Pdspu = await PdspuDB.findOne({_id: PdspuId, Firm: crUser.Firm})
			.populate("Odspus");
		if(!Pdspu) return res.json({status: 500, message: "没有找到此印花图案"});

		const isExist = Pdspu.Pterns.includes(PternId);
		if(option == 1) {
			if(isExist == true) return res.json({status: 500, message: "已经有此印花图案, 不可重复添加, 请刷新重试"});
			Pdspu.Pterns.unshift(PternId);

			const crtObjParam = {Pdspu: PdspuId, Ptern: null, Firm: crUser.Firm};
			const crtObj = {Ptern: PternId};
			// 在Pdspu下 为每个没有 Ptern 值的 Pterns 添加一个含有 PternId 的 Ptern;
			const Pdskus = await PdskuDB.find(crtObjParam);
			for(let i=0; i<Pdskus.length; i++) {
				const Pdsku = Pdskus[i];
				const objPdsku = new Object();
				objPdsku.Firm = Pdsku.Firm;
				objPdsku.Pdspu = Pdsku.Pdspu;
				objPdsku.PdCostMts = Pdsku.PdCostMts;
				if(crtObj.size) {objPdsku.size = crtObj.size; } else{objPdsku.size = Pdsku.size; }
				if(crtObj.Color) {objPdsku.Color = crtObj.Color; } else {objPdsku.Color = Pdsku.Color; }
				if(crtObj.Ptern) {objPdsku.Ptern = crtObj.Ptern; } else {objPdsku.Ptern = Pdsku.Ptern; }
				const PdskuSame = await PdskuDB.findOne({Pdspu: PdspuId, size: objPdsku.size, Color: objPdsku.Color, Ptern: objPdsku.Ptern, Firm: crUser.Firm});
				if(!PdskuSame) {
					const _objPdsku = new PdskuDB(objPdsku);
					const PdskuSave = await _objPdsku.save();
					Pdspu.Pdskus.push(PdskuSave._id);
				}
			}
		} else {
			// if(isExist == false) return res.json({status: 500, message: "此印花图案已被删除, 请刷新查看"});

			// 要作一个判断 如果此Pdspu下的 Odspus中 无论任何一个 只要包含 此 PternId 则不可删除
			const Odspus = Pdspu.Odspus;
			if(Odspus.length > 0) {
				const result = Odspus.some((item) => {
					return String(item.Ptern) == PternId;
				});
				if(result) return res.json({status: 500, message: "还有未完成的订单 包含此印花, 暂时不可删除"});
			}

			Pdspu.Pterns.remove(PternId)

			const delObjParam = {Pdspu: PdspuId, Ptern: PternId, Firm: crUser.Firm};
			// 删除Pdspu下 Pdskus中 所有包含 PternId 的 Pdskus
			const Pdskus = await PdskuDB.find(delObjParam, {_id: 1});
			for(let i=0; i<Pdskus.length; i++) {
				Pdspu.Pdskus.remove(Pdskus[i]._id);
			}

			const PdskusDelMany = await PdskuDB.deleteMany(delObjParam);
		}
		const PdspuSave = await Pdspu.save();
		return res.json({status: 200});
	} catch(error) {
		console.log(error)
		return res.json({status: 500, message: "/bsPdspuPternUpdAjax Error: "+error});
	}
}



exports.bsPdSpusPhotosNew = async(req, res) => {
	try {
		const crUser = req.session.crUser;
		const id = req.body.id;
		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Pdspu) return res.redirect("/error?info=没有找到此模特, 刷新重试");
		if(!Pdspu.photos) Pdspu.photos = new Array();
		const photos = req.body.files;
		for(let i=0; i<photos.length; i++) {
			Pdspu.photos.push(photos[i]);
		}
		PdspuSave = await Pdspu.save();
		return res.redirect('/bsPdspu/'+id);
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPdSpusPhotosNew Error");
	}
}
exports.bsPdSpusPhotosDel = async(req, res) => {
	try {
		const crUser = req.session.crUser;
		const id = req.params.id;
		const photo = req.query.photo;

		const Pdspu = await PdspuDB.findOne({_id: id, Firm: crUser.Firm});
		if(!Pdspu) return res.redirect("/error?info=没有找到此模特, 刷新重试");
		const isExist = Pdspu.photos.includes(photo);
		if(isExist) {
			MdFile.delFile(photo);
			Pdspu.photos.remove(photo);
			const PdspuSave = await Pdspu.save();
		}
		return res.redirect('/bsPdspu/'+id);
	} catch(error) {
		console.log(error);
		return res.redirect("/error?info=bsPdspuPostDel Error");
	}
}

/* 在Pdspu下 为每个没有 Mtrial值的 PdCostMts 添加一个含有 Mtrial = MtrialId 的 PdCostMt; */
// const crtPdCostMtPdspu_FuncProm = async(crtObjParam, crtObj) => {
// 	try {
// 		return new Promise(async(resolve, reject) => {
// 			const newPdCostMts = new Array();
// 			const PdCostMts = await PdCostMtDB.find(crtObjParam);
// 			console.log('s')
// 			for(let i=0; i<PdCostMts.length; i++) {
// 			console.log(i)
// 				const PdCostMt = PdCostMts[i];
// 				const objPdCostMt = new Object();
// 				objPdCostMt.Firm = PdCostMt.Firm;
// 				objPdCostMt.Pdspu = PdCostMt.Pdspu;

// 				if(crtObj.size) {
// 					objPdCostMt.size = crtObj.size;
// 				} else{
// 					objPdCostMt.size = PdCostMt.size;
// 				}
// 				if(crtObj.Mtrial) {
// 					objPdCostMt.Mtrial = crtObj.Mtrial;
// 				} else {
// 					objPdCostMt.Mtrial = PdCostMt.Mtrial;
// 				}
// 				const _objPdCostMt = new PdCostMtDB(objPdCostMt);
// 				const PdCostMtSave = await _objPdCostMt.save();
// 				newPdCostMts.push(PdCostMtSave._id);
// 			}
// 			console.log('e')
// 			resolve(newPdCostMts);
// 		})
// 	} catch(error) {
// 		reject(error);
// 	}
// }

// 更新用量的数值
exports.bsPdspuPdCostMtUpdAjax = async(req, res) => {
		// console.log("/bsPdspuPdCostMtUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Color的id
		const PdCostMt = await PdCostMtDB.findOne({'_id': id, Firm: crUser.Firm})
		if(!PdCostMt) return res.json({status: 500, message: "没有找到此颜色信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "dosage") {
			val = parseFloat(val);
			if(isNaN(val) || val<0) return res.json({status: 500, message: "请传递正确的数值"});
		} else {
			return res.json({status: 500, message: "[bsPdspuPdCostMtUpdAjax field] 参数传递错误"});
		}

		PdCostMt[field] = val;

		const PdCostMtSave = PdCostMt.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}
// 更新库存的数值
exports.bsPdspuPdskuUpdAjax = async(req, res) => {
		// console.log("/bsPdspuPdskuUpdAjax");
	try{
		const crUser = req.session.crUser;
		const id = req.body.id;		// 所要更改的Color的id
		const Pdsku = await PdskuDB.findOne({'_id': id, Firm: crUser.Firm})
		if(!Pdsku) return res.json({status: 500, message: "没有找到此颜色信息, 请刷新重试"});

		let val = req.body.val;		// 数据的值

		const field = req.body.field;
		if(field == "stock") {
			val = parseInt(val);
			if(isNaN(val) || val<0) return res.json({status: 500, message: "请传递正确的数值"});
		} else {
			return res.json({status: 500, message: "[bsPdspuPdskuUpdAjax field] 参数传递错误"});
		}

		Pdsku[field] = val;

		const PdskuSave = Pdsku.save();
		return res.json({status: 200})
	} catch(error) {
		console.log(error);
		return res.json({status: 500, message: error});
	}
}