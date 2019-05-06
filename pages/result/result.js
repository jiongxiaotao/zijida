//logs.js
var server = require('../../utils/server.js')
var util = require('../../utils/util.js')
import * as echarts from '../../utils/ec-canvas/echarts';
let chart = null;

const app = getApp()
Page({
  data: {
    projectId:"0",  //项目id
    resultList:[],//被评人表格
    doneAmount:0,//已收集评分个数
    amount:10,//总共需要收集评分个数
    percent:0,//进度百分比
    totalScore:0,//所有评分项总分
    resultDetailShow: false, //修改时弹出评分项模态编辑框
    curResult:{}, //当前编辑的评分项
    ecBar: {  //echart 柱状图
      lazyLoad: true // 延迟加载
    },
    improveHidden: false,//高级查看按钮隐藏
    stopProjectDisable:false,//终止项目按钮不可用
    stopProjectHidden: false //终止项目按钮隐藏
  },
  onLoad: function (options) {
    var that=this;
    that.setData({
      projectId: options.id ? options.id : "0"
    })
    //如果是已终止的项目，终止评分按钮不显示
    if (options.status && options.status=="9"){
      that.setData({
        stopProjectHidden: true
      })
    }
    //如果是客户查看，没有高级和终止评分按钮
    if(options.fromUser=='cust'){
      that.setData({
        improveHidden:true,
        stopProjectHidden: true
      })
    }
    //根据项目编号查评分的所有评分项
    server.getResult(app.globalData.loginCode,that.data.projectId).then(data=>{
      that.setData({
        resultList: data.results,
        totalScore: data.totalScore,
        doneAmount: data.doneAmount,
        amount:data.amount,
        percent:parseInt(data.doneAmount / data.amount*100)
      })
    })
  },
  //点击某条弹出修改框
  openResultDetail:function(e) {
    var that=this;
    that.setData({
      resultDetailShow: true
    });
    that.setChart(e.currentTarget.dataset.result);
  },
  //渲染echart
  setChart(result){
    var that=this;
    var names=[];//标题
    var scores=[];//分数
    var leftScores = [];//每项的总分减去当前得分
    result.subjects=result.subjects.reverse();
    for (let i =0; i < result.subjects.length;i++){
      names.push(result.subjects[i].name);
      scores.push(result.subjects[i].score);
      leftScores.push((result.subjects[i].max_score > result.subjects[i].score) ? (result.subjects[i].max_score - result.subjects[i].score):0)
    }
    that.barComponent = that.selectComponent('#barResult');
    that.barComponent.init((canvas, width, height) => {
      // 初始化图表
      const barChart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      barChart.setOption({
        color: ['#37a2da', 'rgba(80,160,255,0.4)'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: function(params){
            return "得分:"+params[0].value;
          }
        },
        legend: {
          data: ['得分','']
        },
        grid: {
          left: 20,
          right: 30,
          bottom: 15,
          top: 40,
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            },
            axisLabel: {
              color: 'black'
            }
          }
        ],
        yAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data:names,
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            },
            axisLabel: {
              color: 'black'
            }
          }
        ],
        series: [
          {
            name: '得分',
            type: 'bar',
            stack: 'one',
            label: {
              show:false,
              normal: {
                show: true,
                position: 'inside',
                color: 'white',
                formatter:function(e){
                  const idx=e.dataIndex;
                  return e.data + "/" + result.subjects[idx].max_score;
                }
              }
            },
            data: scores
          },
          {
            name: '',
            type: 'bar',
            stack: 'one',
            data: leftScores
          }
        ]
      });
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return barChart;
    });
  },
  //关闭修改评分项弹框，
  closeResultDetail(e) {
    this.setData({
      resultDetailShow: false
    });
  },
  //高级查看
  improve(e){
    wx.showModal({
      title: '提示',
      content: '敬请期待！',
      showCancel: false,
      confirmText: '确认',
      
    })
  },
  //终止评分
  stopProject(e){
    var that=this;
    wx.showModal({
      title: '提示',
      content: '终止评分后将不接收其他用户的打分结果，本项目结束，确认终止？',
      showCancel: true,
      cancelText: "取消",
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          console.log('项目终止评分')
          let project={
            id:that.data.projectId,
            status:"9"
          }
          server.updateProject(project).then(() => {
            console.log('更新为终止评分状态');
            //设置按钮不可用
            that.setData({  
              stopProjectDisable:true
            })
          })
        }
      }
    })
  }
 
})
