<template>
  <div id="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>房屋列表</span>
    </div>
    <div class="house-list">
      <div class="house-item" @click="select(item)" v-for="(item, index) in bindHouse" :key="index">
        <div class="house-item-left">
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
      </div>
    </div>
    <van-popup class='default-house-reminder' v-model="showPopup" :close-on-click-overlay="false">
      <default-house-reminder :house="house" @confirm="confirm" @close="close" v-if="showPopup"></default-house-reminder>
    </van-popup>
  </div>
</template>

<script>
import DefaultHouseReminder from '@/components/common/DefaultHouseReminder';
import baseApi from '@/api/base';

export default {
  name: 'BindHouseGrid',
  components: {
    DefaultHouseReminder
  },
  props: [
    'bindHouse'
  ],
  data () {
    return {
      house: {},
      showPopup: false
    };
  },
  beforeMount: function () {
    for (let index = 0; index < this.bindHouse.length; index++) {
      if (this.bindHouse[index].relationLabel) {
        const relationLabel = this.bindHouse[index].relationLabel.substring(0, 2);
        if (relationLabel.length === 1) {
          this.bindHouse[index].one = relationLabel;
        } else if (relationLabel.length === 2) {
          this.bindHouse[index].two = relationLabel;
        }
      }
    }
  },
  mounted: function () {
  },
  methods: {
    goBack: function () {
      this.$emit('goBack');
    },
    select: function (item) {
      this.house = item;
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
      this.$emit('select', this.house);
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

.house-list {
  width: 690px;
  margin: 0 30px;
}

.house-item {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin-top: 20px;
  padding: 30px 20px;
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
  margin-right: 20px;
  padding: 0 10px;
}

.house-label {
  font-size: 22px;
  background-color: #f4f4f4;
  margin-right: 20px;
  padding: 0 10px;
}

.house-name {
  margin-right: 20px;
}

.house-item-left-right-bottom {
  font-size: 24px;
  color: #666666;
  margin-top: 20px;
}

.default-house-reminder {
  width: 700px;
  height: auto;
  border-radius: 10px;
}
</style>
