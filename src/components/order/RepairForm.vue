<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>供热报修（{{ record.documentNo }}）单详情</span>
    </div>
    <house-card :curHouse="curHouse"></house-card>
    <div class="order">
      <div class="order-title" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/repairs_icon_bxxx.png" />
        <span>报修信息</span>
      </div>
      <div class="order-category">
        <span class="order-category-left">报修类别</span>
        <span class="order-category-right">{{ record.type }}</span>
      </div>
      <div class="order-content">
        <span class="order-content-up">报修内容</span>
        <span class="order-content-down">{{ record.compliantContent }}</span>
      </div>
      <div class="order-contact" v-if="expanded">
        <span class="order-contact-left">联系人</span>
        <span class="order-contact-right">{{ record.contact }}</span>
      </div>
      <div class="order-mobile" v-if="expanded">
        <span class="order-mobile-left">联系电话</span>
        <span class="order-mobile-right">{{ record.mobile }}</span>
      </div>
      <div class="order-voice" v-if="expanded">
        <span class="order-voice-left">语音描述</span>
        <audio class="order-voice-right" controls :src="record.voiceAddress" v-if="record.voiceAddress"></audio>
      </div>
      <div class="order-video" v-if="expanded">
        <span class="order-video-left">视频信息</span>
        <span class="order-video-right" @click="showPlayVideo" v-if="record.videoAddress">播放视频</span>
      </div>
      <div class="order-photo" v-if="expanded">
        <span class="order-photo-up">现场照片</span>
        <div class="order-photo-down">
          <van-image class="order-photo-down-item" :src="record.photo1" fit="contain" @click="showPreviewPhoto('photo1')" v-if="record.photo1" />
          <van-image class="order-photo-down-item" :src="record.photo2" fit="contain" @click="showPreviewPhoto('photo2')" v-if="record.photo2" />
          <van-image class="order-photo-down-item" :src="record.photo3" fit="contain" @click="showPreviewPhoto('photo3')" v-if="record.photo3" />
        </div>
      </div>
      <div class="toggle">
        <img src="@/assets/icon/ty_icon_retract.png" @click="toggle" v-if="expanded">
        <img src="@/assets/icon/ty_icon_unfold.png" @click="toggle" v-else>
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
    <van-popup class="play-video" v-model="showPlayVideoPopup" position="right" :close-on-click-overlay="false">
      <play-video :video="record.videoAddress" :deleteFlag="deleteFlag" @goBack="hidePlayVideo" v-if="showPlayVideoPopup"></play-video>
    </van-popup>
    <van-popup class="preview-photo" v-model="showPreviewPhotoPopup" position="right" :close-on-click-overlay="false">
      <preview-photo :photo="photo" :deleteFlag="deleteFlag" @goBack="hidePreviewPhoto" v-if="showPreviewPhotoPopup"></preview-photo>
    </van-popup>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import PlayVideo from '@/components/common/PlayVideo';
import PreviewPhoto from '@/components/common/PreviewPhoto';
import orderApi from '@/api/order';

export default {
  name: 'RepairForm',
  components: {
    HouseCard,
    PlayVideo,
    PreviewPhoto
  },
  data () {
    return {
      source: null,
      curHouse: {},
      bindHouse: [],
      record: {},
      expanded: false,
      // 播放视频
      showPlayVideoPopup: false,
      // 预览照片
      showPreviewPhotoPopup: false,
      photo: null,
      deleteFlag: false
    };
  },
  beforeMount () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.compliantId = params.compliantId;
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
      orderApi.getComplaint(this.compliantId).then(result => {
        if (result.status === 1) {
          this.record = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    toggle: function () {
      this.expanded = !this.expanded;
    },
    doDelete: function () {
      this.$dialog.confirm({
        message: '您确认要取消供热报修吗？'
      }).then(() => {
        this.$toast.loading({
          duration: 0,
          forbidClick: true,
          message: '申请取消中...'
        });
        orderApi.deleteComplaint(this.compliantId).then(result => {
          this.$toast.clear();
          if (result.status === 1) {
            this.$dialog.alert({
              message: '您已取消供热报修'
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
      orderApi.urgeComplaint(this.compliantId).then(result => {
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
    showPlayVideo: function () {
      this.showPlayVideoPopup = true;
    },
    hidePlayVideo: function () {
      this.showPlayVideoPopup = false;
    },
    showPreviewPhoto: function (label) {
      this.showPreviewPhotoPopup = true;
      if (label === 'photo1') {
        this.photo = this.record.photo1;
      } else if (label === 'photo2') {
        this.photo = this.record.photo2;
      } else if (label === 'photo3') {
        this.photo = this.record.photo3;
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
  width: 480px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  width: 630px;
  font-size: 28px;
  color: #333333;
  margin-top: 20px;
  text-align: left;
  word-wrap: break-word;
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
  width: 480px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  width: 480px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  width: 480px;
  height: 60px;
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

.order-video-right {
  width: 480px;
  font-size: 28px;
  color: #16baff;
  margin-left: 20px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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

.toggle {
  padding: 20px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.toggle>img {
  width: 30px;
  height: 28px;
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
