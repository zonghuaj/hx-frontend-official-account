<template>
  <div class="content">
    <div class="user">
      <div class="user-first">
        <van-image class="user-first-left" :src="user.headImgUrl" round />
        <div class="user-first-right">
          <span class="user-first-right-up">{{ user.nickName }}</span>
          <span class="user-first-right-down">未绑定手机</span>
        </div>
      </div>
      <div class="user-second">
        <span>{{ user.userCode }}</span>
        <span>{{ user.subscribedDate }}</span>
        <span>{{ user.bindHouseCount }}</span>
      </div>
      <div class="user-third">
        <span>用户编号</span>
        <span>关注日期</span>
        <span>已绑定房间数</span>
      </div>
    </div>
    <div class="business">
      <div class="business-row">
        <div class="business-column" @click="goOrderList">
          <img class="business-column-up" src="@/assets/icon/personal_icon_db.png" />
          <span class="business-column-down">待办业务</span>
        </div>
        <div class="business-column" @click="goHistoryOrderList">
          <img class="business-column-up" src="@/assets/icon/personal_icon_wj.png" />
          <span class="business-column-down">完结业务</span>
        </div>
        <div class="business-column" @click="goHouseList">
          <img class="business-column-up" src="@/assets/icon/personal_icon_house.png" />
          <span class="business-column-down">房屋列表</span>
        </div>
        <div class="business-column" @click="goInvoiceList">
          <img class="business-column-up" src="@/assets/icon/personal_icon_fp.png" />
          <span class="business-column-down">发票查询</span>
        </div>
      </div>
      <div class="business-row">
        <div class="business-column" @click="goInvoiceTitleList">
          <img class="business-column-up" src="@/assets/icon/personal_icon_tt.png" />
          <span class="business-column-down">发票抬头</span>
        </div>
        <div class="business-column" @click="unable">
          <el-badge :value="notice.company" :max="99">
            <img class="business-column-up" src="@/assets/icon/personal_icon_gg.png" />
          </el-badge>
          <span class="business-column-down">公司公告</span>
        </div>
        <div class="business-column" @click="unable">
          <el-badge :value="notice.system" :max="99">
            <img class="business-column-up" src="@/assets/icon/personal_icon_xt.png" />
          </el-badge>
          <span class="business-column-down">系统通知</span>
        </div>
        <div class="business-column" @click="unable">
          <img class="business-column-up" src="@/assets/icon/personal_icon_gx.png" />
          <span class="business-column-down">关联账户</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JSSDKLoader from '@/assets/js/WeChat.js';
import wxApi from '@/api/wx';
import profileApi from '@/api/profile';

export default {
  name: 'Profile',
  components: {
  },
  data () {
    return {
      user: {},
      notice: {}
    };
  },
  beforeMount: function () {
    this.initPage();
  },
  mounted: function () {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }
  },
  destroyed: function () {
    window.removeEventListener('popstate', this.goBack, false);
  },
  methods: {
    goBack: function () {
      history.pushState(null, null, document.URL);
      JSSDKLoader().then(wx => {
        const url = location.href.split('#')[0];
        const params = {
          url: url
        };
        wxApi.getSignature(params).then(result => {
          if (result.status === 1) {
            wx.config({
              debug: false,
              appId: result.data.appId, // 必填，公众号的唯一标识
              timestamp: result.data.timestamp, // 必填，生成签名的时间戳
              nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
              signature: result.data.signature, // 必填，签名
              jsApiList: ['closeWindow'] // 必填，需要使用的JS接口列表
            });
            wx.ready(function () {
              wx.closeWindow();
            });
            wx.error(function (res) {
              alert(JSON.stringify(res));
            });
          } else {
            this.$toast(result.data.message);
          }
        });
      });
    },
    initPage: function () {
      profileApi.getUser().then(result => {
        if (result.status === 1) {
          const user = result.data;
          // 头像
          if (!user.headImgUrl) {
            user.headImgUrl = require('@/assets/icon/touxiang.png');
          }
          // 关注日期
          if (user.subscribedTime) {
            user.subscribedDate = user.subscribedTime.substring(0, 10);
          }
          this.user = user;
        } else {
          this.$toast(result.data.message);
        }
      });
      profileApi.getNotice().then(result => {
        if (result.status === 1) {
          this.notice = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    // 待办业务
    goOrderList: function () {
      this.$router.push({
        name: 'orderList'
      });
    },
    // 完结业务
    goHistoryOrderList: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'historyOrderList'
        }
      });
    },
    // 房屋列表
    goHouseList: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'houseList'
        }
      });
    },
    // 发票查询
    goInvoiceList: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'invoiceList'
        }
      });
    },
    // 发票抬头
    goInvoiceTitleList: function () {
      this.$router.push({
        name: 'invoiceTitleList'
      });
    },
    unable: function () {
      this.$toast('该功能正在开发，敬请期待。');
    }
  }
};
</script>

<style scoped>
.content {
  width: 750px;
  background: #f4f5fa url(../assets/icon/personal_bj.png) no-repeat top center;
  background-size: 750px 278px;
  padding: 0 30px;
  display: flex;
  flex-direction: column;
}

.user {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  margin-top: 30px;
}

.user-first {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.user-first-left {
  width: 128px;
  height: 128px;
}

.user-first-right {
  margin-left: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.user-first-right-up {
  font-size: 32px;
  color: #222222;
}

.user-first-right-down {
  font-size: 28px;
  color: #ffffff;
  background-color: #c4c4c4;
  border-radius: 20px;
  padding: 5px 30px;
  margin-top: 20px;
}

.user-second {
  margin-top: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.user-second>span {
  width: 210px;
  font-size: 26px;
  color: #222222;
}

.user-third {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.user-third>span {
  width: 210px;
  font-size: 24px;
  color: #999999;
}

.business {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 0 30px 30px;
  margin-top: 20px;
}

.business-row {
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.business-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.business-column-up {
  width: 56px;
  height: 56px;
}

.business-column-down {
  font-size: 24px;
  color: #333333;
  margin-top: 20px;
}
</style>
