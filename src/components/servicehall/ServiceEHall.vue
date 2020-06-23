<template>
  <div class="content">
    <hx-swipe></hx-swipe>
    <house-card ref="houseCard" :curHouse="curHouse" :bindHouse="bindHouse"></house-card>
    <div class="query">
      <div class="query-head">
        <span class="query-head-right">业务查询</span>
      </div>
      <div>
        <van-row>
          <van-col span="8" class="cell-image pay-image" @click="goCharge">
            <div>
              <span>在线缴费</span>
            </div>
          </van-col>
          <van-col span="8" class="cell-image stop-pay-image">
            <div>
              <span>停复热办理</span>
            </div>
          </van-col>
          <van-col span="8" class="cell-image repair-image" @click="goRepair">
            <div>
              <span>供热报修</span>
            </div>
          </van-col>
        </van-row>
        <van-row>
          <van-col span="8" class="cell-image complain-image" @click="goComplain">
            <div>
              <span>供热投诉</span>
            </div>
          </van-col>
          <van-col span="8" class="cell-image infosetting-image">
            <div>
              <span>信息维护</span>
            </div>
          </van-col>
          <van-col span="8" class="cell-image invoice-image">
            <div>
              <span>发票开具</span>
            </div>
          </van-col>
        </van-row>
      </div>
      <div class="query-body">
        <div class="query-row">
          <div class="query-column" @click="goOrderList">
            <img class="query-column-left" src="@/assets/icon/to_do_business.png" />
            <div class="query-column-right">
              <span class="query-column-right-up">待办业务</span>
              <span class="query-column-right-down">来办业务全知晓</span>
            </div>
          </div>
          <div class="query-column" @click="goHistoryOrderList">
            <img class="query-column-left" src="@/assets/icon/business_history.png" />
            <div class="query-column-right">
              <span class="query-column-right-up">业务记录</span>
              <span class="query-column-right-down">历史信息不丢失</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="service">
      <div class="service-head">
        <span class="service-head-right">服务网点</span>
      </div>
      <div class="service-body">
        <div class="service-row">
          <div class="service-column service-hall-image cell-image" @click="goOrderList">
            <div class="service-column-right">
              <span class="service-column-right-up">客户大厅</span>
              <span class="service-column-right-down">快速处理用户需求</span>
            </div>
          </div>
          <div class="service-column repair-site-image cell-image" @click="goHistoryOrderList">
            <div class="service-column-right">
              <span class="service-column-right-up">维修站点</span>
              <span class="service-column-right-down">高效解决各类故障</span>
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
import Vue from 'vue';
import HxSwipe from '@/components/common/HxSwipe';
import HouseCard from '@/components/common/HouseCard';
import mixin from '@/utils/mixin';
import { Swipe, SwipeItem, Lazyload, Col, Row } from 'vant';
Vue.use(Swipe);
Vue.use(Col);
Vue.use(Row);
Vue.use(SwipeItem);
Vue.use(Lazyload);

export default {
  name: 'ServiceEHall',
  mixins: [mixin],
  components: { HxSwipe, HouseCard },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      images: [
        require('@/assets/auto_play_icon/servicehall_swipe.png'),
        require('@/assets/auto_play_icon/servicehall_swipe.png')
      ]
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

<style lang="less" scoped>

.content {
  width: 750px;
  display: flex;
  flex-direction: column;
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
  font-weight: bold;
  margin-left: 20px;
}

.handle-row {
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.query {
  width: 750px;
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
  font-weight: bold;
  margin-left: 30px;
}

.query-body {
  background-color: #ffffff;
  border-radius: 35px;
  margin: 30px;
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

.cell-image {
  height: 230px;
  background-repeat:no-repeat;
  background-size:100% 100%;
}

.pay-image {
  background-image: url('../../assets/icon/online_pay_background.png');
}

.stop-pay-image {
  background-image: url('../../assets/icon/stop_pay_background.png');
}

.repair-image {
  background-image: url('../../assets/icon/repair_background.png');
}

.complain-image {
  background-image: url('../../assets/icon/complain_background.png');
}

.infosetting-image {
  background-image: url('../../assets/icon/infosetting_background.png');
}

.invoice-image {
  background-image: url('../../assets/icon/invoice_background.png');
}

.service-hall-image {
  background-image: url('../../assets/icon/service_hall.png');
}

.repair-site-image {
  background-image: url('../../assets/icon/repair_site.png');
}

.van-col span {
  margin-top: 140px;
  font-size: 20px;
}

.custom-indicator {
    position: absolute;
    right: 5px;
    top: 25px;
    padding: 2px 5px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
}

.service {
  width: 750px;
  margin-top: 20px;
}

.service-head {
  padding-bottom: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.service-head-left {
  width: 40px;
  height: 40px;
}

.service-head-right {
  font-size: 36px;
  color: #333333;
  font-weight: bold;
  margin-left: 30px;
}

.service-body {
  border-radius: 35px;
  margin: 30px;
}

.service-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.service-column {
  width: 45%;
  border: 1px solid #f7f7f7;
  padding: 10px 0;
  display: flex;
  flex-direction: row;
}

.service-column-right {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.service-column-right-up {
  font-size: 26px;
  color: #333333;
}

.service-column-right-down {
  font-size: 20px;
  color: #999999;
  margin-top: 20px;
  white-space: nowrap;
}
</style>
