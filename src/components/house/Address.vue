<template>
  <div id="content">
    <div class="search">
      <div class="house-company">
        <span class="house-company-left">供热公司</span>
        <span class="house-company-right">{{ company.companyName }}</span>
      </div>
      <div class="house-address">
        <span class="house-address-left">房屋地址</span>
        <div class="house-address-right">
          <input class="house-address-right-left" type="text" placeholder="请输入房屋地址" v-model="address" />
          <div class="house-address-right-right" @click="doSearch">
            <span>查询</span>
          </div>
        </div>
      </div>
    </div>
    <span class="total" v-if="total > 0">共&nbsp;<font color="red">{{ total }}</font>&nbsp;个房屋</span>
    <div class="house-list" v-if="houseList.length > 0">
      <van-collapse v-model="activeName" accordion>
        <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-collapse-item :style="activeName == item.houseId ? 'border: 1px solid #ff6016;' : ''" :title="item.hotAddress" :name="item.houseId" v-for="(item, index) in houseList" :key="index">
            <img slot="right-icon" :src="activeName == item.houseId ? icon.active : icon.normal" />
            <div class="house-item">
              <div class="house-item-left">
                <span class="house-item-left-left">小区楼号</span>
                <span class="house-item-left-right">{{ item.regionName + item.buildingName }}</span>
              </div>
              <div class="house-item-right">
                <span class="house-item-left-left">供热卡号</span>
                <span class="house-item-left-right">{{ item.cardCode }}</span>
              </div>
            </div>
            <div class="house-item">
              <div class="house-item-left">
                <span class="house-item-left-left">户主姓名</span>
                <span class="house-item-left-right">{{ item.maskCustomerName == '无' ? '' : item.maskCustomerName }}</span>
              </div>
              <div class="house-item-right">
                <span class="house-item-left-left">房屋面积</span>
                <span class="house-item-left-right">{{ item.areas[0].propertyArea }}m²</span>
              </div>
            </div>
            <div class="house-label">
              <span class="house-label-left"><font color="red">*</font>&nbsp;设置房屋标签</span>
              <div class="house-label-right">
                <input class="house-label-right-up" type="text" placeholder="请输入房屋标签" v-model="item.relationLabel" />
                <div class="house-label-right-down">
                  <span @click="setLabel(item, '我家')">我家</span>
                  <span @click="setLabel(item, '父母')">父母</span>
                  <span @click="setLabel(item, '朋友')">朋友</span>
                  <span @click="setLabel(item, '同事')">同事</span>
                </div>
              </div>
            </div>
            <div class="house-default">
              <span class="house-default-left">设置默认房屋</span>
              <van-switch class="house-default-right" v-model="isDefault" />
            </div>
            <div class="house-tip">
              <img src="@/assets/icon/ty_icon_warning.png" />
              <span>核对无误后 点击确认添加</span>
            </div>
            <van-button class="btn-add" text="确认添加" @click="doSave(item)" />
          </van-collapse-item>
        </van-list>
      </van-collapse>
    </div>
  </div>
</template>

<script>
import constant from '@/assets/js/constant';
import { getAddressHouse, modifyHouse } from '@/api/house';

export default {
  name: 'Address',
  components: {
  },
  data () {
    return {
      label: null,
      houseId: null,
      company: {},
      searchMethod: {},
      address: null,
      total: 0,
      houseList: [],
      isDefault: false,
      activeName: null,
      page: 1,
      loading: false,
      finished: false,
      icon: constant.radioStyle.icon
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
    this.company = params.company;
    this.searchMethod = params.searchMethod;
  },
  mounted: function () {
  },
  methods: {
    doSearch: function () {
      if (!this.address) {
        this.$toast('请输入房屋地址！');
        return;
      }
      this.total = 0;
      this.houseList = [];
      this.isDefault = false;
      this.activeName = null;
      this.page = 1;
      this.loading = false;
      this.finished = false;
      this.getHouseList();
    },
    getHouseList: function () {
      const params = {
        companyId: this.company.companyId,
        address: this.address,
        page: this.page++,
        size: 15
      };
      getAddressHouse(params).then(result => {
        if (result.data.status === 1) {
          this.total = result.data.data.total;
          const records = result.data.data.records;
          for (let index = 0; index < records.length; index++) {
            const maskCustomerName = records[index].maskCustomerName;
            if (maskCustomerName && maskCustomerName !== '无') {
              records[index].relationLabel = maskCustomerName.charAt(maskCustomerName.length - 1);
            } else {
              records[index].relationLabel = '我家';
            }
          }
          this.houseList = this.houseList.concat(records);
          if (!this.activeName) {
            if (this.houseList.length > 0) {
              this.activeName = this.houseList[0].houseId;
            }
          }
        } else {
          this.$toast(result.data.data.message);
        }
      });
    },
    doSave: function (item) {
      const reg = /^.{1,5}$/;
      if (reg.test(item.relationLabel)) {
        this.$toast.loading({
          duration: 0,
          forbidClick: true,
          message: '保存中...'
        });
        const params = {
          relationLabel: item.relationLabel,
          isDefault: this.isDefault ? 1 : 0
        };
        modifyHouse(item.houseId, 2, params).then(result => {
          this.$toast.clear();
          if (result.data.status === 1) {
            this.$router.push({
              name: 'houseList',
              params: {
                label: this.label,
                houseId: this.houseId
              }
            });
          } else {
            this.$toast(result.data.data.message);
          }
        });
      } else {
        this.$toast('房屋标签最少1个字最多5个字');
      }
    },
    setLabel: function (item, label) {
      item.relationLabel = label;
    },
    onLoad: function () {
      setTimeout(() => {
        this.loading = false;
        if (this.houseList.length === this.total) {
          this.finished = true;
        } else {
          this.getHouseList();
        }
      }, 500);
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

.search {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: column;
}

.house-company {
  width: 690px;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-company-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-company-right {
  font-size: 28px;
  color: #ff6016;
  margin-left: 20px;
  text-align: right;
}

.house-address {
  width: 690px;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-address-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-address-right {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.house-address-right-left {
  width: 380px;
  font-size: 28px;
  color: #333333;
  text-align: right;
}

.house-address-right-right {
  border-left: 1px solid #e8e8e8;
  padding-left: 20px;
  margin-left: 20px;
}

.house-address-right-right>span {
  font-size: 28px;
  color: #ff6016;
}

.total {
  width: 690px;
  font-size: 22px;
  color: #333333;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.house-list {
  width: 690px;
  background-color: #ffffff;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: column;
}

.house-item {
  width: 630px;
  border-bottom: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-item-left {
  width: 350px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.house-item-left-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-item-left-right {
  font-size: 28px;
  color: #333333;
  margin-left: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.house-item-right {
  width: 260px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.house-item-right-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-item-right-right {
  font-size: 28px;
  color: #333333;
  margin-left: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.house-label {
  width: 630px;
  border-bottom: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
}

.house-label-left {
  font-size: 28px;
  color: #999999;
}

.house-label-right {
  width: 400px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.house-label-right-up {
  width: 400px;
  font-size: 28px;
  color: #333333;
}

.house-label-right-down {
  width: 400px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-label-right-down>span {
  font-size: 26px;
  color: #ff6016;
  border: 1px solid #ff6016;
  padding: 0 10px;
}

.house-default {
  width: 630px;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-default-left {
  font-size: 28px;
  color: #999999;
}

.house-default-right {
  margin-left: 20px;
}

.house-tip {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.house-tip>img {
  width: 20px;
  height: 20px;
}

.house-tip>span {
  font-size: 20px;
  color: red;
  margin-left: 10px;
}

.btn-add {
  width: 630px;
  height: 88px;
  margin: 20px 0;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}
</style>
