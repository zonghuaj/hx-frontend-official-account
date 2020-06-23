<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>发票预览</span>
    </div>
    <div class="fp">
      <div class="fp-head" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/fp_icon_image.png" />
        <span>发票图片</span>
      </div>
      <div class="fp-body">
        <img :src="invoice.previewUrl" @click="doPreview" />
      </div>
    </div>
    <div class="fp-btn">
      <van-button text="分享发票地址" @click="doShowWXYX" />
    </div>
    <div class="wx-yx" v-if="showWXYX">
      <img src="@/assets/icon/fp_icon_wx.png" @click="doShare" />
      <img src="@/assets/icon/fp_icon_yx.png" @click="doShowYX" />
    </div>
    <div class="yx" v-if="showYX">
      <div class="yx-icon"><img src="@/assets/icon/fp_icon_yx_sm.png" /></div>
      <input type="text" placeholder="请输入邮箱地址" v-model="receiver" />
      <div class="yx-send" @click="doSend">发送</div>
    </div>
  </div>
</template>

<script>
import { ImagePreview } from 'vant';
import JSSDKLoader from '@/assets/js/WeChat.js';
import wxApi from '@/api/wx';
import invoiceApi from '@/api/invoice';

export default {
  name: 'PreviewInvoice',
  components: {},
  data () {
    return {
      source: null,
      curHouse: {},
      bindHouse: [],
      invoice: {},
      receiver: null,
      showWXYX: false,
      showYX: false,
      // 图片预览
      imagePreview: null
    };
  },
  beforeMount: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.orderId = params.orderId;
    this.detailId = params.detailId;
    this.source = params.source;
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.invoice = params.invoice;
    this.initWeChat();
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
      // 图片预览
      if (this.imagePreview) {
        this.imagePreview.close();
        return;
      }
      if (this.orderId) {
        // 待办业务-供热交费-供热交费详情
        this.$router.push({
          name: 'chargeForm',
          params: {
            orderId: this.orderId,
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      } else if (this.detailId) {
        // 完结业务-供热交费-供热交费详情
        this.$router.push({
          name: 'historyChargeForm',
          params: {
            detailId: this.detailId,
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      } else {
        // 发票查询
        this.$router.push({
          name: 'invoiceList',
          params: {
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      }
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
              jsApiList: ['updateAppMessageShareData'] // 必填，需要使用的JS接口列表
            });
            me.wx.ready(function () {
              // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
              me.wx.updateAppMessageShareData({
                title: '发票', // 分享标题
                desc: '发票', // 分享描述
                link: me.invoice.pdfUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: 'http://wxpay.366elife.com/static/fp.png', // 分享图标
                success: function (res) {
                  // 设置成功
                },
                fail: function (res) {
                  alert(JSON.stringify(res));
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
    // 图片预览
    doPreview: function () {
      const me = this;
      me.imagePreview = ImagePreview({
        images: [
          me.invoice.previewUrl
        ],
        closeOnPopstate: true,
        onClose () {
          me.imagePreview = null;
        }
      });
    },
    doShowWXYX: function () {
      this.showWXYX = true;
    },
    doShare: function () {
      this.$dialog.alert({
        message: '请点击右上角“...”打开微信菜单，然后点击“发送给朋友”'
      });
    },
    doShowYX: function (item) {
      this.showYX = true;
    },
    doSend: function () {
      const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!this.receiver) {
        this.$toast('请输入收件人！');
        return;
      } else if (!regEmail.test(this.receiver)) {
        this.$toast('请输入有效的邮箱！');
        return;
      }
      this.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '发送中...'
      });
      const params = {
        receiver: this.receiver
      };
      invoiceApi.sendInvoice(this.invoice.poInvoiceId, params).then(result => {
        this.$toast.clear();
        if (result.status === 1) {
          this.$dialog.alert({
            message: '发送发票成功'
          });
        } else {
          this.$toast(result.data.message);
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

.fp {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.fp-head {
  width: 690px;
  height: 98px;
  background-color: #f8f8f8;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.fp-head>img {
  width: 32px;
  height: 32px;
  margin-left: 30px;
}

.fp-head>span {
  font-size: 32px;
  color: #333333;
  margin-left: 10px;
}

.fp-body {
  padding: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.fp-body>img {
  width: 630px;
  height: 356px;
}

.fp-btn {
  width: 690px;
  height: 88px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.fp-btn>button {
  width: 350px;
  height: 88px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}

.wx-yx {
  width: 690px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.wx-yx>img {
  width: 160px;
  height: 160px;
}

.yx {
  width: 690px;
  height: 88px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.yx .yx-icon {
  width: 120px;
  height: 44px;
  border-right: 1px solid #e8e8e8;
}

.yx .yx-icon>img {
  width: 44px;
  height: 44px;
}

.yx>input {
  width: 440px;
  height: 88px;
  font-size: 28px;
  padding-left: 40px;
  box-sizing: border-box;
}

.yx .yx-send {
  width: 120px;
  height: 44px;
  font-size: 28px;
  font-weight: bold;
  color: #ff6016;
  border-left: 1px solid #e8e8e8;
}
</style>
