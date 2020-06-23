<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>停供申请（{{ record.documentNo }}）单详情</span>
    </div>
    <house-card :curHouse="curHouse"></house-card>
    <div class="order">
      <div class="order-title" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/dbyw_tgsq.png" />
        <span>停供信息</span>
      </div>
      <div class="order-owner">
        <span class="order-owner-left">户主姓名</span>
        <span class="order-owner-right">{{ record.ownerName }}</span>
      </div>
      <div class="order-identifyNo">
        <span class="order-identifyNo-left">户主身份证号</span>
        <span class="order-identifyNo-right">{{ record.identifyNo }}</span>
      </div>
      <div class="order-contact">
        <span class="order-contact-left">联系人</span>
        <span class="order-contact-right">{{ record.contact }}</span>
      </div>
      <div class="order-telephone">
        <span class="order-telephone-left">联系电话</span>
        <span class="order-telephone-right">{{ record.telephone }}</span>
      </div>
      <div class="order-remark">
        <span class="order-remark-up">备注</span>
        <span class="order-remark-down">{{ record.remark }}</span>
      </div>
      <div class="order-identity">
        <span class="order-identity-up">户主身份证照片</span>
        <div class="order-identity-down">
          <van-image class="order-identity-down-item" :src="record.identityPhoto1" fit="contain" @click="showPreviewPhoto('identityPhoto1')" />
          <van-image class="order-identity-down-item" :src="record.identityPhoto2" fit="contain" @click="showPreviewPhoto('identityPhoto2')" />
        </div>
      </div>
      <div class="order-property">
        <span class="order-property-up">房产证照片</span>
        <div class="order-property-down">
          <van-image class="order-property-down-item" :src="record.propertyPhoto1" fit="contain" @click="showPreviewPhoto('propertyPhoto1')" />
          <van-image class="order-property-down-item" :src="record.propertyPhoto2" fit="contain" @click="showPreviewPhoto('propertyPhoto2')" />
          <van-image class="order-property-down-item" :src="record.propertyPhoto3" fit="contain" @click="showPreviewPhoto('propertyPhoto3')" />
        </div>
      </div>
    </div>
    <div class="progress">
      <div class="progress-title" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/db_icon_jd.png" />
        <span>当前进度</span>
      </div>
      <el-timeline>
        <el-timeline-item :timestamp="item.pointTime" v-for="(item, index) in record.progressList" :key="index">
          {{ item.event }}&nbsp;&nbsp;{{ item.message }}
        </el-timeline-item>
      </el-timeline>
    </div>
    <div class="btn">
      <van-button text="申请取消" @click="doDelete" v-if="record.status == 1" />
      <van-button text="催办" :disabled="record.isUrge == 1" @click="doUrge" />
    </div>
    <van-popup class="preview-photo" v-model="showPreviewPhotoPopup" position="right" :close-on-click-overlay="false">
      <preview-photo :photo="photo" :deleteFlag="deleteFlag" @goBack="hidePreviewPhoto" v-if="showPreviewPhotoPopup"></preview-photo>
    </van-popup>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import PreviewPhoto from '@/components/common/PreviewPhoto';
import orderApi from '@/api/order';

export default {
  name: 'StopHeatingForm',
  components: {
    HouseCard,
    PreviewPhoto
  },
  data () {
    return {
      source: null,
      curHouse: {},
      bindHouse: [],
      record: {},
      showPreviewPhotoPopup: false,
      photo: null,
      deleteFlag: false
    };
  },
  beforeMount: function () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.stopHeatingId = params.stopHeatingId;
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
      this.$toast.clear();
      // 预览照片
      if (this.showPreviewPhotoPopup) {
        this.showPreviewPhotoPopup = false;
        return;
      }
      this.$router.push({
        name: 'orderList',
        params: {
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    initPage: function () {
      orderApi.getStopHeating(this.stopHeatingId).then(result => {
        if (result.status === 1) {
          this.record = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    doDelete: function () {
      this.$dialog.confirm({
        message: '您确认要取消停供申请吗？'
      }).then(() => {
        this.$toast.loading({
          duration: 0,
          forbidClick: true,
          message: '申请取消中...'
        });
        orderApi.deleteStopHeating(this.stopHeatingId).then(result => {
          this.$toast.clear();
          if (result.status === 1) {
            this.$dialog.alert({
              message: '您已取消停供申请'
            }).then(() => {
              this.$router.push({
                name: 'orderList',
                params: {
                  source: this.source,
                  curHouse: this.curHouse,
                  bindHouse: this.bindHouse
                }
              });
            });
          } else {
            this.$dialog.alert({
              message: result.data.message
            });
          }
        });
      });
    },
    doUrge: function () {
      this.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '催办中...'
      });
      orderApi.urgeStopHeating(this.stopHeatingId).then(result => {
        this.$toast.clear();
        if (result.status === 1) {
          this.$dialog.alert({
            message: '催办申请已提交'
          }).then(() => {
            this.record.isUrge = 1;
          });
        } else {
          this.$dialog.alert({
            message: result.data.message
          });
        }
      });
    },
    showPreviewPhoto: function (label) {
      this.showPreviewPhotoPopup = true;
      if (label === 'identityPhoto1') {
        this.photo = this.record.identityPhoto1;
      } else if (label === 'identityPhoto2') {
        this.photo = this.record.identityPhoto2;
      } else if (label === 'propertyPhoto1') {
        this.photo = this.record.propertyPhoto1;
      } else if (label === 'propertyPhoto2') {
        this.photo = this.record.propertyPhoto2;
      } else if (label === 'propertyPhoto3') {
        this.photo = this.record.propertyPhoto3;
      }
    },
    hidePreviewPhoto: function () {
      this.showPreviewPhotoPopup = false;
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

.order {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
}

.order-title {
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

.order-title>img {
  width: 32px;
  height: 32px;
}

.order-title>span {
  font-size: 32px;
  color: #333333;
  margin-left: 10px;
}

.order-owner {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-owner-left {
  font-size: 28px;
  color: #999999;
}

.order-owner-right {
  width: 400px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
}

.order-identifyNo {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-identifyNo-left {
  font-size: 28px;
  color: #999999;
}

.order-identifyNo-right {
  width: 400px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
}

.order-contact {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-contact-left {
  font-size: 28px;
  color: #999999;
}

.order-contact-right {
  width: 400px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
}

.order-telephone {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-telephone-left {
  font-size: 28px;
  color: #999999;
}

.order-telephone-right {
  width: 400px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
}

.order-remark {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.order-remark-up {
  font-size: 28px;
  color: #999999;
}

.order-remark-down {
  width: 630px;
  font-size: 28px;
  color: #333333;
  margin-top: 20px;
  text-align: left;
  word-wrap: break-word;
}

.order-identity {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.order-identity-up {
  font-size: 28px;
  color: #999999;
}

.order-identity-down {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.order-identity-down-item {
  width: 200px;
  height: 200px;
}

.order-property {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.order-property-up {
  font-size: 28px;
  color: #999999;
}

.order-property-down {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-property-down-item {
  width: 200px;
  height: 200px;
}

.progress {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
}

.progress-title {
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

.progress-title>img {
  width: 32px;
  height: 32px;
}

.progress-title>span {
  font-size: 32px;
  color: #333333;
  margin-left: 10px;
}

.btn {
  width: 690px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.btn>button {
  width: 335px;
  height: 88px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}

.preview-photo {
  width: 750px;
  height: 100%;
}
</style>
