生成64位随机数
	1 打开terminal
	2 输入node 进入node命令模式
	3 require('crypto').randomBytes(64).toString('hex');
	执行两次步骤3 分别生成 accessToken 和 refreshToken 的secret