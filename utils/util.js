
var encrypt = require('encrypt.js')
var config = require('config.js')
const AES_KEY_BASE64 = "VzBTTlhXbFBOSXAzNkRSMA";//base64秘钥
const AES_IV = 'ZZXJoOLvoTJ5u2BF';//十六位十六进制数作为秘钥偏移量

/*
 参数加密
*/
function toJsonDataSec(params) {
  if (params) {
    //转字符串
    if (typeof params != "string"){
      params = JSON.stringify(params);
    }
    var encryptRes = encrypt.encryptDft(params);
    //加密成功，返回密文
    if(encryptRes.success)
      return encryptRes.encrypted;
    //加密失败，返回false
    else
      return false;
  }
  else
    return params;
}
/**
 * 发送交易
 */
function _ajax(option) {
  wx.showLoading({
    title: option.loading ? option.loading:'请稍等...',
  })
  var jsonDataSec='';
  //jsonData参数加密
  // if (option.data.jsonData)
  //   jsonDataSec = toJsonDataSec(option.data.jsonData);
  // //加密失败，直接走failure
  // if (jsonDataSec===false){
  //   option.failure();
  // }
  // //加密成功，继续发交易
  // else{
    wx.request({
      url: config.baseUrl+option.url,
      method: option.method || 'GET',
      header: option.header || {
        "Content-type": "application/json;charset=UTF-8"
      },
      data: option.data||{},
      success: function (data) {
        wx.hideLoading();
        option.success(data.data);
      },
      fail: function (data) {
        wx.hideLoading();
        option.fail(data.data);
      }
    })
  // }
}
//上传文件
function _uploadFile(option){
  wx.showLoading({
    title: option.loading ? option.loading : '正在上传...',
  })
  wx.uploadFile({
    url: config.baseUrl + option.url,//这是你自己后台的连接
    filePath: option.filePath,
    name: option.name,//后台要绑定的名称
    header: {
      "Content-Type": "multipart/form-data"
    },
    //参数绑定
    formData:option.formData,
    success: function (data) {
      wx.hideLoading();
      option.success(JSON.parse(data.data));
    },
    fail: function (data) {
      wx.hideLoading();
      option.fail();
    }
  })
}
//页面栈回退，参数：目标页面的全路径
const navigateBack = (destRoute) => {
  let stack = getCurrentPages();//获取页面栈
  let delta=0;
  if(destRoute.url){
    //遍历找到目标页面所在位置
    for (var i = 0; i < stack.length; i++) {
      if (stack[i].route == destRoute.url) {
        delta = stack.length - 1 - i;//需要回退多少级
        break;
      }
    }
    if (delta > 0)
      wx.navigateBack({
        delta: delta
      })
  }
  
}

//日期转字符串
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//日期的一位数前补0
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//暴露接口
module.exports = {
  formatTime: formatTime,
  ajax:_ajax,
  uploadFile: _uploadFile,
  navigateBack: navigateBack
}
