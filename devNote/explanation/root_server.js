// 链接数据库
const mongoose = require('mongoose');
// 要是用 Node.js 自带的 Promise 替换 mongoose 中的 Promise，否则有时候会报警告
mongoose.Promise = global.Promise;
// 需要链接的数据库地址
// mongoose.connect(Ready.dbUrl);
mongoose.connect(Ready.dbUrl,  {useNewUrlParser: true, useCreateIndex: true});
// useCreateIndex: true		// mongoose > 5.2.10
// useNewUrlParser: true		// mongodb > 3.1.0