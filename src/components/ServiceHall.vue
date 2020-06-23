<template>
  <div class="content">
    <img class="banner" src="@/assets/icon/sy_banner.png" />
    <div class="house">
      <div class="house-left">
        <img class="house-left-left" src="@/assets/icon/sy_house.png" />
        <div class="house-left-right">
          <span class="house-left-right-up">{{ curHouse.hotAddress }}</span>
          <div class="house-left-right-down">
            <span class="house-default" v-if="curHouse.isDefault">默认</span>
            <span class="house-label">{{ curHouse.relationLabel }}</span>
            <span class="house-name">{{ curHouse.companyAbbreviationName }}</span>
            <span>{{ curHouse.cardCode }}</span>
          </div>
        </div>
      </div>
      <img class="house-right" src="@/assets/icon/ty_icon_more.png" @click="goHouseList" />
    </div>
    <div class="handle">
      <div class="handle-head">
        <img class="handle-head-left" src="@/assets/icon/sy_title_icon_briefcase.png"/>
        <span class="handle-head-right">业务办理</span>
      </div>
      <div class="handle-row">
        <div class="handle-column" @click="goCharge">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_Pay.png" />
          <span class="handle-column-down">供热交费</span>
        </div>
        <div class="handle-column" @click="goRepair">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_Tools.png" />
          <span class="handle-column-down">供热报修</span>
        </div>
        <div class="handle-column" @click="goComplain">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_service.png" />
          <span class="handle-column-down">供热投诉</span>
        </div>
        <div class="handle-column" @click="goStopHeating">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_apply.png" />
          <span class="handle-column-down">停供申请</span>
        </div>
      </div>
      <div class="handle-row">
        <div class="handle-column" @click="unable">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_hfgr.png" />
          <span class="handle-column-down">恢复供热</span>
        </div>
        <div class="handle-column" @click="goInvoiceList">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_search.png" />
          <span class="handle-column-down">发票查询</span>
        </div>
        <div class="handle-column" @click="unable">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_again.png" />
          <span class="handle-column-down">重开发票</span>
        </div>
        <div class="handle-column" @click="unable">
          <img class="handle-column-up" src="@/assets/icon/sy_big_icon_information.png" />
          <span class="handle-column-down">信息维护</span>
        </div>
      </div>
    </div>
    <div class="query">
      <div class="query-head">
        <img class="query-head-left" src="@/assets/icon/sy_title_icon_query.png"/>
        <span class="query-head-right">业务查询</span>
      </div>
      <div class="query-body">
        <div class="query-row">
          <div class="query-column" @click="goOrderList">
            <img class="query-column-left" src="@/assets/icon/sy_big_icon_todo.png" />
            <div class="query-column-right">
              <span class="query-column-right-up">待办业务</span>
              <span class="query-column-right-down">了解待办业务进度</span>
            </div>
          </div>
          <div class="query-column" @click="goHistoryOrderList">
            <img class="query-column-left" src="@/assets/icon/sy_big_icon_end.png" />
            <div class="query-column-right">
              <span class="query-column-right-up">完结业务</span>
              <span class="query-column-right-down">查看完结业务记录</span>
            </div>
          </div>
        </div>
        <div class="query-row">
          <div class="query-column" @click="goBusinessList">
            <img class="query-column-left" src="@/assets/icon/sy_big_icon_business.png" />
            <div class="query-column-right">
              <span class="query-column-right-up">客服大厅</span>
              <span class="query-column-right-down">办理各种供热业务</span>
            </div>
          </div>
          <div class="query-column" @click="goMyMaintenance">
            <img class="query-column-left" src="@/assets/icon/sy_big_icon_maintenance.png" />
            <div class="query-column-right">
              <span class="query-column-right-up">换热站点</span>
              <span class="query-column-right-down">提供及时维修服务</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JSSDKLoader from '@/assets/js/WeChat.js';
import wxApi from '@/api/wx';
import orderApi from '@/api/order';
import chargeApi from '@/api/charge';
import * as mixin from '@/utils/mixin';

export default {
  name: 'ServiceHall',
  mixins: [mixin],
  components: {},
  data () {
    return {
      curHouse: {},
      bindHouse: []
    };
  },
  beforeMount: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
  },
  // mounted: function () {
  //   if (window.history && window.history.pushState) {
  //     history.pushState(null, null, document.URL);
  //     window.addEventListener('popstate', this.goBack, false);
  //   }
  // },
  // destroyed: function () {
  //   window.removeEventListener('popstate', this.goBack, false);
  // },
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
    goHouseList: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'switchHouse',
          houseId: this.curHouse.houseId
        }
      });
    },
    // 供热交费
    goCharge: function () {
      chargeApi.getPaymentCharge(this.curHouse.houseId).then(result => {
        if (result.status === 1) {
          this.$router.push({
            name: 'editInvoice',
            params: {
              curHouse: this.curHouse,
              bindHouse: this.bindHouse
            }
          });
        } else {
          this.$dialog.alert({
            message: result.data.message
          });
        }
      });
    },
    // 供热报修
    goRepair: function () {
      this.$router.push({
        name: 'addRepair',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 供热投诉
    goComplain: function () {
      this.$router.push({
        name: 'addComplain',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 停供申请
    goStopHeating: function () {
      orderApi.verifyStopHeating(this.curHouse.houseId).then(result => {
        if (result.status === 1) {
          const other = result.data;
          this.$router.push({
            name: 'addStopHeating',
            params: {
              curHouse: this.curHouse,
              bindHouse: this.bindHouse,
              other: other
            }
          });
        } else {
          this.$dialog.alert({
            message: result.data.message
          });
        }
      });
    },
    // 发票查询
    goInvoiceList: function () {
      this.$router.push({
        name: 'invoiceList',
        params: {
          source: 'serviceHall',
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 信息维护
    goInformation: function () {
      this.$router.push({
        name: 'informationMaintenance',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 待办业务
    goOrderList: function () {
      this.$router.push({
        name: 'orderList',
        params: {
          source: 'serviceHall',
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 完结业务
    goHistoryOrderList: function () {
      this.$router.push({
        name: 'historyOrderList',
        params: {
          source: 'serviceHall',
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 客服大厅
    goBusinessList: function () {
      this.$router.push({
        name: 'businessList',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    // 维修网点
    goMyMaintenance: function () {
      this.$router.push({
        name: 'myMaintenance',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
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
  display: flex;
  flex-direction: column;
}

.banner {
  width: 750px;
  height: 320px;
  background-size: 750px 320px;
}

.house {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  margin: -20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.house-left-left {
  width: 80px;
  height: 80px;
}

.house-left-right {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.house-left-right-up {
  width: 492px;
  font-size: 30px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.house-left-right-down {
  font-size: 24px;
  color: #666666;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.house-default {
  font-size: 22px;
  color: #ff8400;
  background-color: #fff0e9;
  padding: 0 10px;
  margin-right: 20px;
}

.house-label {
  font-size: 22px;
  color: #ffffff;
  background-color: #ff6016;
  padding: 0 10px;
  margin-right: 20px;
}

.house-name {
  margin-right: 20px;
}

.house-right {
  width: 18px;
  height: 30px;
}

.handle {
  width: 750px;
  background-color: #ffffff;
  padding: 30px;
  margin-top: 20px;
}

.handle-head {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.handle-head-left {
  width: 40px;
  height: 40px;
}

.handle-head-right {
  font-size: 36px;
  color: #333333;
  margin-left: 20px;
}

.handle-row {
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.handle-column {
  width: 172.5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.handle-column-up {
  width: 90px;
  height: 90px;
}

.handle-column-down {
  font-size: 24px;
  color: #333333;
  margin-top: 20px;
}

.query {
  width: 750px;
  background-color: #ffffff;
  padding: 30px;
  margin-top: 20px;
}

.query-head {
  padding-bottom: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.query-head-left {
  width: 40px;
  height: 40px;
}

.query-head-right {
  font-size: 36px;
  color: #333333;
  margin-left: 20px;
}

.query-body {
  border: 1px solid #f7f7f7;
}

.query-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.query-column {
  width: 50%;
  border: 1px solid #f7f7f7;
  padding: 10px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.query-column-left {
  width: 120px;
  height: 120px;
}

.query-column-right {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.query-column-right-up {
  font-size: 26px;
  color: #333333;
}

.query-column-right-down {
  font-size: 20px;
  color: #999999;
  margin-top: 20px;
  white-space: nowrap;
}
</style>
