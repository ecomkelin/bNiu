const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const colection = 'PtFirm';
const dbSchema = new Schema({
	// type: Number,			// 公司所属类型 Conf中有

	code: {unique: true, type: String},
	nome: String,
	iva: String,
	cf: String,	// codice fisicale 税号
	post: String,
	addr: String,
	ct: String,
	city: String,
	nt: String,
	nation: String,
	tel: String,
	bank: String,
	iban: String,
	resp: String,// 负责人

	shelf: Number,										// req
	sort: Number,										// req
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.shelf) this.shelf = 1;
		if(!this.sort) this.sort = 1;
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
});

module.exports = mongoose.model(colection, dbSchema);