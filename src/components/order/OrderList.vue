<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>待办业务列表</span>
    </div>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse" v-if="source === 'serviceHall'"></house-card>
    <div class="dbyw" v-for="(item, index) in list" :key="index">
      <div class="dbyw-title">
        <div class="dbyw-title-left">
          <img src="@/assets/icon/dbyw_grjf.png" v-if="item.businessCategoryId == 1" />
          <img src="@/assets/icon/dbyw_grbx.png" v-if="item.businessCategoryId == 2" />
          <img src="@/assets/icon/dbyw_fwts.png" v-if="item.businessCategoryId == 3" />
          <img src="@/assets/icon/dbyw_tgsq.png" v-if="item.businessCategoryId == 4" />
          <span>{{ item.name }}</span>
        </div>
        <span class="dbyw-title-right">单据编号：{{ item.pno }}</span>
      </div>
      <div class="dbyw-address">
        <span class="dbyw-address-left">房屋地址</span>
        <span class="dbyw-address-right">{{ item.address }}</span>
      </div>
      <div class="dbyw-time">
        <span class="dbyw-time-left">申请时间</span>
        <span class="dbyw-time-right">{{ item.time }}</span>
      </div>
      <div class="dbyw-status">
        <span class="dbyw-status-left">当前状态</span>
        <div class="dbyw-status-right">
          <div class="dbyw-status-right-left">
            <img src="@/assets/icon/dbyw_dzf.png" v-if="item.businessCategoryId == 1" />
            <img src="@/assets/icon/dbyw_wpd.png" v-if="item.businessCategoryId == 2" />
            <img src="@/assets/icon/dbyw_wpd.png" v-if="item.businessCategoryId == 3" />
            <img src="@/assets/icon/dbyw_wpd.png" v-if="item.businessCategoryId == 4" />
            <span>{{ item.status }}</span>
          </div>
          <div class="dbyw-status-right-right" @click="viewDetails(item)">
            <span>查看详情</span>
            <img src="@/assets/icon/ty_icon_more_orange.png" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import orderApi from '@/api/order';
import { houseBind } from '@/api/house';

export default {
  name: 'OrderList',
  components: {
    HouseCard
  },
  data () {
    return {
      source: null,
      curHouse: {},
      bindHouse: [],
      list: []
    };
  },
  beforeMount () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.source = params.source;
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
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
      if (this.source === 'serviceHall') {
        this.$router.push({
          name: 'serviceHall',
          params: {
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      } else {
        this.$router.push({
          name: 'profile'
        });
      }
    },
    switchHouse: function (house) {
      if (this.curHouse === house) {
        return;
      }
      this.curHouse = house;
      this.list = [];
      this.initPage();
    },
    initPage () {
      if (this.source === 'serviceHall') {
        orderApi.getHouseOrderList(this.curHouse.houseId).then(result => {
          if (result.status === 1) {
            this.list = result.data;
          } else {
            this.$toast(result.data.message);
          }
        });
      } else {
        orderApi.getOrderList().then(result => {
          if (result.status === 1) {
            this.list = result.data;
          } else {
            this.$toast(result.data.message);
          }
        });
        houseBind().then(result => {
          this.bindHouse = result.data.data;
        });
      }
    },
    // 查看详情
    viewDetails: function (item) {
      for (let index = 0; index < this.bindHouse.length; index++) {
        if (item.houseId === this.bindHouse[index].houseId) {
          this.curHouse = this.bindHouse[index];
        }
      }
      if (item.businessCategoryId === 1) {
        // 供热交费
        if (item.statusId === 1) {
          // 待支付
          this.$router.push({
            name: 'confirmOrder',
            params: {
              orderId: item.applicationId,
              source: this.source,
              curHouse: this.curHouse,
              bindHouse: this.bindHouse
            }
          });
        } else {
          this.$router.push({
            name: 'chargeForm',
            params: {
              orderId: item.applicationId,
              source: this.source,
              curHouse: this.curHouse,
              bindHouse: this.bindHouse
            }
          });
        }
      } else if (item.businessCategoryId === 2) {
        // 供热报修
        this.$router.push({
          name: 'repairForm',
          params: {
            compliantId: item.applicationId,
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      } else if (item.businessCategoryId === 3) {
        // 供热投诉
        this.$router.push({
          name: 'complainForm',
          params: {
            compliantId: item.applicationId,
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      } else if (item.businessCategoryId === 4) {
        // 停供申请
        this.$router.push({
          name: 'stopHeatingForm',
          params: {
            stopHeatingId: item.applicationId,
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.content {
  width: 750px;
  background-color: #f4f5fa;
  display: flex;
  flex-direction: column;
}

.nav {
  width: 750px;
  background-color: #e3e3e3;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.nav>img {
  width: 20px;
  height: 35px;
}

.nav>span {
  width: 650px;
  font-size: 36px;
  color: #333333;
}

.dbyw {
  width: 690px;
  background: #ffffff url(../../assets/icon/dbyw_top.png) no-repeat top center;
  background-size: 690px 12px;
  border-radius: 10px;
  padding: 0 30px;
  margin: 20px 30px 0;
}

.dbyw-title {
  width: 630px;
  padding: 42px 0 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dbyw-title-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.dbyw-title-left>img {
  width: 32px;
  height: 32px;
}

.dbyw-title-left>span {
  font-size:28px;
  color: #333333;
  margin-left: 10px;
}

.dbyw-title-right {
  font-size: 28px;
  color: #999999;
}

.dbyw-address {
  width: 630px;
  padding: 30px 0;
  border-top: 1px solid #e8e8e8;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dbyw-address-left {
  font-size: 28px;
  color: #999999;
}

.dbyw-address-right {
  width: 460px;
  font-size: 28px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dbyw-time {
  width: 630px;
  padding: 30px 0;
  border-top: 1px solid #e8e8e8;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dbyw-time-left {
  font-size: 28px;
  color: #999999;
}

.dbyw-time-right {
  width: 460px;
  font-size: 28px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dbyw-status {
  width: 630px;
  padding: 30px 0;
  border-top: 1px solid #e8e8e8;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dbyw-status-left {
  font-size: 28px;
  color: #999999;
}

.dbyw-status-right {
  width: 460px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dbyw-status-right-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.dbyw-status-right-left>img {
  width: 28px;
  height: 28px;
}

.dbyw-status-right-left>span {
  font-size: 28px;
  color: red;
  margin-left: 20px;
}

.dbyw-status-right-right {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.dbyw-status-right-right>span {
  font-size: 28px;
  color: #ff6016;
}

.dbyw-status-right-right>img {
  width: 12px;
  height: 21px;
  margin-left: 20px;
}
</style>
