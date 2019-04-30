var server = require('../../utils/server.js')
var common = require('../../utils/common.js')
const app=getApp()
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
  },
  bindGetUserInfo: function (e) {
    var that=this;
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      console.log("授权获取用户信息成功！");
      //前端保存用户信息
      var loginStatus = wx.getStorageSync("loginStatus");
      //将从新授权并获取的用户信息保存
      var param = {
        loginCode: loginStatus.loginCode,
        encryptedData: e.detail.encryptedData,    //加密的用户信息
        iv: e.detail.iv //用于解密的偏移量
      }
      server.updateUserInfo(loginStatus.loginCode,param).then(function (data) {
        app.globalData.userInfo = data.userInfo;
        console.log("P2S保存用户信息成功:" + getApp().globalData.userInfo.cus_name);
        //用户已经授权过,返回到首页
        wx.reLaunch({
          url: '../index/index',
        });
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  }
  
})