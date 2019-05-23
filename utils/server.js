var util = require('util.js');
var config = require('config.js');
var encrypt = require('encrypt.js')
const app = getApp()
//获取unionId
function getOpenId(code,) {
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "code2Session?appId=" + config.appId + "&jsCode=" + code + "&secret=" + config.appSecret,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data.api_result);
        }
        else {
          wx.showModal({
            title: '错误',
            content: '获取openId失败，暂不可用!!!',
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:获取用户编号',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//查询用户信息
function queryUserInfo(loginCode) {
  loginCode = encodeURIComponent(loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "miniQueryUserInfo?loginCode=" +  loginCode,
      success: data => {
        console.log("查询用户信息正常"+JSON.stringify(data));
        //返回的userInfoList有数据
        if (data.BK_STATUS == "00") {
          resolve(data);
        }
        else{
          reject(data);
        }
      },
      fail: data =>{
        reject();
        // console.log("查询用户信息失败" + JSON.stringify(data));
        // wx.showModal({
        //   title: '错误',
        //   content: '系统暂不可用:查询用户信息',
        //   showCancel: false,
        //   confirmText: '确认'
        // })
      }
    })
  })
}
//保存用户信息
function updateUserInfo(loginCode,jsonData, succ) {
  loginCode = encodeURIComponent(loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "miniSaveUserInfo?loginCode=" +loginCode,
      method:"POST",
      data: jsonData,
      success: data => {
        // 拿到自己后台传过来的数据，自己作处理
        if(data.BK_STATUS=="00")
          resolve(data);
        else{
          wx.showModal({
            title: '错误',
            content: data.BK_DESC_DETAIL != undefined ? data.BK_DESC_DETAIL : data.BK_DESC,
            showCancel: false,
            confirmText: '确认'
          })
        }
      },
      fail: data => {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:保存用户信息',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//腾讯生成签名
function frSign(succ) {
  return new Promise((resolve, reject) => {
    util.ajax({
      data: {
        _fw_service_id: "miniFRSign",
        jsonData:{}
      },
      success: data => {
        // 拿到自己后台传过来的数据，自己作处理
        if (data.BK_STATUS == "00")
          succ && succ(data);
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC_DATAIL != undefined ? data.BK_DESC_DATAIL : data.BK_DESC,
            showCancel: false,
            confirmText: '确认'
          })
        }
      },
      fail: data => {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:生成签名',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//获取百度活体检测语音识别码
function getBaiduFRSessionCode(){
  return new Promise((resolve, reject) => {
    var that=this;
    util.ajax({
      data: {
        _fw_service_id: 'miniVideoSessioncode'
      },
      success: function (data) {
        if (data && data.BK_STATUS == "00") {
          resolve(data)
        } else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC_DETAIL != undefined ? data.BK_DESC_DETAIL : data.BK_DESC,
            showCancel: false,
            confirmText: '确认'
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '错误',
          content: '获取百度语音校验码失败失败!!!',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//获取百度视频活体检测结果
function getBaiduFRResult(sessionCode,videoPath) {
  return new Promise((resolve, reject) => {
    var that = this;
    util.ajax({
      data: {
        _fw_service_id: 'miniVideoFaceliveness',
        jsonData:{
          "sessionId":sessionCode,
          "video":videoPath
        }
      },
      success: function (data) {
        if (data && data.BK_STATUS == "00") {
          resolve(data)
        } else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC_DETAIL != undefined ? data.BK_DESC_DETAIL : data.BK_DESC,
            showCancel: false,
            confirmText: '确认'
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '错误',
          content: '获取百度语音校验码失败失败!!!',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}

//查询本人负责的项目列表 queryProjectList
function getProjectList(statusList) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url:"getProjectList?loginCode="+loginCode+"&statusList="+statusList,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:查询项目列表',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//新增评分项目 addProject
function addProject(project) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "addProject?loginCode=" + loginCode,
      method:"POST",
      data:JSON.stringify(project),
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:新增项目',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })

  })
}
//更新评分项目 updateProject
function updateProject(project) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "updateProject?loginCode=" + loginCode,
      method: "POST",
      data: project,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:更新项目',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })

  })
}
//删除评分项目 deleteProject
function deleteProject(projectId) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "deleteProject?loginCode=" + loginCode + "&projectId=" + projectId,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:删除项目',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })

  })
}
//获取管理员最多可以负责多少个项目
function getProjectManage(){
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "getProjectManage?loginCode=" + loginCode,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:获取项目管理',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })

  })
}
//复制项目 连同项目的评分项+被评人
function copyProject(project) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "copyProject?loginCode=" + loginCode,
      method: "POST",
      data: JSON.stringify(project),
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:复制项目',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })

  })
}
//查询某项目的评分项
function getSubjectList(projectId) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "getSubjectList?loginCode=" + loginCode + "&projectId=" + projectId,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:获取评分项列表',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//更新某项目的某评分项
function addSubject(subject) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "addSubject?loginCode=" + loginCode,
      method: "POST",
      data: subject,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:新增评分项',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//更新某项目的某评分项
function updateSubject(subject) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "updateSubject?loginCode=" + loginCode,
      method: "POST",
      data: subject,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:更新评分项',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//删除评分项 deleteSubject
function deleteSubject(subjectId) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "deleteSubject?loginCode=" + loginCode + "&subjectId=" + subjectId,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:删除评分项',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })

  })
}
//查询某项目的被评人
function getVoteeList(projectId) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "getVoteeList?loginCode=" + loginCode + "&projectId=" + projectId,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:获取被评人列表',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//新增某项目的被评人
function addVotee(votee) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "addVotee?loginCode=" + loginCode,
      method: "POST",
      data: votee,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:新增被评人',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//更新某项目的被评人
function updateVotee(votee) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "updateVotee?loginCode=" + loginCode,
      method: "POST",
      data: votee,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:更新被评人',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//删除被评人 deleteVotee
function deleteVotee(voteeId) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "deleteVotee?loginCode=" + loginCode + "&voteeId=" + voteeId,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:删除被评人',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//根据邀请码查询项目状态
function getProjectByInviteCode(inviteCode){
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve,reject)=>{
    util.ajax({
      url: "getProjectByInviteCode?loginCode=" + loginCode + "&inviteCode=" + inviteCode,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:查询项目详情',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//提交某项目的所有评分
function submitProjectScore(projectId,scoreList){
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "submitProjectScore?loginCode=" + loginCode + "&projectId=" + projectId,
      method:"POST",
      data:scoreList,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:提交评分',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
//查询某项目的评分结果（包括实时）
function getResult(projectId) {
  const loginCode = encodeURIComponent(getApp().globalData.loginCode); //编码
  return new Promise((resolve, reject) => {
    util.ajax({
      url: "getResult?loginCode=" + loginCode + "&projectId=" + projectId,
      success: function (data) {
        if (data.BK_STATUS == "00") {
          console.log(data);
          resolve(data);
        }
        else {
          wx.showModal({
            title: '错误',
            content: data.BK_DESC,
            showCancel: false,
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                console.log('该退出的！')
              }
            }
          })
        }
      },
      fail: function (data) {
        wx.showModal({
          title: '错误',
          content: '系统暂不可用:查询评分结果',
          showCancel: false,
          confirmText: '确认'
        })
      }
    })
  })
}
module.exports = {
  getOpenId: getOpenId,
  updateUserInfo: updateUserInfo,
  queryUserInfo: queryUserInfo,
  frSign: frSign,
  getBaiduFRSessionCode: getBaiduFRSessionCode,
  getBaiduFRResult: getBaiduFRResult,
  getProjectList: getProjectList,
  addProject: addProject,
  updateProject: updateProject,
  deleteProject: deleteProject,
  getProjectManage: getProjectManage,
  copyProject: copyProject,
  getSubjectList: getSubjectList,
  addSubject: addSubject,
  updateSubject: updateSubject,
  deleteSubject:deleteSubject,
  getVoteeList: getVoteeList,
  addVotee: addVotee,
  updateVotee: updateVotee,
  deleteVotee: deleteVotee,
  getProjectByInviteCode:getProjectByInviteCode,
  submitProjectScore: submitProjectScore,
  getResult: getResult

}
