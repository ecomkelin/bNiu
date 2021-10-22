function uploadFile(file) {
	var chunkSize = 1024 * 1024;	// 每片1M大小
	var totalSize = file.size;
	var chunkQuantity = Math.ceil(totalSize/chunkSize);		//分片总数
	var offset = 0;		// 偏移量
	
	var reader = new FileReader();
	reader.onload = function(e) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST","http://xxxx/upload?fileName="+file.name);
		xhr.overrideMimeType("application/octet-stream");
		
		xhr.onreadystatechange = function() {
			if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				++offset;
				if(offset === chunkQuantity) {
					alert("上传完成");
				} else if(offset === chunkQuantity-1){
					blob = file.slice(offset*chunkSize, totalSize);	// 上传最后一片
					reader.readAsBinaryString(blob);
				} else {
					blob = file.slice(offset*chunkSize, (offset+1)*chunkSize); 
					reader.readAsBinaryString(blob);
				}
			}else {
				alert("上传出错");
			}
		}
		
		if(xhr.sendAsBinary) {
			xhr.sendAsBinary(e.target.result);	// e.target.result是此次读取的分片二进制数据
		} else {
			xhr.send(e.target.result);
		}
	}
	var blob = file.slice(0, chunkSize);
	reader.readAsBinaryString(blob);
}