//logs.js
var server = require('../../utils/server.js')
var util = require('../../utils/util.js')
import WxValidate from '../../utils/WxValidate.js'
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
    editMode:'add', //编辑模式，新增/更新
    inputIndex0:true,//输入框焦点索引
    inputIndex1: false   //输入框焦点索引
  },
  onLoad: function (options) {
    var that=this;
    that.setData({
      projectId: options.id ? options.id : "0"
    })
    //根据项目编号查评分的所有评分项
    server.getSubjectList(that.data.projectId).then(data=>{
      that.setData({
        subjectChart: data.subjectList,
        totalScore: data.totalScore
      })
    })
    //根据项目编号查评分的所有被评人
    server.getVoteeList(that.data.projectId).then(data => {
      that.setData({
        voteeChart: data.voteeList
      })
    })
    //初始化表单验证规则
    that.initValidate();
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
    //输入框内容验证
    if (!that.subjectValidate.checkForm(e.detail.value)) {
      const error = that.subjectValidate.errorList[0]
      wx.showModal({
        content: error.msg,
        showCancel: false
      })
      return false
    }
    if(that.data.editMode=='add'){
      //新增评分项
      server.addSubject(subject).then(function (data) {
        //从新查询并刷新页面
        server.getSubjectList(that.data.projectId).then(data => {
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
      server.updateSubject(subject).then(function (data) {
        //从新查询并刷新页面
        server.getSubjectList(that.data.projectId).then(data => {
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
    var that=this;
    let subjectId = e.currentTarget.dataset.subject.id;
    server.deleteSubject(subjectId).then(data=>{
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
    //输入框内容验证
    if (!that.voteeValidate.checkForm(e.detail.value)) {
      const error = that.voteeValidate.errorList[0]
      wx.showModal({
        content: error.msg,
        showCancel: false
      })
      return false
    }
    //新增该被评人
    if(that.data.editMode=="add"){
      server.addVotee(votee).then(function (data) {
        //从新查询并刷新页面
        server.getVoteeList(that.data.projectId).then(data => {
          that.setData({
            voteeChart: data.voteeList
          })
          that.closeVoteeModel();
        })
      })
    }
    else{
      //更新该被评人
      server.updateVotee(votee).then(function (data) {
        //从新查询并刷新页面
        server.getVoteeList(that.data.projectId).then(data => {
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
    var that=this;
    let voteeId = e.currentTarget.dataset.votee.id;
    server.deleteVotee(voteeId).then(data => {
      //从新查询并刷新页面
      server.getVoteeList(that.data.projectId).then(data => {
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
    else
      util.navigateBack({
        url: 'pages/projectManage/projectManage',
      })
  },
  //某号输入框完成后，当前失焦，下个聚焦
  inputConfirm: function (e) {
    var that = this;
    let inputIndex = e.currentTarget.dataset.index;
    if (inputIndex == 0) {
      that.setData({
        inputIndex0: false,
        inputIndex1: true,
      })
    }
  },
  //表单验证
  initValidate: function (e) {
    //subject验证规则
    const subjectRules = {
      name: {
        required: true
      },
      max_score: {
        required: true,
        number: true,
        max:65535
      }
    }
    const subjectMessages = {
      name: {
        required: '请填写评分项名称'
      },
      max_score: {
        required: '请填写评分项分值',
        number: '请填写数字',
        max:'数值超限'
      }
    }
    this.subjectValidate = new WxValidate(subjectRules, subjectMessages);
    
    //votee验证规则
    const voteeRules = {
      name: {
        required: true
      }
    }
    const voteeMessages = {
      name: {
        required: '请填写被评人名称'
      }
    }
    this.voteeValidate = new WxValidate(voteeRules, voteeMessages);
  }
})
