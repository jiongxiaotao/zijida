//logs.js
var server = require('../../utils/server.js')
var util = require('../../utils/util.js')
const app = getApp()
Page({
  data: {
    projectId:0,  //项目id
    navbar: ['设置评分项', '设置被评人'], //顶部导航
    currentTab: 0, //导航栏当前选中项
    subjectChart: [], //评分项表格
    voteeChart:[],//被评人表格
    totalScore:0,//所有评分项总分
    subjectEditShow: false, //修改时弹出评分项模态编辑框
    editSubject:{}, //当前编辑的评分项
    voteeEditShow:false, //
    editVotee: {}, //当前编辑的被评人
    editMode:'add' //编辑模式，新增/更新
    
  },
  onLoad: function (options) {
    var that=this;
    that.setData({
      projectId: options.id ? options.id : "0"
    })
    //根据项目编号查评分的所有评分项
    server.getSubjectList(app.globalData.loginCode,that.data.projectId).then(data=>{
      that.setData({
        subjectChart: data.subjectList,
        totalScore: data.totalScore
      })
    })
    //根据项目编号查评分的所有被评人
    server.getVoteeList(app.globalData.loginCode,that.data.projectId).then(data => {
      that.setData({
        voteeChart: data.voteeList
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
  },
  //点击某条弹出修改框
  openSubjectEdit:function(e) {
    var that=this;
    that.setData({
      editSubject: e.currentTarget.dataset.subject,
      subjectEditShow: true,
      editMode:'update' //修改
    });
  },
  //新增评分项
  addSubject(e){
    var that = this;
    that.setData({
      editSubject:{
        project_id:that.data.projectId
      },
      subjectEditShow: true,
      editMode:'add'  //新增
    });
  },
  //修改评分项内容提交后台
  saveSubject(e) {
    var that=this;
    var subject = that.data.editSubject;
    subject.name=e.detail.value["name"];
    subject.max_score = e.detail.value["max_score"];
    if(that.data.editMode=='add'){
      //新增评分项
      server.addSubject(app.globalData.loginCode,subject).then(function (data) {
        //从新查询并刷新页面
        server.getSubjectList(app.globalData.loginCode,that.data.projectId).then(data => {
          that.setData({
            subjectChart: data.subjectList,
            totalScore: data.totalScore
          })
          that.closeSubjectModel();
        })
      })
    }
    else{
      //更新该评分项
      server.updateSubject(app.globalData.loginCode,subject).then(function (data) {
        //从新查询并刷新页面
        server.getSubjectList(app.globalData.loginCode,that.data.projectId).then(data => {
          that.setData({
            subjectChart: data.subjectList,
            totalScore: data.totalScore
          })
          that.closeSubjectModel();
        })
      })
    }
    
  },
  //关闭修改评分项弹框，
  closeSubjectModel(e) {
    this.setData({
      subjectEditShow: false
    });
  },
  //删除评分项
  deleteSubject(e) {
    let subjectId = e.currentTarget.dataset.subject.id;
    server.deleteSubject(app.globalData.loginCode,subjectId).then(data=>{
      //从新查询并刷新页面
      server.getSubjectList(that.data.projectId).then(data => {
        that.setData({
          subjectChart: data.subjectList,
          totalScore: data.totalScore
        })
      })
    })
    
  },
  //点击某条弹出修改框
  openVoteeEdit: function (e) {
    var that = this;
    that.setData({
      editVotee: e.currentTarget.dataset.votee,
      voteeEditShow: true,
      editMode: 'update' //修改
    });
  },
  //新增被评人
  addVotee(e) {
    var that = this;
    that.setData({
      editVotee: {
        project_id: that.data.projectId
      },
      voteeEditShow: true,
      editMode: 'add' //修改
    });
  },
  //修改被评人内容提交后台
  saveVotee(e) {
    var that = this;
    var votee = that.data.editVotee;
    votee.name = e.detail.value["name"];
    //新增该被评人
    if(that.data.editMode=="add"){
      server.addVotee(app.globalData.loginCode,votee).then(function (data) {
        //从新查询并刷新页面
        server.getVoteeList(app.globalData.loginCode,that.data.projectId).then(data => {
          that.setData({
            voteeChart: data.voteeList
          })
          that.closeVoteeModel();
        })
      })
    }
    else{
      //更新该被评人
      server.updateVotee(app.globalData.loginCode,votee).then(function (data) {
        //从新查询并刷新页面
        server.getVoteeList(app.globalData.loginCode,that.data.projectId).then(data => {
          that.setData({
            voteeChart: data.voteeList
          })
          that.closeVoteeModel();
        })
      })
    }
    
  },
  //关闭修改被评人弹框，
  closeVoteeModel(e) {
    this.setData({
      voteeEditShow: false
    });
  },
  //删除被评人
  deleteVotee(e) {
    let voteeId = e.currentTarget.dataset.votee.id;
    server.deleteVotee(app.globalData.loginCode,voteeId).then(data => {
      //从新查询并刷新页面
      server.getVoteeList(app.globalData.loginCode,that.data.projectId).then(data => {
        that.setData({
          voteeChart: data.voteeList
        })
      })
    })
  },
  //设置完成，退回到项目列表,url一定要用绝对路径
  settingDone(e){
    var that=this;
    if(that.data.voteeChart.length==0)
      wx.showModal({
        title: '提示',
        content: '暂未设置被评人，后续可以通过“编辑评分内容”添加，确认完成设置？',
        showCancel: true,
        cancelText: "取消",
        confirmText: '确认',
        success: function (res) {
          if (res.confirm) {
            util.navigateBack({
              url: 'pages/projectManage/projectManage',
            })
          }
        }
      })
    else if (that.data.subjectChart.length == 0)
      wx.showModal({
        title: '提示',
        content: '暂未设置评分项，后续可以通过“编辑评分内容”添加，确认完成设置？',
        showCancel: true,
        cancelText: "取消",
        confirmText: '确认',
        success: function (res) {
          if (res.confirm) {
            util.navigateBack({
              url: 'pages/projectManage/projectManage',
            })
          }
        }
      })
  }
})
