<template>
  <div id="content">
    <div class="nav">
      <div class="nav-icon">
        <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      </div>
      <span class="nav-title">编辑房屋</span>
      <div class="nav-btn">
        <span @click="doSave">保存</span>
      </div>
    </div>
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
      <div class="house-item">
        <span class="house-item-left">联系人</span>
        <input class="house-item-right" type="text" placeholder="请输入联系人" v-model="house.contact" />
      </div>
      <div class="house-item">
        <span class="house-item-left">联系电话</span>
        <input class="house-item-right" type="text" placeholder="请输入联系电话" v-model="house.telephone" />
      </div>
    </div>
    <div class="house-default">
      <span class="house-default-left">设置默认房屋</span>
      <van-switch class="house-default-right" v-model="isDefault" />
    </div>
    <div class="btn-delete" @click="doDelete">
      <img src="@/assets/icon/ty_icon_del.png" />
      <span>删除该房屋</span>
    </div>
  </div>
</template>

<script>
import { deleteHouse, houseSave } from '@/api/house';

export default {
  name: 'EditHouse',
  components: {
  },
  data () {
    return {
      label: null,
      houseId: null,
      house: {},
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
    this.house = params.house;
    if (this.house.isDefault === 1) {
      this.isDefault = true;
    } else {
      this.isDefault = false;
    }
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
      this.$toast.clear();
      this.$router.push({
        name: 'houseList',
        params: {
          label: this.label,
          houseId: this.houseId
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
          contact: this.house.contact,
          telephone: this.house.telephone,
          isDefault: this.isDefault ? 1 : 0
        };
        houseSave(this.house.bindId, params).then(result => {
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
    doDelete: function () {
      this.$dialog.confirm({
        message: '确认从房屋列表中删除该房屋？'
      }).then(() => {
        this.$toast.loading({
          duration: 0,
          forbidClick: true,
          message: '删除中...'
        });
        deleteHouse(this.house.bindId).then(result => {
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
      });
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

.nav {
  width: 750px;
  background-color: #e3e3e3;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.nav-icon {
  width: 80px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.nav-icon>img {
  width: 20px;
  height: 35px;
}

.nav-title {
  font-size: 36px;
  color: #333333;
}

.nav-btn {
  width: 80px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.nav-btn>span {
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

.btn-delete {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.btn-delete>img {
  width: 30px;
  height: 30px;
}

.btn-delete>span {
  font-size: 28px;
  color: red;
  margin-left: 20px;
}
</style>
