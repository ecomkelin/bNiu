const fs = require('fs');
const path = require('path');

exports.delFile = (picDel) => {
	try{
		if(picDel.split('/DEF/').length != 2) fs.unlink(path.join(__dirname, '../../public' + picDel), (err) => {});
	} catch(error) {
		// console.log("MdFile delFile Error: " + error);
	}
}

exports.newFiles = async(req, res, next) => {
	// console.log("MdFile newFiles");
	try {
		const flName = req.body.flName.toUpperCase();	// 获取图片主要名称
		const flDir = req.body.flDir.toUpperCase();		// 图片要储存的位置
		if(!flDir) return next();

		const dataFls = req.files.fls;	// 图片数据
		const files = new Array();
		if(dataFls instanceof Array) {
			for(let i=0;  i<dataFls.length; i++) {
				const fl = dataFls[i];
				if(fl && fl.originalFilename) {
					const file = await recuPics(fl, flName, i, flDir);
					files.push(file);
				}
			}
		} else {
			const fl = dataFls;
			if(fl && fl.originalFilename) {
				const file = await recuPics(fl, flName, 0, flDir);
				files.push(file);
			}
		}
		req.body.files = files;
		return next();
	} catch(error) {
		return res.redirect("/error?info=MdFile, newFiles, Error&error="+error);
	}
}

const recuPics = (fl, flName, fgName, flDir) => {
	return new Promise((resolve, reject) => {
		try {
			const flPath = fl.path;		// 图片的位置
			fs.readFile(flPath, (err, data) => {
				const type = fl.type.split('/')[1].toUpperCase();		// 图片类型
				const photoName = flName + '-' + fgName + '_' + Date.now() + '.' + type;	// 图片名称 code_2340.jpg
				const photoSrc = path.join(__dirname, '../../public/UPLOAD/'+flDir);	// niu/public/UPLOAD/***/
				const photo = photoSrc + photoName;
				fs.writeFile(photo, data, (err) => {
					resolve('/UPLOAD'+flDir+photoName);
				});
			});
		} catch(error) {
			reject(error);
		}
	})
}