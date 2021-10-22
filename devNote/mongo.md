// 改某集合的名称
db.collection.renameCollection("NewCollectionName")

// 批量修改某一个数据库的字段
db.getCollection('products').find({}).forEach(function(item){
  db.getCollection('products').update({"_id":item._id},{$set:{"shelf":"1"}})
})
// 修改字段名称
db.集合名称.update({}, {$rename:{"旧键名称":"新键名称"}}, false, true)
.
// 批量删除某一个文档中的 某一字段 
比如删除users中的 role
db.users.update({}, {$unset: {'role': ''}}, false, true)