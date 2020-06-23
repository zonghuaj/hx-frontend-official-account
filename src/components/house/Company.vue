<template>
  <div class="content">
    <head-card title="选择房屋"></head-card>
    <div class="company">
      <span class="company-left">供热公司</span>
      <div class="company-right" @click="showCompany">
        <span>{{ company.companyName }}</span>
        <img src="@/assets/icon/ty_icon_pull_down.png" />
      </div>
      <van-popup v-model="showCompanyPopup">
        <span>请选择供热公司</span>
        <van-radio-group v-model="company.companyId">
          <van-cell-group>
            <van-cell
              :title-style="company.companyId == item.companyId ? 'color: #ff6016;' : ''"
              :title="item.companyName"
              clickable
              center
              @click="selectCompany(item)"
              v-for="(item, index) in companyList"
              :key="index">
              <van-radio :name="item.companyId">
                <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal" />
              </van-radio>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </van-popup>
    </div>
    <div class="item" @click="nav('card')" v-if="searchMethod.is_heat_card == 1">
      <div class="item-left">
        <img src="@/assets/icon/house_btn_icon_gr.png" />
        <span>按供热卡号</span>
      </div>
      <img class="item-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
    <div class="item" @click="nav('address')" v-if="searchMethod.is_house_address == 1">
      <div class="item-left">
        <img src="@/assets/icon/house_btn_icon_fw.png" />
        <span>按房屋地址</span>
      </div>
      <img class="item-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
    <div class="item" @click="nav('blueAddress')" v-if="searchMethod.is_house_address == 2">
      <div class="item-left">
        <img src="@/assets/icon/house_btn_icon_fw.png" />
        <span>按蓝牌地址</span>
      </div>
      <img class="item-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
    <div class="item" @click="nav('floorNumber')" v-if="searchMethod.is_phone == 1">
      <div class="item-left">
        <img src="@/assets/icon/house_btn_icon_lh.png" />
        <span>按小区楼号</span>
      </div>
      <img class="item-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
    <div class="item" @click="nav('phoneNumber')" v-if="searchMethod.is_region_buildno == 1">
      <div class="item-left">
        <img src="@/assets/icon/house_btn_icon_sj.png" />
        <span>按预留手机号</span>
      </div>
      <img class="item-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
  </div>
</template>

<script>
import HeadCard from '@/components/house/HeadCard';
import constant from '@/assets/js/constant';
import { getCompany, getSearchMethod } from '@/api/house';

export default {
  name: 'Company',
  components: {
    HeadCard
  },
  data () {
    return {
      label: null,
      houseId: null,
      showCompanyPopup: false,
      companyList: [],
      company: {},
      searchMethod: {},
      icon: constant.radioStyle.icon
    };
  },
  beforeMount: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.label = params.label;
    this.houseId = params.houseId;
    if (params.hasOwnProperty('company')) {
      this.company = params.company;
    }
    if (params.hasOwnProperty('searchMethod')) {
      this.searchMethod = params.searchMethod;
    }
    this.initPage();
  },
  mounted: function () {
  },
  methods: {
    nav: function (routerName) {
      this.$router.push({
        name: routerName,
        params: {
          label: this.label,
          houseId: this.houseId,
          company: this.company,
          searchMethod: this.searchMethod
        }
      });
    },
    initPage: function () {
      getCompany().then(result => {
        if (result.data.status === 1) {
          this.companyList = result.data.data;
        } else {
          this.$toast(result.data.data.message);
        }
      });
    },
    showCompany: function () {
      this.showCompanyPopup = true;
    },
    selectCompany: function (item) {
      this.showCompanyPopup = false;
      // 深拷贝
      this.company = JSON.parse(JSON.stringify(item));
      getSearchMethod(this.company.companyId).then(result => {
        if (result.data.status === 1) {
          this.searchMethod = result.data.data;
        } else {
          this.$toast(result.data.data.message);
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

.company {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.company-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.company-right {
  width: 450px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.company-right>span {
  font-size: 28px;
  color: #ff6016;
}

.company-right>img {
  width: 30px;
  height: 17px;
  margin-left: 20px;
}

.item {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.item-left>img {
  width: 60px;
  height: 60px;
}

.item-left>span {
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
}

.item-right {
  width: 18px;
  height: 30px;
}

.van-popup {
  width: 690px;
  border-radius: 10px;
}

.van-popup>span {
  font-size: 28px;
  color: #333333;
  margin: 30px 0;
}

.van-radio-group {
  padding: 0 30px;
  max-height: 600px;
  overflow-y: auto;
}

.van-cell {
  padding: 30px 0;
  line-height: normal;
}

.van-cell img {
  width: 28px;
  height: 28px;
}

.van-cell__title {
  font-size: 28px;
  color: #333333;
  text-align: left;
  flex: 1;
}

.van-cell__value {
  flex: none;
}
</style>
