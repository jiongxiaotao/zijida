// pages/index/index.js
var server = require('../../utils/server.js')
var util = require('../../utils/util.js')
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
    weatherDetail:{}, //天气详情
    recorderManager:wx.getRecorderManager(),//录音控制对象
    recordStartPoint:{},//留言录音手势按下时的位置
    voiceDuration:0,//留言录音时长
    daojishi:"",//倒计时，最大15秒,初始不显示
    setInter:0,//定时器
    voiceMessageStatus:0, //留言可使用状态，默认收起不可用
    voiceMessageAnimation:"", //留言按钮动画
    ifVoiceButtonTapping:false,  //是否显示取消录音提示
    uploadVoiceFlag:true,//是否可以上传声音，当取消时会变为false
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
    //当某页面报code已失效时，会直接跳到首页，并由首页从新执行登录步骤
    if (options.reason && options.reason=='9001'){
      common.userLogin();
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
  //打开语音留言，上传用户建议
  showVoiceMessage:function(e){
    var that=this;
    //创建动画
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0,
    })
    animation.translateX(-160).step();
    that.setData({
      voiceMessageAnimation: animation.export(),
      voiceMessageStatus: 1
    })
    
  },
  hideVoiceMessage:function(){
    var that=this;
    //创建动画
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "ease",
      delay: 0,
    })
    animation.translateX(0).step();
    that.setData({
      voiceMessageAnimation: animation.export(),
    })
    //动画结束后变为留言关闭状态
    setTimeout(function(){
      that.setData({
        voiceMessageStatus: 0
      })
    },900)
  },
  //录音计时器
  recordingTimer: function () {
    var that = this;
    //将计时器赋值给setInter
    that.setData({
      setInter :setInterval(
      function () {
        var time = that.data.voiceDuration + 1;
        that.setData({
          voiceDuration: time,
          daojishi: (15 - time) >= 0?(15 - time):0
        })
      }
      , 1000)
    })
  },
  //开始录音
  startVoiceRecording:function(e){
    var that=this;
    //在录音按钮展开状态才能录音
    if (that.data.voiceMessageStatus){
      //录音按钮图标改变，显示取消录音提示
      that.setData({
        uploadVoiceFlag:true, //重置上传声音为true
        ifVoiceButtonTapping: true,
        voiceDuration:0,//重置录音时长
        daojishi:15,//重置倒计时15秒
        recordStartPoint: e.touches[0]  //记录开始时的手势位置
      })
      //开始录音
      const options = {
        duration: 15000, //指定录音的时长，单位 ms，最大为10分钟（600000），默认为1分钟（60000）
        sampleRate: 16000, //采样率
        numberOfChannels: 1, //录音通道数
        encodeBitRate: 96000, //编码码率
        format: 'mp3', //音频格式，有效值 aac/mp3
        frameSize: 50, //指定帧大小，单位 KB
      }
      //开始录音
      that.recordingTimer();
      that.data.recorderManager.start(options);
      that.data.recorderManager.onStart(() => {
        console.log('。。。开始录音。。。')
      });
      //错误回调
      that.data.recorderManager.onError((res) => {
        console.log(res);
      })
    }
  },
  //停止录音,并上传
  stopVoiceRecording:function(){
    var that=this;
    //清空倒计时，不显示读秒
    clearInterval(that.data.setInter);
    that.setData({
      daojishi: "",
    })
    //在录音按钮展开，且可以上传声音为true才能上传
    if (that.data.voiceMessageStatus ) {
      //录音按钮图标改变，显示取消录音提示
      that.setData({
        ifVoiceButtonTapping: false,
      })
      //停止
      that.data.recorderManager.stop();
      that.data.recorderManager.onStop((res) => {
        console.log('。。停止录音。。', res.tempFilePath)
        if(that.data.uploadVoiceFlag==false){
          console.log("用户已取消");
        }
        //录音时长小于1秒，弹框提示
        else if(that.data.voiceDuration==0){
          wx.showModal({
            title: '提示',
            content: '录音时间过短',
            showCancel: false,
            confirmText: '确认'
          })
        }
        else{
          const { tempFilePath } = res;
          //上传录音
          util.uploadFile({
            url:'uploadVoiceMessage',//这是你自己后台的连接
            filePath: tempFilePath,
            name: "voiceMessage",//后台要绑定的名称
            //参数绑定
            formData: {
              voiceDuration: that.data.voiceDuration,
              loginCode: app.globalData.loginCode,
            },
            success: function (res) {
              console.log(res);
              if(res.BK_STATUS=="00"){
                wx.showModal({
                  title: '提示',
                  content: '我们已收到您的留言，并会郑重考虑，谢谢！',
                  showCancel: false,
                  confirmText: '确认'
                })
              }
              else{
                wx.showModal({
                  title: '错误提示',
                  content: res.BK_DESC,
                  showCancel: false,
                  confirmText: '确认'
                })
              }
            },
            fail: function (res) {
              wx.showModal({
                title: '错误提示',
                content: '留言失败，请检查您的网络！',
                showCancel: false,
                confirmText: '确认'
              })
            }
          })
        }
        
      })
    }
  },
  //取消录音
  cancleVoiceRecording:function(e){
    var that=this;
    //手势移动距离
    let moveLength = e.touches[e.touches.length - 1].clientY - this.data.recordStartPoint.clientY;
    //在录音按钮展开状态,当前为可上传状态，手势距离大于50才能取消
    if (that.data.voiceMessageStatus && that.data.uploadVoiceFlag&& Math.abs(moveLength)>50) {
      console.log("取消录音");
      //录音按钮图标改变，显示取消录音提示
      that.setData({
        ifVoiceButtonTapping: false,
        uploadVoiceFlag:false
      })
    }
  },
  //进入评分，如果评分已结束，则查看结果
  goScoring: function (e) {
    const inviteCode = e.detail.value["inviteCode"];
    //非空校验
    if(inviteCode){
      //根据邀请码查询项目状态
      server.getProjectByInviteCode(inviteCode).then(function (data) {
        wx.setStorageSync("scoringProject", data);
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