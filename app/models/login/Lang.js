const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const colection = 'Lang';
const dbSchema = new Schema({
	
	code: { unique: true, type: String },	// 编码		CN 		EN 		IT
	photo: String,
	langs: [{
		Lang: {type: ObjectId, ref: 'Lang'},	// 如果为空 则为默认值
		nome: String, 							// 中文 English Italiano
	}],

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