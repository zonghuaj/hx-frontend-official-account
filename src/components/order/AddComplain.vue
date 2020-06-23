<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>填写投诉单</span>
    </div>
    <house-card ref="houseCard" :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse"></house-card>
    <div class="order">
      <div class="order-title" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/complain_icon_tsxx.png" />
        <span>投诉信息</span>
      </div>
      <div class="order-category">
        <span class="order-category-left"><font color="red">*</font>&nbsp;投诉类别</span>
        <div class="order-category-right" @click="showCategory">
          <span>{{ category.name }}</span>
          <img src="@/assets/icon/ty_icon_pull_down.png" />
        </div>
        <van-popup v-model="showCategoryPopup">
          <span>请选择投诉类别</span>
          <van-radio-group v-model="category.id">
            <van-cell-group>
              <van-cell
                :title-style="category.id == item.id ? 'color: #ff6016;' : ''"
                :title="item.name"
                clickable
                center
                @click="selectCategory(item)"
                v-for="(item, index) in categoryList"
                :key="index">
                <van-radio :name="item.id">
                  <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal" />
                </van-radio>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </van-popup>
      </div>
      <div class="order-content">
        <span class="order-content-up"><font color="red">*</font>&nbsp;投诉内容</span>
        <div class="order-content-down">
          <img src="@/assets/icon/repairs_icon_sr.png" />
          <textarea placeholder="请输入投诉内容" rows="3" maxlength="2000" v-model="compliantContent"></textarea>
        </div>
      </div>
      <div class="order-contact">
        <span class="order-contact-left"><font color="red">*</font>&nbsp;联系人</span>
        <input class="order-contact-right" type="text" placeholder="请输入联系人" maxlength="50" v-model="contact" />
      </div>
      <div class="order-mobile">
        <span class="order-mobile-left"><font color="red">*</font>&nbsp;联系电话</span>
        <input class="order-mobile-right" type="text" placeholder="请输入联系电话" v-model="mobile" />
      </div>
      <!--
      <div class="order-voice">
        <span class="order-voice-left">语音描述</span>
        <div class="order-voice-right">
          <span @click="startRecord" v-if="!localId && !recordFlag">开始录音</span>
          <span @click="stopRecord" v-if="!localId && recordFlag">停止录音</span>
          <span @click="playVoice" v-if="localId && !playFlag">播放语音</span>
          <span @click="stopVoice" v-if="localId && playFlag">停止播放</span>
          <img src="@/assets/icon/pay_icon_close.png" @click="deleteVoice" v-if="localId" />
        </div>
      </div>
      <div class="order-video">
        <span class="order-video-left">视频信息</span>
        <div class="order-video-right1" v-if="video">
          <span @click="showPlayVideo" v-if="video">{{video.file.name}}</span>
          <img src="@/assets/icon/pay_icon_close.png" @click="deleteVideo" />
        </div>
        <van-uploader name="video" accept="video/*" :after-read="afterRead" v-else>
          <div class="order-video-right2" style="border: 1px solid #e8e8e8;">
            <img src="@/assets/icon/repairs_icon_video.png" />
            <span>拍摄视频（10s）</span>
          </div>
        </van-uploader>
      </div>
      -->
      <div class="order-photo">
        <span class="order-photo-up">现场照片</span>
        <div class="order-photo-down">
          <van-image class="order-photo-down-item" :src="photo1" fit="contain" @click="showPreviewPhoto('photo1')" v-if="photo1" />
          <van-uploader name="photo1" :after-read="afterRead" v-else>
            <img class="order-photo-down-item" src="@/assets/icon/photo.png" />
          </van-uploader>

          <van-image class="order-photo-down-item" :src="photo2" fit="contain" @click="showPreviewPhoto('photo2')" v-if="photo2" />
          <van-uploader name="photo2" :after-read="afterRead" v-else>
            <img class="order-photo-down-item" src="@/assets/icon/photo.png" />
          </van-uploader>

          <van-image class="order-photo-down-item" :src="photo3" fit="contain" @click="showPreviewPhoto('photo3')" v-if="photo3" />
          <van-uploader name="photo3" :after-read="afterRead" v-else>
            <img class="order-photo-down-item" src="@/assets/icon/photo.png" />
          </van-uploader>
        </div>
      </div>
    </div>
    <van-button class="btn-submit" text="提交" @click="doSubmit" />
    <van-popup class="play-video" v-model="showPlayVideoPopup" position="right" :close-on-click-overlay="false">
      <play-video :video="video.content" :deleteFlag="deleteFlag" @goBack="hidePlayVideo" @delete="deleteVideo" v-if="showPlayVideoPopup"></play-video>
    </van-popup>
    <van-popup class="preview-photo" v-model="showPreviewPhotoPopup" position="right" :close-on-click-overlay="false">
      <preview-photo :photo="photo" :deleteFlag="deleteFlag" @goBack="hidePreviewPhoto" @delete="deletePhoto" v-if="showPreviewPhotoPopup"></preview-photo>
    </van-popup>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import PlayVideo from '@/components/common/PlayVideo';
import PreviewPhoto from '@/components/common/PreviewPhoto';
import constant from '@/assets/js/constant';
import JSSDKLoader from '@/assets/js/WeChat.js';
import wxApi from '@/api/wx';
import orderApi from '@/api/order';

export default {
  name: 'AddRepair',
  components: {
    HouseCard,
    PlayVideo,
    PreviewPhoto
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      compliantCategoryId: 2,
      showCategoryPopup: false,
      categoryList: [],
      category: {},
      compliantContent: null,
      contact: null,
      mobile: null,
      // 音频的本地ID
      localId: null,
      // 音频的服务器端ID
      serverId: null,
      // 录音标志 true：开始录音 false：停止录音
      recordFlag: false,
      // 播放标志 true：播放语音 false：停止播放
      playFlag: false,
      video: null,
      photo1: null,
      photo2: null,
      photo3: null,
      // 播放视频
      showPlayVideoPopup: false,
      // 预览照片
      showPreviewPhotoPopup: false,
      label: null,
      photo: null,
      deleteFlag: true,
      icon: constant.radioStyle.icon
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
    this.contact = this.curHouse.contact;
    this.mobile = this.curHouse.telephone;
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
      // 房屋卡片
      if (this.$refs.houseCard.showPopup) {
        this.$refs.houseCard.showPopup = false;
        return;
      }
      // 投诉类别
      if (this.showCategoryPopup) {
        this.showCategoryPopup = false;
        return;
      }
      // 播放视频
      if (this.showPlayVideoPopup) {
        this.showPlayVideoPopup = false;
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
    switchHouse: function (house) {
      if (this.curHouse === house) {
        return;
      }
      this.curHouse = house;
      this.contact = this.curHouse.contact;
      this.mobile = this.curHouse.telephone;
    },
    initPage: function () {
      orderApi.getComplaintTypeList(this.compliantCategoryId).then(result => {
        if (result.status === 1) {
          this.categoryList = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
      this.initWeChat();
    },
    initWeChat: function () {
      const me = this;
      JSSDKLoader().then(wx => {
        me.wx = wx;
        const url = location.href.split('#')[0];
        const params = {
          url: url
        };
        wxApi.getSignature(params).then(result => {
          if (result.status === 1) {
            me.wx.config({
              debug: false,
              appId: result.data.appId, // 必填，公众号的唯一标识
              timestamp: result.data.timestamp, // 必填，生成签名的时间戳
              nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
              signature: result.data.signature, // 必填，签名
              jsApiList: ['startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice'] // 必填，需要使用的JS接口列表
            });
            me.wx.ready(function () {
              // 监听录音自动停止
              me.wx.onVoicePlayEnd({
                success: function (res) {
                  me.localId = res.localId;
                  me.recordFlag = false;
                  me.uploadVoice();
                }
              });
              // 监听语音播放完毕
              me.wx.onVoicePlayEnd({
                success: function (res) {
                  me.localId = res.localId;
                  me.playFlag = false;
                }
              });
            });
            me.wx.error(function (res) {
              alert(JSON.stringify(res));
            });
          } else {
            me.$toast(result.data.message);
          }
        });
      });
    },
    showCategory: function () {
      this.showCategoryPopup = true;
    },
    selectCategory: function (item) {
      this.showCategoryPopup = false;
      // 深拷贝
      this.category = JSON.parse(JSON.stringify(item));
    },
    doSubmit: function () {
      if (!this.category.id) {
        this.$toast('请选择投诉类别');
        return;
      }
      if (!this.compliantContent) {
        this.$toast('请输入投诉内容');
        return;
      }
      if (!this.contact) {
        this.$toast('请输入联系人');
        return;
      }
      if (!this.mobile) {
        this.$toast('请输入联系电话');
        return;
      } else {
        const regex = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/;
        if (!regex.test(this.mobile)) {
          this.$toast('请输入有效的联系电话');
          return;
        }
      }
      if (this.video && parseInt(this.video.duration) > 10) {
        this.$toast('视频不能超过10s');
        return;
      }
      this.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '提交中...'
      });
      const params = {
        category: this.compliantCategoryId,
        compliantTypeId: this.category.id,
        compliantContent: this.compliantContent,
        contact: this.contact,
        mobile: this.mobile,
        voiceServerId: this.serverId,
        video: this.video ? this.video.content : null,
        photo1: this.photo1,
        photo2: this.photo2,
        photo3: this.photo3
      };
      orderApi.saveComplaint(this.curHouse.houseId, params).then(result => {
        this.$toast.clear();
        if (result.status === 1) {
          this.$dialog.alert({
            message: '您已成功提交供热投诉，可在待办业务中继续查看。'
          }).then(() => {
            this.$router.push({
              name: 'serviceHall',
              params: {
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
    },
    afterRead: function (file, detail) {
      const me = this;
      if (detail.name === 'video') {
        me.video = file;
        const video = document.createElement('video');
        video.setAttribute('src', file.content);
        video.ondurationchange = function () {
          me.video.duration = this.duration;
        };
      } else {
        // 压缩图片
        me.common.compressImage(file.content, {
          width: 750
        }).then(result => {
          if (detail.name === 'photo1') {
            me.photo1 = result;
          } else if (detail.name === 'photo2') {
            me.photo2 = result;
          } else if (detail.name === 'photo3') {
            me.photo3 = result;
          }
        });
      }
    },
    // 开始录音
    startRecord: function () {
      this.recordFlag = true;
      this.wx.startRecord();
    },
    // 停止录音
    stopRecord: function () {
      const me = this;
      me.wx.stopRecord({
        success: function (res) {
          me.localId = res.localId;
          me.recordFlag = false;
          me.uploadVoice();
        }
      });
    },
    // 播放语音
    playVoice: function () {
      this.playFlag = true;
      this.wx.playVoice({
        localId: this.localId
      });
    },
    // 停止播放
    stopVoice: function () {
      this.playFlag = false;
      this.wx.stopVoice({
        localId: this.localId
      });
    },
    // 上传语音
    uploadVoice: function () {
      const me = this;
      me.wx.uploadVoice({
        localId: me.localId,
        isShowProgressTips: 1,
        success: function (res) {
          me.serverId = res.serverId;
        }
      });
    },
    // 删除语音
    deleteVoice: function () {
      this.localId = null;
      this.serverId = null;
      this.recordFlag = false;
      this.playFlag = false;
    },
    showPlayVideo: function () {
      this.showPlayVideoPopup = true;
    },
    hidePlayVideo: function () {
      this.showPlayVideoPopup = false;
    },
    deleteVideo: function () {
      this.showPlayVideoPopup = false;
      this.video = null;
    },
    showPreviewPhoto: function (label) {
      this.showPreviewPhotoPopup = true;
      this.label = label;
      if (this.label === 'photo1') {
        this.photo = this.photo1;
      } else if (this.label === 'photo2') {
        this.photo = this.photo2;
      } else if (this.label === 'photo3') {
        this.photo = this.photo3;
      }
    },
    hidePreviewPhoto: function () {
      this.showPreviewPhotoPopup = false;
    },
    deletePhoto: function () {
      this.showPreviewPhotoPopup = false;
      if (this.label === 'photo1') {
        this.photo1 = null;
      } else if (this.label === 'photo2') {
        this.photo2 = null;
      } else if (this.label === 'photo3') {
        this.photo3 = null;
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

.order-category {
  width: 630px;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-category-left {
  font-size: 28px;
  color: #999999;
}

.order-category-right {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.order-category-right>span {
  width: 400px;
  font-size: 28px;
  color: #333333;
  text-align: right;
}

.order-category-right>img {
  width: 30px;
  height: 17px;
  margin-left: 20px;
}

.order-content {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.order-content-up {
  font-size: 28px;
  color: #999999;
}

.order-content-down {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.order-content-down>img {
  width: 32px;
  height: 32px;
}

.order-content-down>textarea {
  width: 588px;
  font-size: 28px;
  color: #333333;
  margin-left: 10px;
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
  width: 450px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
}

.order-mobile {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-mobile-left {
  font-size: 28px;
  color: #999999;
}

.order-mobile-right {
  width: 450px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
}

.order-voice {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-voice-left {
  font-size: 28px;
  color: #999999;
}

.order-voice-right {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.order-voice-right>span {
  font-size: 28px;
  color: #ff6016;
}

.order-voice-right>img {
  width: 22px;
  height: 22px;
  margin-left: 20px;
}

.order-video {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-video-left {
  font-size: 28px;
  color: #999999;
}

.order-video-right1 {
  width: 450px;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.order-video-right1>span {
  width: 408px;
  font-size: 28px;
  color: #16baff;
  text-align: right;
}

.order-video-right1>img {
  width: 22px;
  height: 22px;
  margin-left: 20px;
}

.order-video-right2 {
  width: 450px;
  border-radius: 10px;
  padding: 10px 0;
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.order-video-right2>img {
  width: 32px;
  height: 32px;
}

.order-video-right2>span {
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
}

.order-photo {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.order-photo-up {
  font-size: 28px;
  color: #999999;
}

.order-photo-down {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order-photo-down-item {
  width: 200px;
  height: 200px;
}

.btn-submit {
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

.play-video {
  width: 750px;
  height: 100%;
  border-radius: 0;
}

.preview-photo {
  width: 750px;
  height: 100%;
  border-radius: 0;
}
</style>
