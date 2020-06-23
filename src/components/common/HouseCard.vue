<template>
  <div>
    <div class="house-head">
      <span class="house-head-left">服务网点</span>
      <span class="house-head-right">查看更多</span>
    </div>
    <div class="house">
      <div class="house-left">
        <div class="house-left-left"/>
        <div class="house-left-right">
          <span class="house-left-right-up">{{ record.hotAddress }}</span>
          <div class="house-left-right-down">
            <span class="house-default" v-if="record.isDefault">默认</span>
            <!--span class="house-label">{{record.relationLabel}}</span-->
            <span class="house-name">{{ record.companyAbbreviationName }}</span>
            <span style="color: #fddcd1;">{{ record.cardCode }}</span>
          </div>
        </div>
      </div>
      <img class="house-right" src="@/assets/icon/ty_icon_more.png" @click="switchHouse" v-if="bindHouse" />
      <van-popup class='house-list' v-model="showPopup" position="right" :close-on-click-overlay="false">
        <bind-house-grid :bindHouse="bindHouse" @select="select" @goBack="hidePopup" v-if="showPopup"></bind-house-grid>
      </van-popup>
    </div>
  </div>
</template>

<script>
import BindHouseGrid from '@/components/common/BindHouseGrid';
import orderApi from '@/api/order';
import chargeApi from '@/api/charge';

export default {
  name: 'HouseCard',
  components: {
    BindHouseGrid
  },
  props: [
    'curHouse',
    'bindHouse',
    'source'
  ],
  data () {
    return {
      record: this.curHouse,
      showPopup: false
    };
  },
  beforeMount: function () {
  },
  mounted: function () {
  },
  methods: {
    switchHouse: function () {
      this.showPopup = true;
    },
    select: function (item) {
      // 供热交费
      if (this.source === 'editInvoice') {
        chargeApi.getPaymentCharge(item.houseId).then(result => {
          if (result.status === 1) {
            this.showPopup = false;
            this.record = item;
            this.$emit('switch', item);
          } else {
            this.$dialog.alert({
              message: result.data.message
            });
          }
        });
      } else if (this.source === 'addStopHeating') {
        orderApi.verifyStopHeating(item.houseId).then(result => {
          if (result.status === 1) {
            const other = result.data;
            this.showPopup = false;
            this.record = item;
            this.$emit('switch', item, other);
          } else {
            this.$dialog.alert({
              message: result.data.message
            });
          }
        });
      } else {
        this.showPopup = false;
        this.record = item;
        this.$emit('switch', item);
      }
    },
    hidePopup: function () {
      this.showPopup = false;
    }
  }
};
</script>

<style scoped>
.house {
  width: 690px;
  /*background-color: #ffffff;*/
  border-radius: 10px;
  margin: 20px 30px 0;
  padding: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-repeat:no-repeat;
  background-size:100% 100%;
  background-image: url('../../assets/icon/house_background.png');
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
  color: #ffffff;
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
  color: #f4f4f4;
  /*background-color: #fff0e9;*/
  margin-right: 20px;
  padding: 0 10px;
}

.house-label {
  font-size: 22px;
  color: #ffffff;
  background-color: #ff6016;
  margin-right: 20px;
  padding: 0 10px;
}

.house-name {
  margin-right: 20px;
  color: #f56a69;
}

.house-right {
  width: 18px;
  height: 30px;
}

.house-list {
  width: 750px;
  height: 100%;
   /*background-color: #f4f5fa;*/
}

.house-head {
  display: flex;
  justify-content: space-between;
}
.house-head-left {
  margin-left: 30px;
  font-weight: bold;
}
.house-head-right {
  margin-right: 30px;
  margin-top: 10px;
  font-size: 22px;
}
</style>
