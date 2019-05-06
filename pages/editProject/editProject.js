var server = require('../../utils/server.js')
import WxValidate from '../../utils/WxValidate.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editType: "add",
    curProject: {
      id: "",
      name: "",
      invite_code: "",
      amount: ""
    },
    inputIndex0: true,
    inputIndex1: false,
    inputIndex2: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options);
    that.setData({
      editType: options.type ? options.type : "add"
    })
    //如果是修改，就要从storage获取curProject
    if (that.data.editType == "edit") {
      that.setData({
        curProject: wx.getStorageSync("curProject")
      })
    }
    //初始化表单验证规则
    that.initValidate();
  },
  /**
   * 生命周期函数--页面展示时，包括页面栈退回到当前页
   */
  onShow: function () {

  },
  save: function (e) {
    var that = this;
    var curProject=that.data.curProject;
    curProject.name = e.detail.value["name"];
    curProject.invite_code = e.detail.value["invite_code"];
    curProject.amount = e.detail.value["amount"];
    //输入框内容验证
    if (!that.WxValidate.checkForm(e.detail.value)) {
      const error = that.WxValidate.errorList[0]
      wx.showModal({
        content: error.msg,
        showCancel: false
      })
      return false
    }
    //更新
    if (that.data.editType == "edit") {
      server.updateProject(app.globalData.loginCode,curProject).then(function (data) {
        console.log("更新成功id=" + data.id);
        wx.navigateBack({
          url: '../projectManage/projectManage',
        })
      })
    }
    //新增的，自动跳到编辑评分表格页，如果未编辑，在项目管理页该条状态为未发布仍可编辑
    else {
      server.addProject(app.globalData.loginCode,curProject).then(function (data) {
        console.log("新增成功id=" + data.id);
          wx.redirectTo({
            url: '../editChart/editChart?id=' + data.id,
          })
        })
    }
  },
  //某号输入框完成后，当前失焦，下个聚焦
  inputConfirm: function (e) {
    var that = this;
    let inputIndex = e.currentTarget.dataset.index;
    if (inputIndex == 0) {
      that.setData({
        inputIndex0: false,
        inputIndex1: true,
        inputIndex2: false
      })
    }
    else if (inputIndex == 1) {
      that.setData({
        inputIndex0: false,
        inputIndex1: false,
        inputIndex2: true
      })
    }
  },
  //表单验证
  initValidate:function(e){
    const rules = {
      name: {
        required: true,
        minlength: 2
      },
      invite_code: {
        required: true,
        minlength: 4
      },
      amount: {
        required: true,
        number: true
      }
    }
    const messages = {
      name: {
        required: '请填写姓名',
        minlength: '请输入正确的名称'
      },
      invite_code: {
        required: '请填写邀请码',
        minlength: '请填写不小于4位邀请码'
      },
      amount: {
        required: '请填写预期收集数量',
        number: '请填写数字'
      }
    }
    this.WxValidate = new WxValidate(rules, messages);
  }
})