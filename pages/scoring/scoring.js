//logs.js
var server = require('../../utils/server.js')
var util = require('../../utils/util.js')
import WxValidate from '../../utils/WxValidate.js'
const app = getApp()
Page({
  data: {
    projectId: 0,  //项目id
    projectEditable:true,//项目状态是否可以评分
    totalScore: 0,//所有评分项总分
    voteeList: [],//被评人及当前评分表格
    subjectList:[], //评分项列表，用于初始化单人评分表
    curScoring:{},//当前操作的被评人情况
    scoreSheet: [],//单人评分表
    scoringDetailShow: false //修改时弹出评分项模态编辑框
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      projectId: options.id ? options.id :0,
      projectEditable: options.status==2? true:false
    })
    //根据项目编号查评分的所有被评人，初始化当前用户给他打的分数
    server.getVoteeList(app.globalData.loginCode,that.data.projectId).then(voteeData => {
      //加载本地缓存，显示个人评分情况
      var voteeList=voteeData.voteeList;
     
      for(let i=0;i<voteeList.length;i++){
        voteeList[i].totalScore = 0; // 初始分数为0
        voteeList[i].scoreClass = 'red'; //初始标红，未打过分
        const key = "custscoresheet_" + that.data.projectId + "_" + voteeList[i].id;//custScoreSheet_projectId_voteeId 作为storage的key
        var custScoreSheet = wx.getStorageSync(key);
        //缓存中有，打过分
        if (custScoreSheet) {
          voteeList[i].scoreClass = ''; //不标红，打过分
          for (let j = 0; j < custScoreSheet.length;j++){
            voteeList[i].totalScore += custScoreSheet[j].score ? parseInt( custScoreSheet[j].score):0; //累加每项分数,默认为空的话加0分
          }
        }
      }
      that.setData({
        voteeList: voteeList
      })
    })
    //获取所有评分项，初始化每项分数
    server.getSubjectList(app.globalData.loginCode,that.data.projectId).then(subjectData => {
      var subjectList = subjectData.subjectList;
      that.setData({
        subjectList: subjectList,
        totalScore: subjectData.totalScore
      })
      //表单校验
      that.initValidate();
    })
    
    //判断项目状态如果不为开放评分，则操作和提交不可用

  },
  //点击某条弹出修改框
  openScoreSheet: function (e) {
    var that = this;
    var scoreSheet=that.data.subjectList;//初始化评分表
    const voteeId = e.currentTarget.dataset.scoring.id;//当前选中的被评人id
    //从缓存读取当前选中的人是否打分过
    
    const key ="custscoresheet_"+ that.data.projectId + "_" + voteeId;//projectId_voteeId 作为storage的key
    var custScoreSheet = wx.getStorageSync(key);
    if (custScoreSheet) {
      scoreSheet = custScoreSheet;
    }
    that.setData({
      curScoring:e.currentTarget.dataset.scoring,
      scoreSheet: scoreSheet,
      scoringDetailShow: true
    });
    
  },
  //给某被评人评分点击保存
  saveScoreSheet(e){
    var that=this;
    const voteeId = that.data.curScoring.id;//当前选中的被评人id
    const key = that.data.projectId + "_" + voteeId;//projectId_voteeId 作为storage的key
   
    //输入框内容验证
    if (!that.WxValidate.checkForm(e.detail.value)) {
      const error = that.WxValidate.errorList[0]
      wx.showModal({
        content: error.msg,
        showCancel: false
      })
      return false
    }
    let flag=true; // 表格校验
    var scoreSheet = that.data.scoreSheet;
    //缓存已有，直接修改
    for (let i = 0; i < scoreSheet.length;i++){
      const name = "subject_" + scoreSheet[i].id;
      if (parseInt(e.detail.value[name]) > parseFloat(scoreSheet[i].max_score)){
        wx.showModal({
          title: '提示',
          content: scoreSheet[i].name + ' 评分不可超过满分' + scoreSheet[i].max_score,
          showCancel: false,
          confirmText: '确认',
        })
        flag=false;
        break;
      }
      //打分分值满足要求
      else{
        scoreSheet[i].score = e.detail.value[name];
      }
    }
    
    //各数据校验通过
    if(flag){
      //更新该被评人得分
      var voteeList = that.data.voteeList;
      for (let i = 0; i < voteeList.length; i++) {
        //刚刚修改，打过分
        if (voteeList[i].id == that.data.curScoring.id) {
          voteeList[i].scoreClass = ''; //不标红，打过分
          voteeList[i].totalScore = 0; //从新统计分数
          for (let j = 0; j < scoreSheet.length; j++) {
            voteeList[i].totalScore += scoreSheet[j].score ? parseInt(scoreSheet[j].score) : 0; //累加每项分数,默认为空的话加0分
          }
        }
      }
      that.setData({
        voteeList: voteeList,
        scoreSheet: scoreSheet
      })

      //缓存到storage
      const key = "custscoresheet_" + that.data.projectId + "_" + voteeId;//projectId_voteeId 作为storage的key
      wx.setStorageSync(key, scoreSheet);
      //保存成功，关闭窗口
      that.closeScoreSheet();
    }
    
  },
  //关闭修改评分项弹框，
  closeScoreSheet(e) {
    this.setData({
      scoringDetailShow: false
    });
  },
  //从storage里组装一个项目的所有评分
  getAllScoreSheetInStorage(e){
    var that=this;
    var allScoreSheet=[];
    for(let i=0;i<that.data.voteeList.length;i++){
      var scoreSheet=wx.getStorageSync("custscoresheet_" + that.data.projectId + "_" + that.data.voteeList[i].id);
      for (let j = 0; j < scoreSheet.length;j++){
        var tempScore={
          subject_id: scoreSheet[j].id,
          votee_id: that.data.voteeList[i].id,
          score: scoreSheet[j].score
        }
        allScoreSheet.push(tempScore);
      }
    }
    return allScoreSheet;
  },
  //提交评分
  submitScoring(e) {
    var that = this;
    let notScoringCount=0;//未打分个人
    for (let i = 0; i < that.data.voteeList.length;i++){
      if (that.data.voteeList[i].totalScore==0){
        notScoringCount+=1;
      }
    }
    //还有被评人没评分
    if (notScoringCount>0){
      wx.showModal({
        title: '提示',
        content: '您还有'+notScoringCount+'个被评人未评分，请继续评分!',
        showCancel: false,
        confirmText: '确认'
      })
    }
    else{
      wx.showModal({
        title: '提示',
        content: '提交评分后不可修改，确认提交？',
        showCancel: true,
        cancelText: "取消",
        confirmText: '确认',
        success: function (res) {
          if (res.confirm) {
            console.log('提交评分')
            server.submitProjectScore(app.globalData.loginCode, that.data.projectId, that.getAllScoreSheetInStorage()).then(() => {
              console.log('已提交评分');
              //清空每个scoresheet的storage缓存
              for(var i=0;i<that.data.voteeList.length;i++){
                wx.removeStorageSync("custscoresheet_" + that.data.projectId + "_" + that.data.voteeList[i].id);
              }
              //跳到查看结果页面
              wx.redirectTo({
                url: '../result/result?id=' + that.data.projectId + "&fromUser=cust&toPage=index",
              })
            })
          }
        }
      })
    }
    
  },
  //表单验证
  initValidate: function () {
    var that=this;
    var rules = {};
    var messages={};
    for(var i=0;i<that.data.subjectList.length;i++){
      let key="subject_"+that.data.subjectList[i].id;
      rules[key]={
        required:true,
        number:true
      }
      messages[key]={
        required: that.data.subjectList[i].name+ '请打分',
        number: '请填写数字'
      }
    }
    this.WxValidate = new WxValidate(rules, messages);
  }

})
