
//index.js
var app = getApp()
//引入百度地图api
var bmap = require('../../utils/bmap-wx.min.js')
//用于保存BMap.search接口返回的数据

Page({
  data:{
    mapObj:{}, //操作百度map的对象
    latitude: '',
    longitude: '',
    height:'auto',
    markers: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用wx.getSystemInfo接口，然后动态绑定组件高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight
        })
      }
    })

    //构造百度地图api实例
    that.setData({
      mapObj: new bmap.BMapWX({
        ak: 'v5m8GGqHZDt7maaL9DwhVGDK9HklMnzQ'
      })
    })

    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.setData({
          latitude : res.latitude,
          longitude : res.longitude
        })
         
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 开始拖动地图回调方法
  _dragStartFn: function () {
    // 清空中心点
    
  },
  // 结束拖动地图回调方法
  _dragEndFn: function () {
    // 清除覆盖物
    // this.map.clearOverlays();
    // 重新获取中心点
    this.centerPoint = this.map.getCenterPoint();
    var location = this.centerPoint.lat + ',' + this.centerPoint.lng;
    console.log(location);
    this.getCity(location);
    var tt_Point = PJF.map.bd09ToGcj02(this.centerPoint.lat, this.centerPoint.lng);
    this.isSearchBack = false;
    this.queryOrgNearby(tt_Point); // TODO
  },

  //查询当前位置的poi信息
  //官方文档上说可以查询指定位置的周边信息
  //然而当前源码中却存在一个bug导致不能查询指定位置的周边信息
  search: function (e) {
    var that = this
    //使用百度api查询周边信息
    //其中使用到了dataset属性
    that.data.mapObj.search({
      query: e.target.dataset.type,
      success: data=>{
        that.setData({
          markers: data.wxMarkerData
        })
        that.setData({
          latitude: data.wxMarkerData[0].latitude
        })
        that.setData({
          longitude: data.wxMarkerData[0].longitude
        })
      },
      fail: data=>{
        console.log(data)
      }
    })
  }

})
