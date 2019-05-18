var server=require('server.js')
//用户登录，检查session还在不在，如果不在就登录，在就不做啥
function userLogin(after) {
  wx.checkSession({
    success: function () {
      //存在登陆态
      console.log("已经登录");
      //前端已保存登录信息
      var loginStatus = wx.getStorageSync("loginStatus");
      getApp().globalData.loginCode = loginStatus.loginCode;//全局缓存loginCode
      if (loginStatus && loginStatus.loginStatus==1){
        //获取userinfo
        getUserInfo(loginStatus.loginCode,after);
      }
      else{
        console.log("storage失效，重新登录");
        login(function (loginStatus){
          //获取userinfo
          getUserInfo(loginStatus.loginCode,after);
        });
      }
     
    },
    fail: function () {
      //不存在登陆态,登陆,并从新保存到P2S
      login(function (loginStatus){
        //获取userinfo
        getUserInfo(loginStatus.loginCode,after);
      });
    }
  })
}
function login(succ) {
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      console.log("登陆成功,code=" + res.code);
      if (res.code) {
        //code2session,获取用户loginCode
        server.getOpenId(res.code).then(data=> {
          console.log("获取loginCode成功：" + data.loginCode);
          getApp().globalData.loginCode = data.loginCode;//全局缓存loginCode
          wx.setStorageSync("loginStatus", data);
          succ&& succ(data);
        })
      }
      else {
        wx.showModal({
          title: '错误',
          content: '登录失败!!!' + JSON.stringify(res),
          showCancel: false,
          confirmText: '确认'
        })
      }
    },
    fail: res => {
      wx.showModal({
        title: '错误',
        content: '登录失败!!!'+JSON.stringify(res),
        showCancel: false,
        confirmText: '确认'
      })
    }
  })
}
//从p2s获取，获取不到就去wx获取并存到p2s
function getUserInfo(loginCode,after){
  //p2获取userinfo
  server.queryUserInfo(loginCode).then(function (data) {
    //正确返回数据
    if (data.userInfo){
      getApp().globalData.userInfo = data.userInfo;
      console.log("P2S获取用户信息成功:" + getApp().globalData.userInfo.cus_name);
      after&& after();
    }
    //没有查到数据，上次应该没有微信授权获取
    else{
      //wx获取用户信息
      getWXUserInfo(function (data) {
        //保存微信获取的userInfo并返回p2s的userInfo
        var param={
          loginCode:loginCode,
          encryptedData: data.encryptedData,    //加密的用户信息
          iv:data.iv //用于解密的偏移量
        }
        server.updateUserInfo(loginCode,param).then(function (userData) {
          getApp().globalData.userInfo = userData.userInfo;
          console.log("P2S保存用户信息成功:" + getApp().globalData.userInfo.cus_name);
          after && after();
        });
      })
    }
  })
  .catch(function(){
    console.log("缓存code已失效");
    //p2s缓存cache失效，从新登录并保存code，openId
    login(function (loginStatus) {
      //wx获取用户信息
      getWXUserInfo(function (data) {
        //保存微信获取的userInfo并返回p2s的userInfo
        var param = {
          loginCode: loginStatus.loginCode,
          encryptedData: data.encryptedData,    //加密的用户信息
          iv: data.iv //用于解密的偏移量
        }
        server.updateUserInfo(loginStatus.loginCode,param).then(function (userData) {
          getApp().globalData.userInfo = userData.userInfo;
          console.log("P2S保存用户信息成功:" + getApp().globalData.userInfo.cus_name);
          after && after();
        });
      })
    });
  })
}
//从微信获取用户授权和用户信息，一般下一步一定是存到p2s
function getWXUserInfo(succ){
  //先获取用户信息
  wx.getSetting({
    success: function success(res) {
      //已授权，直接获取客户信息
      if (res.authSetting['scope.userInfo']) {
        wx.getUserInfo({
          success: function success(res) {
            //前端保存用户信息
            getApp().globalData.userInfo = res.userInfo;
            console.log("微信获取用户信息成功:" + res.userInfo.nickName);
            if(succ) succ(res);
          }
        });
      }
      //未授权，跳转授权页面
      else {
        //需要使用button授权
        if (wx.canIUse('button.open-type.getUserInfo')) {
          wx.redirectTo({
            url: '../login/login',
          })
        }
        else {
          // 在没有 open-type=getUserInfo 版本的兼容处理
          wx.getUserInfo({
            success: function success(res) {
              //前端保存用户信息
              getApp().globalData.userInfo = res.userInfo;
              console.log("获取用户信息成功:" + res.userInfo.nickName);
              if (succ) succ(res);
            }
          });
        }
      }
    },
    fail: res => {
      //需要使用button授权
      if (that.data.canIUse) {
        wx.redirectTo({
          url: '../login/login',
        })
      }
      else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            getApp().globalData.userInfo = res.userInfo;
            console.log("获取用户信息成功:" + res.userInfo.nickName);
            if (succ) succ(res);
          }
        })
      }
    }
  });
}
module.exports = {
  userLogin: userLogin
}