const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const colection = 'PdNome';
const dbSchema = new Schema({
	/* ------------------ 创建时 ------------------ */
	code: String,	// 本公司唯一

	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},
		nome: String
	}],

	sort: Number,
	/* ------------------ 自动生成 ------------------ */
	Firm: {type: ObjectId, ref: 'Firm'},
	updAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		if(!this.sort) this.sort = 1;
	}
	this.updAt = Date.now();
	next();
})

module.exports = mongoose.model(colection, dbSchema);