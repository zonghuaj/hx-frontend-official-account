<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>供热报修记录</span>
    </div>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse"></house-card>
    <div class="order" v-for="(item, index) in list" :key="index">
      <div class="order-row" style="border-top: none;">
        <div class="order-ywlb">
          <span class="order-ywlb-left">业务类别</span>
          <span class="order-ywlb-right">{{ item.busType }}</span>
        </div>
        <div class="order-djbh">
          <span class="order-djbh-left">单据编号</span>
          <span class="order-djbh-right">{{ item.documentNo }}</span>
        </div>
      </div>
      <div class="order-row">
        <div class="order-bxlb">
          <span class="order-bxlb-left">报修类别</span>
          <span class="order-bxlb-right">{{ item.type }}</span>
        </div>
      </div>
      <div class="order-row">
        <div class="order-bxsj">
          <span class="order-bxsj-left">报修时间</span>
          <span class="order-bxsj-right">{{ item.createTime }}</span>
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
import orderApi from '@/api/order';

export default {
  name: 'HistoryRepairList',
  components: {
    HouseCard
  },
  data () {
    return {
      source: '',
      curHouse: {},
      bindHouse: [],
      list: []
    };
  },
  beforeMount: function () {
    var params = this.$route.params;
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
      if (this.curHouse === house) {
        return;
      }
      this.curHouse = house;
      this.initPage();
    },
    initPage () {
      orderApi.getRepairList(this.curHouse.houseId).then(result => {
        if (result.status === 1) {
          this.list = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    // 查看详情
    viewDetails: function (item) {
      this.$router.push({
        name: 'historyRepairForm',
        params: {
          compliantId: item.compliantId,
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

.order-ywlb {
  width: 295px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-ywlb-left {
  font-size:28px;
  color: #999999;
}

.order-ywlb-right {
  font-size:28px;
  color: #333333;
  margin-left: 20px;
}

.order-djbh {
  width: 315px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.order-djbh-left {
  font-size:28px;
  color: #999999;
}

.order-djbh-right {
  font-size:28px;
  color: #333333;
  margin-left: 20px;
}

.order-bxlb {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-bxlb-left {
  font-size:28px;
  color: #999999;
}

.order-bxlb-right {
  font-size:28px;
  color: #333333;
  margin-left: 20px;
}

.order-bxsj {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.order-bxsj-left {
  font-size:28px;
  color: #999999;
}

.order-bxsj-right {
  font-size:28px;
  color: #333333;
  margin-left: 20px;
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
