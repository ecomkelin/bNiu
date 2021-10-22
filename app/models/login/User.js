const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const colection = 'User';
const dbSchema = new Schema({
	code: { unique: true, type: String },
	pwd: String,

	role: Number,
	nome: String,

	Language: {type: ObjectId, ref: 'Language'},

	Firm: {type: ObjectId, ref: 'Firm'},
	crtAt: Date,
	updAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.ctAt = Date.now();
	}
	this.updAt = Date.now();
	next();
});
module.exports = mongoose.model(colection, dbSchema);