<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>供热交费记录</span>
    </div>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse"></house-card>
    <div class="order" v-for="(item, index) in list" :key="index">
      <div class="order-row" style="border-top: none;">
        <div class="order-code">
          <span class="order-code-left">订单编号</span>
          <span class="order-code-right">{{ item.poDispNo }}</span>
        </div>
        <div class="order-year">
          <span class="order-year-left">交费年度</span>
          <span class="order-year-right">{{ item.chargeMonth }}</span>
        </div>
      </div>
      <div class="order-row">
        <div class="order-time">
          <span class="order-time-left">交费时间</span>
          <span class="order-time-right">{{ item.payTime.substring(0, 10) }}</span>
        </div>
        <div class="order-amount">
          <span class="order-amount-left">交费金额</span>
          <span class="order-amount-right">{{ item.amount }}元</span>
        </div>
      </div>
      <div class="order-row">
        <div class="order-status">
          <span class="order-status-left">发票状态</span>
          <span class="order-status-right">{{ item.status }}</span>
        </div>
        <div class="btn-view" @click="viewDetails(item)">
          <span>查看详情</span>
          <img src="@/assets/icon/ty_icon_more_orange.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import dictionaryApi from '@/api/dictionary';
import orderApi from '@/api/order';

export default {
  name: 'HistoryorderList',
  components: {
    HouseCard
  },
  data () {
    return {
      source: '',
      curHouse: {},
      bindHouse: [],
      statusList: [],
      list: []
    };
  },
  beforeMount: function () {
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
      this.$router.push({
        name: 'historyOrderList',
        params: {
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    switchHouse: function (house) {
      this.curHouse = house;
      this.getChargeList();
    },
    initPage: function () {
      dictionaryApi.getPaymentOrderStatusList().then(result => {
        if (result.status === 1) {
          this.statusList = result.data;
          this.getChargeList();
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    getChargeList: function () {
      orderApi.getChargeList(this.curHouse.houseId).then((result) => {
        if (result.status === 1) {
          const list = result.data;
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            for (let j = 0; j < this.statusList.length; j++) {
              if (item.poStatusId === this.statusList[j].id) {
                item.status = this.statusList[j].name;
                break;
              }
            }
          }
          this.list = list;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    // 查看详情
    viewDetails: function (item) {
      this.$router.push({
        name: 'historyChargeForm',
        params: {
          detailId: item.detailId,
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
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

.order {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 0 30px;
  margin: 20px 30px 0;
}

.order-row {
  width: 630px;
  border-top: 1px solid #e8e8e8;
  padding: 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-code {
  width: 325px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-code-left {
  font-size:28px;
  color: #999999;
}

.order-code-right {
  font-size:28px;
  color: #333333;
  margin-left: 10px;
}

.order-year {
  width: 285px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-year-left {
  font-size:28px;
  color: #999999;
}

.order-year-right {
  font-size:28px;
  color: #333333;
  margin-left: 10px;
}

.order-time {
  width: 325px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-time-left {
  font-size:28px;
  color: #999999;
}

.order-time-right {
  font-size:28px;
  color: #333333;
  margin-left: 10px;
}

.order-amount {
  width: 285px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-amount-left {
  font-size:28px;
  color: #999999;
}

.order-amount-right {
  font-size:28px;
  color: red;
  margin-left: 10px;
}

.order-status {
  width: 325px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-status-left {
  font-size:28px;
  color: #999999;
}

.order-status-right {
  font-size:28px;
  color: #333333;
  margin-left: 10px;
}

.btn-view {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.btn-view>span {
  font-size: 28px;
  color: #ff6016;
}

.btn-view>img {
  width: 12px;
  height: 21px;
  margin-left: 20px;
}
</style>
