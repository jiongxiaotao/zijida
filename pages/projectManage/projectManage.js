var server = require('../../utils/server.js')
import WxValidate from '../../utils/WxValidate.js'
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
    projectManageInfo:{},//项目管理情况
    operMenu: { //项目点击时操作项
      "0": ["项目设置", "编辑表格内容", "发布", "删除项目"],  //未发布--项目设置，编辑表格内容;发布
      "1": ["项目设置", "编辑表格内容", "开放评分", "删除项目"],//已发布--项目设置;编辑表格内容；开放评分
      "2": ["查看实时评分", "终止评分"], //已开放评分--查看实时评分；终止评分
      "9": ["查看评分结果"] //已结束--查看结果
    },
    index: 0,
    copyTipShow:false //拷贝弹出提示框是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //初始化表单验证规则
    that.initValidate();
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
    server.getProjectList("0,1,2").then(data => {
      //数据实时渲染
      that.setData({
        doingList: data.projectList
      });
    })
    //查看用户可维护的项目情况
    server.getProjectManage().then(data => {
      that.setData({
        projectManageInfo:data
      })
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
    server.getProjectList(statusCodes).then(data => {
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
    let editingProject=e.currentTarget.dataset.project;//获取当前操作的项目
    //let idx = e.currentTarget.dataset.itemIndex;//页面展示的位置
    wx.setStorageSync("editingProject", editingProject);
    //未发布--项目设置，编辑表格内容
    if (editingProject.status == "0") {
      //编辑
      if (e.detail.value == '0') {
        console.log("未发布--项目设置");
        wx.navigateTo({
          url: '../editProject/editProject?type=edit&id=' + editingProject.id,
        })
      }
      else if (e.detail.value == '1') {
        console.log("未发布--编辑表格内容");
        //评分类跳转
        if (editingProject.type == 'p')
          wx.navigateTo({
            url: '../editPingfenChart/editPingfenChart?id=' + editingProject.id,
          })
        //投票类跳转
        else if (editingProject.type == 't')
          wx.navigateTo({
            url: '../editToupiaoChart/editToupiaoChart?id=' + editingProject.id,
          })
        //问卷类跳转
        else
          wx.navigateTo({
            url: '../editWenjuanChart/editWenjuanChart?id=' + editingProject.id,
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
              editingProject.status=1;
              server.updateProject(editingProject).then(() => {
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
              server.deleteProject(editingProject.id).then(() => {
                console.log('项目已删除')
                that.refreshList();
                //查看用户可维护的项目情况
                server.getProjectManage().then(data => {
                  that.setData({
                    projectManageInfo: data
                  })
                })
              })
            }
          }
        })
      }
    }
    //已发布--项目设置;编辑表格内容；开放评分
    else if (editingProject.status == "1") {
      if (e.detail.value == '0') {
        console.log("已发布--项目设置");
        wx.navigateTo({
          url: '../editProject/editProject?type=edit&id=' + editingProject.id,
        })
      }
      else if (e.detail.value == '1') {
        console.log("已发布--编辑表格内容");
        //评分类跳转
        if (editingProject.type == 'p')
          wx.navigateTo({
            url: '../editPingfenChart/editPingfenChart?id=' + editingProject.id,
          })
        //投票类跳转
        else if (editingProject.type == 't')
          wx.navigateTo({
            url: '../editToupiaoChart/editToupiaoChart?id=' + editingProject.id,
          })
        //问卷类跳转
        else
          wx.navigateTo({
            url: '../editWenjuanChart/editWenjuanChart?id=' + editingProject.id,
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
              editingProject.status = 2;
              server.updateProject(editingProject).then(()=>{
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
              server.deleteProject(editingProject.id).then(() => {
                console.log('项目已删除')
                that.refreshList();
                //查看用户可维护的项目情况
                server.getProjectManage().then(data => {
                  that.setData({
                    projectManageInfo: data
                  })
                })
              })
            }
          }
        })
      }
    }
    //已开放评分--查看实时评分；终止评分；转发二维码
    else if (editingProject.status == "2") {
      if (e.detail.value == '0') {
        console.log("已开放评分--查看实时评分");
        wx.navigateTo({
          url: '../result/result?id=' + editingProject.id + "&status=" + editingProject.status,
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
              editingProject.status =9 ;
              server.updateProject(editingProject).then(() => {
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
          url: '../result/result?id=' + editingProject.id + "&status=" + editingProject.status,
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
    server.getProjectList("0,1,2").then(data => {
      //数据实时渲染
      that.setData({
        doingList: data.projectList
      });
    })
  },
  //显示拷贝项目提示框
  showCopyTip(e){
    var that=this;
    if (that.data.projectManageInfo.canAdd) {
      console.log('可以复制');
      that.setData({
        editingProject: e.currentTarget.dataset.project, //获取当前操作的项目
        copyTipShow:true
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '已达到最大项目个数，无法新增！',
        showCancel: false,
        confirmText: '确认'
      })
    }
  },
  //关闭复制提示框
  closeCopyTip(e){
    var that=this;
    that.setData({
      copyTipShow:false
    })
  },
  //复制该项目的评分内容，重置项目状态
  copy(e){
    var that=this;
    let editingProject = that.data.editingProject;//获取选中的项目，id其实没用，会新增
    editingProject.invite_code = e.detail.value["invite_code"];//赋值新的邀请码
    //输入框内容验证
    if (!that.WxValidate.checkForm(e.detail.value)) {
      const error = that.WxValidate.errorList[0]
      wx.showModal({
        content: error.msg,
        showCancel: false
      })
      return false
    }
    //发送新增项目请求
    server.copyProject(editingProject).then(function (data) {
      console.log("复制成功id=" + data.id);
      that.closeCopyTip();//关闭复制弹框
      that.refreshList();
      //查看用户可维护的项目情况
      server.getProjectManage().then(data => {
        that.setData({
          projectManageInfo: data
        })
      })
      
    })
  },
  //已完成的点击直接查看结果
  goResult:function(e){
    let editingProject = e.currentTarget.dataset.project;//获取当前操作的项目
    wx.navigateTo({
      url: '../result/result?id=' + editingProject.id + "&status=" + editingProject.status,
    })
  },
  //表单验证
  initValidate: function (e) {
    const rules = {
      invite_code: {
        required: true,
        minlength: 4
      }
    }
    const messages = {
      invite_code: {
        required: '请填写邀请码',
        minlength: '请填写不小于4位邀请码'
      }
    }
    this.WxValidate = new WxValidate(rules, messages);
  }
})