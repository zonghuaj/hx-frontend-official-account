<template>
  <div class="content">
    <head-card :title="title"></head-card>
    <img class="house-empty-icon" src="@/assets/icon/house_img_01.png" v-if="emptyFlag" />
    <van-button class="btn-add" @click="doAdd" v-if="emptyFlag">
      添加房屋
    </van-button>
    <div class="house-list" v-if="houseList.length > 0">
      <div class="house-item" v-for="(item, index) in houseList" :key="index">
        <div class="house-item-left" @click="doSelect(item)">
          <span class="house-item-left-left-one" v-if="item.one">{{ item.one }}</span>
          <span class="house-item-left-left-two" v-if="item.two">{{ item.two }}</span>
          <div class="house-item-left-right">
            <span class="house-item-left-right-top">{{ item.hotAddress }}</span>
            <div class="house-item-left-right-middle">
              <span class="house-default" v-if="item.isDefault">默认</span>
              <span class="house-label">{{ item.relationLabel }}</span>
              <span class="house-name">{{ item.companyAbbreviationName }}</span>
              <span>{{ item.cardCode }}</span>
            </div>
            <span class="house-item-left-right-bottom">{{ item.regionName + item.buildingName }}</span>
          </div>
        </div>
        <div class="house-item-right" @click="doEdit(item)">
          <span>编辑</span>
        </div>
      </div>
    </div>
    <div class="btn-continue-add" style="border: 1px dashed #ff6016;" @click="doAdd" v-if="houseList.length > 0">
      <div class="btn-continue-add-left">
        <img src="@/assets/icon/ty_icon_add.png" />
        <span>继续添加房屋</span>
      </div>
      <img class="btn-continue-add-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
    <img class="house-icon" src="@/assets/icon/house_img_02.png" v-if="oneFlag" />
    <van-popup class='default-house-reminder' v-model="showPopup" :close-on-click-overlay="false">
      <default-house-reminder :house="house" @confirm="confirm" @close="close" v-if="showPopup"></default-house-reminder>
    </van-popup>
  </div>
</template>

<script>
import HeadCard from '@/components/house/HeadCard';
import DefaultHouseReminder from '@/components/common/DefaultHouseReminder';
import baseApi from '@/api/base';
import orderApi from '@/api/order';
import chargeApi from '@/api/charge';
import { houseBind } from '@/api/house';

export default {
  name: 'HouseList',
  components: {
    HeadCard,
    DefaultHouseReminder
  },
  data () {
    return {
      label: null,
      houseId: null,
      title: '选择房屋',
      houseList: [],
      emptyFlag: false,
      oneFlag: false,
      house: {},
      showPopup: false
    };
  },
  beforeMount () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.label = params.label;
    this.houseId = params.houseId;
    this.initPage();
  },
  mounted () {
  },
  methods: {
    initPage: function () {
      if (this.label === 'houseList') {
        this.title = '房屋列表';
      }
      houseBind().then((res) => {
        this.houseList = res.data.data;
        for (let index = 0; index < this.houseList.length; index++) {
          if (this.houseList[index].relationLabel) {
            const relationLabel = this.houseList[index].relationLabel.substring(0, 2);
            if (relationLabel.length === 1) {
              this.houseList[index].one = relationLabel;
            } else if (relationLabel.length === 2) {
              this.houseList[index].two = relationLabel;
            }
          }
        }
        if (this.houseList.length === 0) {
          this.emptyFlag = true;
        } else if (this.houseList.length === 1) {
          this.oneFlag = true;
        }
      });
    },
    // 添加房屋
    doAdd: function () {
      this.$router.push({
        name: 'company',
        params: {
          label: this.label,
          houseId: this.houseId
        }
      });
    },
    // 编辑房屋
    doEdit: function (house) {
      this.$router.push({
        name: 'editHouse',
        params: {
          label: this.label,
          houseId: this.houseId,
          house: house
        }
      });
    },
    // 选择房屋
    doSelect: function (house) {
      if (this.label === 'houseList') {
        // ToDo
      } else {
        this.house = house;
        baseApi.getReminder().then(result => {
          if (result.status === 1) {
            if (result.data > 0) {
              this.showPopup = true;
            } else {
              this.doNext();
            }
          } else {
            this.$toast(result.data.message);
          }
        });
      }
    },
    confirm: function () {
      this.showPopup = false;
      this.house.isDefault = 1;
      this.doNext();
    },
    close: function () {
      this.showPopup = false;
      this.doNext();
    },
    doNext: function () {
      if (this.label === 'serviceHall') {
        this.$router.push({
          name: 'serviceHall',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
          }
        });
      } else if (this.label === 'editInvoice') {
        chargeApi.getPaymentCharge(this.house.houseId).then(result => {
          if (result.status === 1) {
            this.$router.push({
              name: 'editInvoice',
              params: {
                curHouse: this.house,
                bindHouse: this.houseList
              }
            });
          } else {
            this.$dialog.alert({
              message: result.data.message
            });
          }
        });
      } else if (this.label === 'addRepair') {
        this.$router.push({
          name: 'addRepair',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
          }
        });
      } else if (this.label === 'addComplain') {
        this.$router.push({
          name: 'addComplain',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
          }
        });
      } else if (this.label === 'addStopHeating') {
        orderApi.verifyStopHeating(this.house.houseId).then(result => {
          if (result.status === 1) {
            const other = result.data;
            this.$router.push({
              name: 'addStopHeating',
              params: {
                curHouse: this.house,
                bindHouse: this.houseList,
                other: other
              }
            });
          } else {
            this.$dialog.alert({
              message: result.data.message
            });
          }
        });
      } else if (this.label === 'myMaintenance') {
        this.$router.push({
          name: 'myMaintenance',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
          }
        });
      } else if (this.label === 'invoiceList') {
        this.$router.push({
          name: 'invoiceList',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
          }
        });
      } else if (this.label === 'historyOrderList') {
        this.$router.push({
          name: 'historyOrderList',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
          }
        });
      } else if (this.label === 'switchHouse') {
        this.$router.push({
          name: 'serviceHall',
          params: {
            curHouse: this.house,
            bindHouse: this.houseList
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
  justify-content: flex-start;
  align-items: center;
}

.house-empty-icon {
  width: 600px;
  height: 600px;
  margin-top: 20px;
}

.btn-add {
  width: 300px;
  height: 80px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  margin-top: 20px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}

.house-list {
  width: 690px;
  margin: 0 30px;
}

.house-item {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-item-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.house-item-left-left-one {
  width: 64px;
  height: 64px;
  font-size: 32px;
  color: #ffffff;
  background-color: #ff6016;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.house-item-left-left-two {
  width: 64px;
  height: 64px;
  font-size: 22px;
  color: #ffffff;
  background-color: #ff6016;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.house-item-left-right {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.house-item-left-right-top {
  width: 476px;
  font-size: 30px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.house-item-left-right-middle {
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
  background-color: #f7f7f7;
  padding: 0 10px;
  margin-right: 20px;
}

.house-name {
  margin-right: 20px;
}

.house-item-left-right-bottom {
  font-size: 24px;
  color: #666666;
  margin-top: 20px;
}

.house-item-right {
  border-left: 1px solid #e8e8e8;
  padding-left: 20px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.house-item-right>span {
  font-size: 24px;
  color: #999999;
  white-space: nowrap;
}

.btn-continue-add {
  width: 690px;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.btn-continue-add-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.btn-continue-add-left>img {
  width: 48px;
  height: 48px;
}

.btn-continue-add-left>span {
  font-size: 32px;
  color: #333333;
  margin-left: 30px;
}

.btn-continue-add-right {
  width: 18px;
  height: 30px;
}

.house-icon {
  width: 600px;
  height: 600px;
  margin-top: 20px;
}

.default-house-reminder {
  width: 700px;
  height: auto;
  border-radius: 10px;
}
</style>
