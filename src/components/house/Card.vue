<template>
  <div id="content">
    <div class="search">
      <div class="house-company">
        <span class="house-company-left">供热公司</span>
        <span class="house-company-right">{{ company.companyName }}</span>
      </div>
      <div class="house-code">
        <span class="house-code-left">供热卡号</span>
        <div class="house-code-right">
          <input class="house-code-right-left" type="text" placeholder="请输入供热卡号" v-model="cardCode" />
          <div class="house-code-right-right" @click="doSearch">
            <span>查询</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="house">
      <div class="house">
        <div class="house-title" style="border: 1px solid #e8e8e8;">
          <img src="@/assets/icon/house_icon_house.png" />
          <span>房屋信息</span>
        </div>
        <div class="house-item" style="border-top: none;">
          <span class="house-item-left">房屋地址</span>
          <span class="house-item-right">{{ house.hotAddress }}</span>
        </div>
        <div class="house-item">
          <span class="house-item-left">小区楼号</span>
          <span class="house-item-right">{{ house.regionName + house.buildingName }}</span>
        </div>
        <div class="house-item">
          <span class="house-item-left">供热公司</span>
          <span class="house-item-right">{{ house.companyName }}</span>
        </div>
        <div class="house-item">
          <span class="house-item-left">供热卡号</span>
          <span class="house-item-right">{{ house.cardCode }}</span>
        </div>
        <div class="house-item">
          <span class="house-item-left">户主姓名</span>
          <span class="house-item-right">{{ house.maskCustomerName == '无' ? '' : house.maskCustomerName }}</span>
        </div>
        <div class="house-item">
          <span class="house-item-left">房屋面积</span>
          <span class="house-item-right">{{ house.areas[0].propertyArea }}m²</span>
        </div>
      </div>
      <div class="house">
        <div class="house-title" style="border: 1px solid #e8e8e8;">
          <img src="@/assets/icon/house_icon_marker.png" />
          <span>自定义信息</span>
        </div>
        <div class="house-label">
          <span class="house-label-left"><font color="red">*</font>&nbsp;设置房屋标签</span>
          <div class="house-label-right">
            <input class="house-label-right-up" type="text" placeholder="请输入房屋标签" v-model="house.relationLabel" />
            <div class="house-label-right-down">
              <span @click="setLabel('我家')">我家</span>
              <span @click="setLabel('父母')">父母</span>
              <span @click="setLabel('朋友')">朋友</span>
              <span @click="setLabel('同事')">同事</span>
            </div>
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
      <van-button class="btn-add" text="确认添加" @click="doSave" />
    </div>
  </div>
</template>

<script>
import { getCardHouse, modifyHouse } from '@/api/house';

export default {
  name: 'Card',
  components: {
  },
  data () {
    return {
      label: null,
      houseId: null,
      company: {},
      searchMethod: {},
      cardCode: null,
      house: null,
      isDefault: false
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
      if (!this.cardCode) {
        this.$toast('请输入供热卡号！');
        return;
      }
      this.house = null;
      this.isDefault = false;
      const params = {
        companyId: this.company.companyId,
        cardCode: this.cardCode
      };
      getCardHouse(params).then(result => {
        if (result.data.status === 1) {
          const houseList = result.data.data;
          if (houseList.length > 0) {
            const house = houseList[0];
            const maskCustomerName = house.maskCustomerName;
            if (maskCustomerName && maskCustomerName !== '无') {
              house.relationLabel = maskCustomerName.charAt(maskCustomerName.length - 1);
            } else {
              house.relationLabel = '我家';
            }
            this.house = house;
          } else {
            this.$toast('当前卡号不存在，请重新输入或选择其他方式添加。');
          }
        } else {
          this.$toast(result.data.data.message);
        }
      });
    },
    doSave: function () {
      const reg = /^.{1,5}$/;
      if (reg.test(this.house.relationLabel)) {
        this.$toast.loading({
          duration: 0,
          forbidClick: true,
          message: '保存中...'
        });
        const params = {
          relationLabel: this.house.relationLabel,
          isDefault: this.isDefault ? 1 : 0
        };
        modifyHouse(this.house.houseId, 1, params).then(result => {
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
    setLabel: function (label) {
      this.house.relationLabel = label;
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

.house-code {
  width: 690px;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-code-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-code-right {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.house-code-right-left {
  width: 380px;
  font-size: 28px;
  color: #333333;
  text-align: right;
}

.house-code-right-right {
  border-left: 1px solid #e8e8e8;
  padding-left: 20px;
  margin-left: 20px;
}

.house-code-right-right>span {
  font-size: 28px;
  color: #ff6016;
}

.house {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: column;
}

.house-title {
  width: 690px;
  background-color: #f7f7f7;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.house-title>img {
  width: 32px;
  height: 32px;
}

.house-title>span {
  font-size: 32px;
  color: #333333;
  margin-left: 10px;
}

.house-item {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.house-item-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-item-right {
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.house-label {
  width: 630px;
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
  white-space: nowrap;
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

.house-default-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.house-default-right {
  margin-left: 20px;
}

.house-tip {
  width: 750px;
  background-color: #ffffff;
  padding: 20px 0;
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
  width: 690px;
  height: 88px;
  margin: 20px 30px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}
</style>
