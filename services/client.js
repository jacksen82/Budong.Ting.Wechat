// services/client.js

const constants = require('../data/constants.js')
const store = require('../data/store.js')
const ajax = require('../utils/ajax.js')
const friend = require('friend.js')
const question = require('question.js')
const comment = require('comment.js')

const client = {

  /*
    说明：客户端授权调起
  */
  authorize: function (callback) {

    if (constants.APP_3RD_SESSION) {
      wx.checkSession({
        success: function (res) {
          
          client.token(callback);
        },
        fail: function (res) {

          client.login(callback);
        }
      });
    } else {
      client.login(callback);
    }
  },

  /*
    说明：客户端授权
  */
  token: function (callback) {

    ajax.post('/client/token.ashx', {

    }, function (data) {
      
      if (data.code == 0 && data.data && data.data.session3rd) {
        data = data.data || {};
        store.auth(data.session3rd, data.client);
        client.getShareInfo();
        callback(data);
      } else {
        client.login(callback);
      }
    });
  },

  /*
    说明：客户端登录
  */
  login: function (callback) {

    wx.login({
      success: function (res) {

        ajax.post('/client/login.ashx', {
          code: res.code
        }, function (data) {
          
          if (data.code == 0) {
            data = data.data || {};
            store.auth(data.session3rd, data.client);
            client.getShareInfo();
            callback(data);
          } else {
            wx.showToast({
              icon: 'none',
              title: (data.message || {}).errMsg || '网络错误'
            })
          }
        });
      },
      fail: function (res) {

        wx.showToast({
          icon: 'none',
          title: '登录失败'
        })
      }
    });
  },

  /*
    说明：获取用户信息
  */
  detail: function (callback) {

    ajax.post('/client/detail.ashx', {
    }, function (data) {

      if (data.code == 0) {
        data = data.data || {};
        store.client = data.client || {};
        callback(data);
      } else {
        wx.showToast({
          icon: 'none',
          title: data.message
        })
      }
    });
  },

  /*
    说明：更新用户信息
  */
  setUserInfo: function (userInfo, callback) {

    ajax.post('/client/setuserinfo.ashx', {
      nick: userInfo.nickName || '',
      gender: userInfo.gender || 0,
      avatarUrl: userInfo.avatarUrl || ''
    }, function (data) {

      if (data.code == 0) {
        data = data.data || {};
        store.client = data.client || {};
        callback(data);
      } else {
        wx.showToast({
          icon: 'none',
          title: data.message
        })
      }
    });
  },

  /*
    说明：获取分享信息
  */
  getShareInfo: function () {

    if (constants.APP_QUERY_CID) {
      if (constants.APP_SHARETICKET) {
        wx.getShareInfo({
          shareTicket: constants.APP_SHARETICKET,
          success: function (res) {

            client.relate(constants.APP_QUERY_CID, res.encryptedData, res.iv);
          },
          fail: function (res) {

            wx.showToast({
              icon: 'none',
              title: res.message
            })
          }
        });
      } else {
        client.relate(constants.APP_QUERY_CID, '', '');
      }
    }
  },

  /*
    说明：建立关联关系
  */
  relate: function (relateClientId, encrypteData, iv) {

    ajax.post('/client/relate.ashx', {
      relateClientId: relateClientId || 0,
      encryptedData: encrypteData || '',
      iv: iv || ''
    }, function (data) {

    });
  },

  /*
    说明：分享回调
  */
  shareAppMessage: function (res, data, callback) {

    data = data || {};
    
    return {
      title: '简单回答几道题，来测一测你是那种性格类型',
      imageUrl: 'https://wechat.duomijuan.com/augury/share.jpg',
      path: '/pages/index/index?scene=cid-' + (store.client.id || 0),
      success: function (_res) {

        client.share(res.from, data.capsuleId, callback);
      },
      fail: function (res) {

        wx.showToast({
          icon: 'none',
          title: '放弃一次了解朋友的机会'
        })
      }
    }
  },

  /*
    说明：分享回调 [ 成功/失败 ]
  */
  share: function (shareFrom, capsuleId, callback) {

    ajax.post('/client/share.ashx', {
      shareFrom: shareFrom
    }, function (data) {

      if (data.code == 0) {
        callback(data.data || {});
      } else {
        wx.showToast({
          icon: 'none',
          title: (data.message || {}).errMsg || '网络错误'
        })
      }
    });
  },

  /*
    说明：好友相关接口
  */
  friend: friend,

  /*
    说明：题目相关接口
  */
  question: question,

  /*
    说明：评价相关接口
  */
  comment: comment
};

module.exports = client;