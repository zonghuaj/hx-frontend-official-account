<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>当前房屋换热站</span>
    </div>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse"></house-card>
    <div class="outlets" v-if="outlets">
      <div class="outlets-name">
        <div class="outlets-name-left">
          <img src="@/assets/icon/maintain_icon_site.png" />
          <span>{{ outlets.outletsName }}</span>
        </div>
        <span class="outlets-name-right" style="border: 1px solid #ff6016;" @click="goTimeArea">服务时间及范围</span>
      </div>
      <div class="outlets-address">
        <div class="outlets-address-left">
          <img src="@/assets/icon/maintain_sm_icon_dz.png" />
          <span>地址：</span>
          <span>{{ outlets.outletsAddress }}</span>
        </div>
        <div class="outlets-address-right" @click="locate">
          <img src="@/assets/icon/maintain_icon_dw.png" />
          <span>查看地图</span>
        </div>
      </div>
      <div class="outlets-telephone">
        <img src="@/assets/icon/maintain_sm_icon_dh.png" />
        <span>电话：</span>
        <span><a :href="'tel:' + outlets.outletsTelephone">{{ outlets.outletsTelephone }}</a></span>
      </div>
    </div>
    <div class="btn-view-more" @click="goMaintenanceList">
      <span>查看更多换热站</span>
      <img src="@/assets/icon/ty_icon_more_orange.png" />
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import serviceApi from '@/api/service.js';

export default {
  name: 'MyMaintenance',
  components: {
    HouseCard
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      outlets: null
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
        name: 'serviceHall',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    switchHouse: function (house) {
      this.curHouse = house;
      this.outlets = null;
      this.initPage();
    },
    initPage: function () {
      serviceApi.getHouseMaintenanceList(this.curHouse.houseId).then(result => {
        if (result.status === 1) {
          this.outlets = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    goMaintenanceList: function () {
      this.$router.push({
        name: 'maintenanceList',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    goTimeArea: function () {
      this.$router.push({
        name: 'timeArea',
        params: {
          source: 'myMaintenance',
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          outlets: this.outlets
        }
      });
    },
    locate: function () {
      this.$router.push({
        name: 'maintenanceList',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          outlets: this.outlets
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

.outlets {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
}

.outlets-name {
  width: 630px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.outlets-name-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.outlets-name-left>img {
  width: 32px;
  height: 32px;
}

.outlets-name-left>span {
  width: 350px;
  font-size: 30px;
  color: #333333;
  margin-left: 20px;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.outlets-name-right {
  font-size: 22px;
  color: #ff6016;
  border-radius: 5px;
  padding: 5px 20px;
  margin-left: 20px;
}

.outlets-address {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.outlets-address-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.outlets-address-left>img {
  width: 24px;
  height: 24px;
}

.outlets-address-left>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.outlets-address-left>span:nth-child(3) {
  width: 340px;
  font-size: 26px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.outlets-address-right {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.outlets-address-right>img {
  width: 32px;
  height: 32px;
}

.outlets-address-right>span {
  font-size: 26px;
  color: #ff6016;
  margin-left: 10px;
}

.outlets-telephone {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.outlets-telephone>img {
  width: 24px;
  height: 24px;
}

.outlets-telephone>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.outlets-telephone>span:nth-child(3) {
  font-size: 26px;
  color: #333333;
}

.btn-view-more {
  width: 690px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.btn-view-more>span {
  font-size: 22px;
  color: #ff6016;
}

.btn-view-more>img {
  width: 12px;
  height: 21px;
  margin-left: 20px;
}
</style>
