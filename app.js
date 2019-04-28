//app.js
var common=require('utils/common.js')
var util = require('utils/util.js')
var encrypt = require('utils/encrypt.js')
App({
  onLaunch: function () {
    var that=this;
    // logger
    //const logger = wx.getLogManager();
    var code="";
    // 登录
    common.userLogin(function(){
      var app = getApp();
      if (app.loginCallback) {
        app.loginCallback(app.globalData.userInfo);
      }
    });
    
  },
  globalData: {
    loginCode:null,
    userInfo: null,
    logger:null
  }
})