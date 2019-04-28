// pages/index/index.js
var server = require('../../utils/server.js')
var common = require('../../utils/common.js')
var baiduAPI = require('../../utils/baiduAPI.js')
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'), //有没有open-type.getUserInfo
    userInfo:{},//用户信息
    tempFilePaths:"",  //  测试拍照路径
    weatherShow:false,  //是否显示天气面板
    weatherDetail:{} //天气详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    //获取app.onLaunch的回调数据
    if (app.globalData.userInfo){
      that.setData({
        userInfo: app.globalData.userInfo
      })
    } 
    else{
      app.loginCallback = userInfo=>{
        that.setData({
          userInfo: userInfo
        })
      }
    }
    // 登录
    baiduAPI.getWeather().then(data => {
      console.log();
      that.setData({
        weatherDetail: data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //显示天气面板
  showWeatherDetail:function(){
    var that=this;
    that.setData({
      weatherShow:that.data.weatherShow?false:true
    })
  },
  //隐藏天气面板
  hideWeatherDetail: function () {
    var that = this;
    that.setData({
      weatherShow: false
    })
  },
  //进入评分，如果评分已结束，则查看结果
  goScoring: function (e) {
    const inviteCode = e.detail.value["inviteCode"];
    //非空校验
    if(inviteCode){
      //根据邀请码查询项目状态
      server.getProjectByInviteCode(app.globalData.loginCode,inviteCode).then(function (data) {
        //已终止，或当前用户已对项目进行打分，直接进入看结果页面
        if (data.status == 9 || data.curUserDone)
          wx.navigateTo({
            url: '../result/result?id=' + data.id + "&fromUser=cust",
          })
        else {
          wx.navigateTo({
            url: '../scoring/scoring?id=' + data.id+"&status="+data.status,
          })
        }
      })
    }
    else{
      wx.showModal({
        title: '提示',
        content: '请输入邀请码!!!',
        showCancel: false,
        confirmText: '确认'
      })
    }
   
  },
  //测试webview
  testJump:function(){
    wx.navigateTo({
      url: '../outwebview/outwebview',
    })
  },
  //测试FR
  testFR: function () {
    //服务器发送
    // server.getBaiduFRSessionCode().then(data=>{
    //   console.log(data.api_result);
    //   var videoPath="/home/ap/share/file/input/ynt/faceTest.mp4";
    //   server.getBaiduFRResult(data.api_result.result.session_id,videoPath).then(data=>{
    //     console.log(data);
    //   });
    // })

    //小程序端发送
    //获取access_token
    baiduAPI.getBaiduToken().then(tokenData => {
      //获取语音校验码
      baiduAPI.getSessionCode(tokenData.access_token).then(data => {
        console.log("getSessionCode:" + data.code);
        wx.showModal({
          title: '提示',
          content: "请录视频并读取数字："+data.code,
          showCancel: false,
          confirmText: '确认',
          success:function(){
            wx.chooseVideo({
              count: 1, // 默认9
              sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
              sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
              maxDuration:10, // 最长录制时间
              camera:'front', // 默认调起自拍摄像头
              success: function (res) {
                console.log(res.tempFilePath);
                wx.showLoading({
                  title: '正在视频转码',
                })
                //上传到服务器
                wx.getFileSystemManager().readFile({    //获取全局文件管理器
                  filePath: res.tempFilePath,
                  encoding: 'base64',
                  success: base64Res => {
                    wx.hideLoading();
                    console.log("base64 encode done!");
                    baiduAPI.getFRResult(tokenData.access_token,
                      data.session_id, base64Res.data).then(frRes => {
                        console.log("final result:score=" + frRes.score + " threshold=" + frRes.thresholds["frr_1e-2"]);
                        //分数大于阈值则认为XX_XX通过
                        if (frRes.score > frRes.thresholds["frr_1e-2"])
                          wx.showModal({
                            title: '',
                            content: "XX_XX通过",
                            showCancel: false,
                            confirmText: '确认'
                          })
                        else
                          wx.showModal({
                            title: '',
                            content: "XX_XX拒绝",
                            showCancel: false,
                            confirmText: '确认'
                          })
                      })

                  }
                })
              }
            })
          }
        })
        
      })
    })
    
  },
  //百度身份证识别
  testOCR:function(e){
    var that = this;
    const resMap={
      normal:"识别正常",
      reversed_side:"身份证正反面颠倒",
      non_idcard:'上传的图片中不包含身份证',
      blurred:'身份证模糊',
      other_type_card:'其他类型证照',
      over_exposure:'身份证关键字段反光或过曝',
      over_dark:'身份证欠曝（亮度过低）',
      unknown:'未知状态'
    }
    const side = e.currentTarget.dataset.side;//身份证正面还是反面
    //选图片
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res.tempFilePaths[0]);
        wx.showLoading({
          title: '正在图片转码',
        })
        //图片转码
        wx.getFileSystemManager().readFile({    //获取全局文件管理器
          filePath: res.tempFilePaths[0],
          encoding: 'base64',
          success: base64Res => {
            wx.hideLoading();
            console.log("base64 encode done!");
            //获取token
            baiduAPI.getBaiduToken().then(tokenData=>{
              baiduAPI.getOCR(tokenData.access_token, 
              side,base64Res.data).then(data=>{
                var status = data.image_status;
                //返回结果正常
                if (status=='normal'){
                  if(side=='front'){
                    //解析返回内容
                    let name = data.words_result['姓名'].words;
                    let sex = data.words_result['性别'].words;
                    let birth = data.words_result['出生'].words;
                    let id = data.words_result['公民身份号码'].words;
                    let race = data.words_result['民族'].words;
                    let addr = data.words_result['住址'].words;
                    wx.showModal({
                      title: '结果',
                      content: id + name + sex + birth + race + addr,
                      showCancel: false,
                      confirmText: '确认',
                      success: function (res) {
                      }
                    })
                  }
                  else{
                    //解析返回内容
                    let enddate = data.words_result['失效日期'].words;
                    let startdate = data.words_result['签发日期'].words;
                    let office = data.words_result['签发机关'].words;
                    wx.showModal({
                      title: '结果',
                      content: startdate + enddate + office,
                      showCancel: false,
                      confirmText: '确认',
                      success: function (res) {
                      }
                    })
                  }
                  
                }
                else{
                  wx.showModal({
                    title: '提示',
                    content: resMap[status],
                    showCancel: false,
                    confirmText: '确认',
                    success: function (res) {
                    }
                  })
                }

             
                
              })
            })
          }
        })
      }
    })
  },
  testQRcode(e){
    var that=this;
    wx.scanCode({
      success: (res) => {
        let show = "结果:" + res.result + "二维码类型:" + res.scanType + "字符集:" + res.charSet + "路径:" + res.path;
        wx.navigateTo({
          url: '../outwebview/outwebview?url='+res.result,
        })
        console.log(show);
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (res) => {
        wx.showToast({
          title: '失败',
          icon: 'success',
          duration: 2000
        })
      },
      complete: (res) => {
      }
    })
  },
  //测试百度地图
  testMap(e){
    wx.navigateTo({
      url: '../map/map',
    })
  }
})