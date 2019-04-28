//自行获取APIKey、SecretKey
const appId ="15594124";
const apiKey = 'OEGrZkEZNOnFcosriMShEGOs';
const secKey = 'IwAYN7BxE4o17fEw0FdNi0RMG1TLZyel';
//引入百度地图api
var bmap = require('bmap-wx.min.js')
const mapObj = new bmap.BMapWX({
  ak: 'iDGafwyjEjR8IvgmScgjKGLXAeRP04un'
}); 
//前端获取access_token
function getBaiduToken() {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '正在获取token',
    })
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + apiKey + '&client_secret=' + secKey,
      method: 'POST',
      dataType: "json",
      header: {
        'content-type': 'application/json; charset=UTF-8'
      },
      success: function (data) {
        wx.hideLoading();
        if (data.statusCode == 200 )
          resolve(data.data);
        else {
          wx.showModal({
            title: '错误',
            content: data.data.err_msg,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
            }
          })
        }
      },
      fail: function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '网络错误，请重试！',
          showCancel: false,
          confirmText: '确认',
          success: function (res) {
          }
        })
      }
    })
  })
}
//前端获取会话校验码
function getSessionCode(access_token) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '获取会话校验码',
    })
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v1/faceliveness/sessioncode?access_token=' + access_token,
      data: {
        appid: appId
      },
      method: 'POST',
      dataType: "json",
      header: {
        'content-type': 'application/json; charset=UTF-8' //'application/x-www-form-urlencoded'
      },
      success: function (data) {
        wx.hideLoading();
        if (data.statusCode==200 && data.data.error_code==0)
          resolve(data.data.result);
        else{
          wx.showModal({
            title: '错误',
            content: data.data.err_msg,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
            }
          })
          
        }
      },
      fail: function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '网络错误，请重试！',
          showCancel: false,
          confirmText: '确认',
          success: function (res) {
          }
        })
      }
    })
  })
}
//前端视频活体检测
function getFRResult(access_token, sessionId, videoBase64) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '正在活体检测',
    })
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v1/faceliveness/verify?access_token=' + access_token,
      data: {
        sessionId: sessionId,
        video_base64: videoBase64
      },
      method: 'POST',
      dataType: "json",
      header: {
        'content-type': 'application/x-www-form-urlencoded' //'application/json; charset=UTF-8' //
      },
      success: function (data) {
        wx.hideLoading();
        console.log(JSON.stringify(data));
        if (data.statusCode == 200 && data.data.error_code == 0)
          resolve(data.data.result);
        else {
          wx.showModal({
            title: '检测不通过',
            content: data.data.err_msg,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
            }
          })
        }
      },
      fail: function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '网络错误，请重试！',
          showCancel: false,
          confirmText: '确认',
          success: function (res) {
          }
        })
      }
    })
  })
}
//身份证ocr识别
function getOCR(access_token,side,imgBase64){
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '正在识别..',
    })
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=' + access_token,
      data: {
        image: imgBase64,
        id_card_side:side,//正面or反面
        detect_direction:true,//自动调整角度
        detect_risk: true //身份证风险类型检测
      },
      method: 'POST',
      dataType: "json",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 'application/json; charset=UTF-8' //
      },
      success: function (data) {
        wx.hideLoading();
        if (data.statusCode == 200 && data.error_code == undefined)
          resolve(data.data);
        else{
          wx.showModal({
            title: '错误',
            content: data.error_msg,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
            }
          })
          
        }
      },
      fail: function (data) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '网络错误，请重试！',
          showCancel: false,
          confirmText: '确认',
          success: function (res) {
          }
        })
      }
    })
  })
}
//调用百度地图获取天气
const getWeather = location => {
  return new Promise((resolve, reject) => {
    // 发起weather请求 
    mapObj.weather({
      success: data => {
        console.log(data.currentWeather[0]);
        resolve(data.currentWeather[0])
      },
      fail: data => {
        console.log(data);
        reject(data);
      }
    });
  })

}

module.exports={
  getBaiduToken: getBaiduToken,
  getSessionCode: getSessionCode,
  getFRResult: getFRResult,
  getOCR: getOCR,
  getWeather: getWeather
}