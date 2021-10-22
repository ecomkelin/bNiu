const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colection = 'Firm';
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

	crtAt: Date,
	updAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.crtAt = Date.now();
	}
	this.updAt = Date.now();
	next();
});

module.exports = mongoose.model(colection, dbSchema);