var server = require('../../utils/server.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['进行中', '已完成'],
    currentTab: 0, //导航栏当前选中项
    doingList: [], //正在打分的项目
    doneList: [], //已打分的项目
    operMenu: { //项目点击时操作项
      "0": ["项目设置", "编辑评分内容", "发布", "删除项目"],  //未发布--项目设置，编辑评分内容;发布
      "1": ["项目设置", "编辑评分内容", "开放评分", "删除项目"],//已发布--项目设置;编辑评分内容；开放评分
      "2": ["查看实时评分", "终止评分"], //已开放评分--查看实时评分；终止评分
      "9": ["查看评分结果"] //已结束--查看结果
    },
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  /**
  * 生命周期函数--页面展示时，包括页面栈退回到当前页
  */
  onShow: function () {
    var that = this;
    //查询正在评分的项目列表
    server.getProjectList(app.globalData.loginCode, "0,1,2").then(data => {
      //数据实时渲染
      that.setData({
        doingList: data.projectList
      });
    })
  },
  //响应点击导航栏
  navbarTap: function (e) {
    var that = this;
    that.setData({
      currentTab: e.currentTarget.dataset.idx
    });
    //切换导航栏时，查询对应数据
    let statusCodes=(that.data.currentTab==1)?"9":"0,1,2";
    server.getProjectList(app.globalData.loginCode, statusCodes).then(data => {
      //已完成数据渲染
      if(that.data.currentTab==1)
        that.setData({
          doneList: data.projectList
        });
      //进行中
      else
        that.setData({
          doingList: data.projectList
        });
    })
  },
  //根据项目状态弹出对应的可操作菜单
  chooseOperMenu: function (e) {
    var that = this;
    let curProject=e.currentTarget.dataset.project;//获取当前操作的项目
    //let idx = e.currentTarget.dataset.itemIndex;//页面展示的位置
    wx.setStorageSync("curProject", curProject);
    //未发布--项目设置，编辑评分内容
    if (curProject.status == "0") {
      //编辑
      if (e.detail.value == '0') {
        console.log("未发布--项目设置");
        wx.navigateTo({
          url: '../editProject/editProject?type=edit&id=' + curProject.id,
        })
      }
      else if (e.detail.value == '1') {
        console.log("未发布--编辑评分内容");
        wx.navigateTo({
          url: '../editChart/editChart?id=' + curProject.id,
        })
      }

      else if (e.detail.value == '2') {
        console.log("未发布--发布");
        wx.showModal({
          title: '提示',
          content: '发布后仍可修改评分内容，其他用户可以预览，确认发布？',
          showCancel: true,
          cancelText: "取消",
          confirmText: '确认',
          success: function (res) {
            if (res.confirm) {
              console.log('调用项目发布接口')
              curProject.status=1;
              server.updateProject(app.globalData.loginCode, curProject).then(() => {
                console.log('更新为开放评分状态')
                that.refreshList();
              })
            }
          }
        })
      }
      //删除项目
      else if (e.detail.value == '3') {
        console.log("已发布--删除项目");
        wx.showModal({
          title: '提示',
          content: '确认删除本项目？',
          showCancel: true,
          cancelText: "取消",
          confirmText: '确认',
          success: function (res) {
            if (res.confirm) {
              //删除
              server.deleteProject(app.globalData.loginCode,curProject.id).then(() => {
                console.log('项目已删除')
                that.refreshList();
              })
            }
          }
        })
      }
    }
    //已发布--项目设置;编辑评分内容；开放评分
    else if (curProject.status == "1") {
      if (e.detail.value == '0') {
        console.log("已发布--项目设置");
        wx.navigateTo({
          url: '../editProject/editProject?type=edit&id=' + curProject.id,
        })
      }
      else if (e.detail.value == '1') {
        console.log("已发布--编辑评分内容");
        wx.navigateTo({
          url: '../editChart/editChart?id=' + curProject.id,
        })
      }
      else if (e.detail.value == '2') {
        console.log("已发布--开放评分");
        wx.showModal({
          title: '提示',
          content: '开放评分后其他用户可以进行评分，本项目无法修改和删除，确认开放？',
          showCancel: true,
          cancelText: "取消",
          confirmText: '确认',
          success: function (res) {
            if (res.confirm) {
              console.log('项目开放评分')
              curProject.status = 2;
              server.updateProject(app.globalData.loginCode,curProject).then(()=>{
                console.log('更新为开放评分状态')
                that.refreshList();
              })
            }
          }
        })
      }
      //删除项目
      else if (e.detail.value == '3') {
        console.log("已发布--删除项目");
        wx.showModal({
          title: '提示',
          content: '确认删除本项目？',
          showCancel: true,
          cancelText: "取消",
          confirmText: '确认',
          success: function (res) {
            if (res.confirm) {
              //删除
              server.deleteProject(app.globalData.loginCode,curProject.id).then(() => {
                console.log('项目已删除')
                that.refreshList();
              })
            }
          }
        })
      }
    }
    //已开放评分--查看实时评分；终止评分；转发二维码
    else if (curProject.status == "2") {
      if (e.detail.value == '0') {
        console.log("已开放评分--查看实时评分");
        wx.navigateTo({
          url: '../result/result?id=' + curProject.id + "&status=" + curProject.status,
        })
      }
      else if (e.detail.value == '1') {
        console.log("已开放评分--终止评分");
        wx.showModal({
          title: '提示',
          content: '终止评分后将不接收其他用户的打分结果，本项目结束，确认终止？',
          showCancel: true,
          cancelText: "取消",
          confirmText: '确认',
          success: function (res) {
            if (res.confirm) {
              console.log('项目终止评分')
              curProject.status =9 ;
              server.updateProject(app.globalData.loginCode,curProject).then(() => {
                that.refreshList();
              })
            }
          }
        })
      }
    }
    //已结束--查看结果
    else {
      if (e.detail.value == '0') {
        console.log("已结束--查看结果");
        wx.navigateTo({
          url: '../result/result?id=' + curProject.id + "&status=" + curProject.status,
        })
      }
    }
  },
  //新建评分项目
  goAddProject: function (e) {
    wx.navigateTo({
      url: '../editProject/editProject?type=add',
    })
  },
  //从新情求列表并渲染
  refreshList:function(){
    var that=this;
    //查询正在评分的项目列表
    server.getProjectList(app.globalData.loginCode, "0,1,2").then(data => {
      //数据实时渲染
      that.setData({
        doingList: data.projectList
      });
    })
  },
  //拷贝项目，复制该项目的评分内容，重置项目状态
  copy(e){
    var that=this;
    wx.showModal({
      title: '提示',
      content: '新项目的评分内容与原项目保持一致，并重置项目状态为未发布，原项目不受影响，确认复制？',
      showCancel: true,
      cancelText: "取消",
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          //先查询该用户是否已经达到最大使用限度
          server.getProjectMaxCount(app.globalData.loginCode).then(data => {
            if(data.canAdd){
              console.log('可以复制');
              let curProject = e.currentTarget.dataset.project;//获取当前操作的项目
              server.addProject(app.globalData.loginCode,curProject).then(function (data) {
                console.log("复制成功id=" + data.id);
              })
            }
            else{
              wx.showModal({
                title: '提示',
                content: '已达到最大项目个数，无法新增！',
                showCancel: false,
                confirmText: '确认'
              })
            }
            
          })
          
        }
      }
    })
  },
  //已完成的点击直接查看结果
  goResult:function(e){
    let curProject = e.currentTarget.dataset.project;//获取当前操作的项目
    wx.navigateTo({
      url: '../result/result?id=' + curProject.id + "&status=" + curProject.status,
    })
  }
})