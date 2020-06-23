<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>填写停供单</span>
    </div>
    <house-card ref="houseCard" :curHouse="curHouse" :bindHouse="bindHouse" source="addStopHeating" @switch="switchHouse"></house-card>
    <div class="order">
      <div class="order-title" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/repairs_icon_bxxx.png" />
        <span>停供信息</span>
      </div>
      <div class="order-owner">
        <span class="order-owner-left"><font color="red">*</font>&nbsp;房主姓名</span>
        <input class="order-owner-right" type="text" placeholder="请输入房主姓名" v-model="ownerName" />
      </div>
      <div class="order-identifyNo">
        <span class="order-identifyNo-left"><font color="red">*</font>&nbsp;房主身份证号</span>
        <input class="order-identifyNo-right" type="text" placeholder="请输入房主身份证号" v-model="identifyNo" />
      </div>
      <div class="order-contact">
        <span class="order-contact-left"><font color="red">*</font>&nbsp;联系人</span>
        <input class="order-contact-right" type="text" placeholder="请输入联系人" v-model="contact" />
      </div>
      <div class="order-telephone">
        <span class="order-telephone-left"><font color="red">*</font>&nbsp;联系电话</span>
        <input class="order-telephone-right" type="text" placeholder="请输入联系电话" v-model="telephone" />
      </div>
      <div class="order-remark">
        <span class="order-remark-up">备注</span>
        <textarea class="order-remark-down" placeholder="请输入备注" rows="3" v-model="remark"></textarea>
      </div>
      <div class="order-identity">
        <span class="order-identity-up"><font color="red">*</font>&nbsp;户主身份证照片</span>
        <div class="order-identity-down">
          <van-image class="order-identity-down-item" :src="identityPhoto1" fit="contain" @click="showPreviewPhoto('identityPhoto1')" v-if="identityPhoto1" />
          <van-uploader name="identityPhoto1" :after-read="afterRead" v-else>
            <img class="order-identity-down-item" src="@/assets/icon/identity1.png" />
          </van-uploader>

          <van-image class="order-identity-down-item" :src="identityPhoto2" fit="contain" @click="showPreviewPhoto('identityPhoto2')" v-if="identityPhoto2" />
          <van-uploader name="identityPhoto2" :after-read="afterRead" v-else>
            <img class="order-identity-down-item" src="@/assets/icon/identity2.png" />
          </van-uploader>
        </div>
      </div>
      <div class="order-property">
        <span class="order-property-up"><font color="red">*</font>&nbsp;房产证照片</span>
        <div class="order-property-down">
          <van-image class="order-property-down-item" :src="propertyPhoto1" fit="contain" @click="showPreviewPhoto('propertyPhoto1')" v-if="propertyPhoto1" />
          <van-uploader name="propertyPhoto1" :after-read="afterRead" v-else>
            <img class="order-property-down-item" src="@/assets/icon/photo.png" />
          </van-uploader>

          <van-image class="order-property-down-item" :src="propertyPhoto2" fit="contain" @click="showPreviewPhoto('propertyPhoto2')" v-if="propertyPhoto2" />
          <van-uploader name="propertyPhoto2" :after-read="afterRead" v-else>
            <img class="order-property-down-item" src="@/assets/icon/photo.png" />
          </van-uploader>

          <van-image class="order-property-down-item" :src="propertyPhoto3" fit="contain" @click="showPreviewPhoto('propertyPhoto3')" v-if="propertyPhoto3" />
          <van-uploader name="propertyPhoto3" :after-read="afterRead" v-else>
            <img class="order-property-down-item" src="@/assets/icon/photo.png" />
          </van-uploader>
        </div>
      </div>
      <span class="order-tip">温馨提示：请上传户主身份证正反面照片及房产证编号、户主姓名、建筑面积页照片</span>
    </div>
    <van-button class="btn-next" text="下一步" @click="doNext" />
    <van-popup class="preview-photo" v-model="showPreviewPhotoPopup" position="right" :close-on-click-overlay="false">
      <preview-photo :photo="photo" :deleteFlag="deleteFlag" @goBack="hidePreviewPhoto" @delete="deletePhoto" v-if="showPreviewPhotoPopup"></preview-photo>
    </van-popup>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import PreviewPhoto from '@/components/common/PreviewPhoto';

export default {
  name: 'AddStopHeating',
  components: {
    HouseCard,
    PreviewPhoto
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      other: {},
      // 房主姓名
      ownerName: null,
      // 房主身份证号
      identifyNo: null,
      // 联系人
      contact: null,
      // 联系电话
      telephone: null,
      // 备注
      remark: null,
      // 户主身份证照片
      identityPhoto1: null,
      identityPhoto2: null,
      // 房产证照片
      propertyPhoto1: null,
      propertyPhoto2: null,
      propertyPhoto3: null,
      // 预览照片
      showPreviewPhotoPopup: false,
      label: null,
      photo: null,
      deleteFlag: true
    };
  },
  beforeMount: function () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.other = params.other;
    if (params.hasOwnProperty('record')) {
      const record = params.record;
      this.ownerName = record.ownerName;
      this.identifyNo = record.identifyNo;
      this.contact = record.contact;
      this.telephone = record.telephone;
      this.remark = record.remark;
      this.identityPhoto1 = record.identityPhoto1;
      this.identityPhoto2 = record.identityPhoto2;
      this.propertyPhoto1 = record.propertyPhoto1;
      this.propertyPhoto2 = record.propertyPhoto2;
      this.propertyPhoto3 = record.propertyPhoto3;
    } else {
      this.contact = this.curHouse.contact;
      this.telephone = this.curHouse.telephone;
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
      // 房屋卡片
      if (this.$refs.houseCard.showPopup) {
        this.$refs.houseCard.showPopup = false;
        return;
      }
      // 预览照片
      if (this.showPreviewPhotoPopup) {
        this.showPreviewPhotoPopup = false;
        return;
      }
      this.$dialog.confirm({
        message: '您将放弃本次编辑内容，是否继续。'
      }).then(() => {
        this.$router.push({
          name: 'serviceHall',
          params: {
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      });
    },
    switchHouse: function (house, other) {
      if (this.curHouse === house) {
        return;
      }
      this.curHouse = house;
      this.other = other;
      this.contact = this.curHouse.contact;
      this.telephone = this.curHouse.telephone;
    },
    doNext: function () {
      if (!this.ownerName) {
        this.$toast('请输入房主姓名');
        return;
      }
      if (!this.identifyNo) {
        this.$toast('请输入房主身份证号');
        return;
      } else {
        const regex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        if (!regex.test(this.identifyNo)) {
          this.$toast('请输入有效的房主身份证号');
          return;
        }
      }
      if (!this.contact) {
        this.$toast('请输入联系人');
        return;
      }
      if (!this.telephone) {
        this.$toast('请输入联系电话');
        return;
      } else {
        const regex = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/;
        if (!regex.test(this.telephone)) {
          this.$toast('请输入有效的联系电话');
          return;
        }
      }
      if (!this.identityPhoto1 || !this.identityPhoto2) {
        this.$toast('请上传户主身份证照片');
        return;
      }
      if (!this.propertyPhoto1 && !this.propertyPhoto2 && !this.propertyPhoto3) {
        this.$toast('请上传房产证照片');
        return;
      }
      const record = {
        ownerName: this.ownerName,
        identifyNo: this.identifyNo,
        contact: this.contact,
        telephone: this.telephone,
        remark: this.remark,
        identityPhoto1: this.identityPhoto1,
        identityPhoto2: this.identityPhoto2,
        propertyPhoto1: this.propertyPhoto1,
        propertyPhoto2: this.propertyPhoto2,
        propertyPhoto3: this.propertyPhoto3
      };
      this.$router.push({
        name: 'confirmStopHeating',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          other: this.other,
          record: record
        }
      });
    },
    afterRead: function (file, detail) {
      // 压缩图片
      this.common.compressImage(file.content, {
        width: 750
      }).then(result => {
        if (detail.name === 'identityPhoto1') {
          this.identityPhoto1 = result;
        } else if (detail.name === 'identityPhoto2') {
          this.identityPhoto2 = result;
        } else if (detail.name === 'propertyPhoto1') {
          this.propertyPhoto1 = result;
        } else if (detail.name === 'propertyPhoto2') {
          this.propertyPhoto2 = result;
        } else if (detail.name === 'propertyPhoto3') {
          this.propertyPhoto3 = result;
        }
      });
    },
    showPreviewPhoto: function (label) {
      this.showPreviewPhotoPopup = true;
      this.label = label;
      if (this.label === 'identityPhoto1') {
        this.photo = this.identityPhoto1;
      } else if (this.label === 'identityPhoto2') {
        this.photo = this.identityPhoto2;
      } else if (this.label === 'propertyPhoto1') {
        this.photo = this.propertyPhoto1;
      } else if (this.label === 'propertyPhoto2') {
        this.photo = this.propertyPhoto2;
      } else if (this.label === 'propertyPhoto3') {
        this.photo = this.propertyPhoto3;
      }
    },
    hidePreviewPhoto: function () {
      this.showPreviewPhotoPopup = false;
    },
    deletePhoto: function () {
      this.showPreviewPhotoPopup = false;
      if (this.label === 'identityPhoto1') {
        this.identityPhoto1 = null;
      } else if (this.label === 'identityPhoto2') {
        this.identityPhoto2 = null;
      } else if (this.label === 'propertyPhoto1') {
        this.propertyPhoto1 = null;
      } else if (this.label === 'propertyPhoto2') {
        this.propertyPhoto2 = null;
      } else if (this.label === 'propertyPhoto3') {
        this.propertyPhoto3 = null;
      }
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
  font-size: 28px;
  color: #333333;
  margin-top: 20px;
  text-align: left;
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

.order-tip {
  width: 630px;
  font-size: 20px;
  color: red;
  margin: 20px 30px;
  text-align: left;
}

.btn-next {
  width: 690px;
  height: 88px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
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
