* ============== 正在使用的插件 ============== *
bcryptjs:			md5密码加密
body-parser:		表单传输 req.body 接收数据
connect-mongo:		链接mongo数据库
connect-multiparty: post表单提交req.files接收数据
cookie-parser:		cookie
cors: 				跨域解决方案
dotenv:				配置文件
excel4node:			excel读写
express:			后端框架
express-session:	session
formidable:			解决ajax跨域传输文件的插件
jsonwebtoken:		生成token的jwt插件
moment:				时间生成
mongoose:			mongodb的框架
mongoose-float:		mongoose存储小数
pug:				前段模板
qr-image:			二维码生成器
serve-static:		服务器的静态资源路径
underscore:
	const _ = require('underscore')


* ============== 备用插件 ============== *
compress-images:	图片压缩
express-pdf:		服务器生成pdf
html-pdf:			html生成pdf
node-xlsx:
	读取excel的数据
	let excel = require('node-xlsx').parse(filePath)[0];
	req.body.excelDate = excel.data;
socket.io:			实时通讯用的socket编程
xto:				查询快递

* ============== 开发环境插件 ============== *

nodemon:	开发系统的时候 自动重启后台插件
