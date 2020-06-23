<template>
  <div id="content" class="content">
    <header>
      <i @click="goBack()"></i>
      <div class="heds-nr"><span>订单支付</span><span>（</span><span>4</span><span>/</span><span>5</span><span>）</span>
      </div>
    </header>
    <div class="order-payment">
      <div class="time">
        <div class="time-title">
          <span>支付剩余时间</span>
        </div>
        <div class="countdown">
          <span class="countdown-bk">{{ timmer.hour1 }}</span>
          <span class="countdown-bk">{{ timmer.hour2 }}</span>
          <span class="maohao">:</span>
          <span class="countdown-bk">{{ timmer.minute1 }}</span>
          <span class="countdown-bk">{{ timmer.minute2 }}</span>
        </div>
      </div>
      <div class="serial-number wxzf-list">
        <span class="span1">订单编号</span><span class="span2">{{ record.orderNo }}</span>
      </div>
      <div class="money wxzf-list">
        <span class="span1">订单金额</span>
        <span class="span3">
          <span>¥</span>
          <span>{{ record.amount }}</span>
        </span>
      </div>
    </div>
    <div class="blb"></div>
    <!--
    <div @click="doWeChatPay()" class="pay-wx">
      <img src="@/assets/icon/pay_icon_wx.png" alt="" />
      <span>微信支付</span>
    </div>
    -->
    <div @click="doCCBPay()" class="pay-wx">
      <img src="@/assets/icon/pay_icon_wx.png" alt="" />
      <span>微信支付</span>
    </div>
    <div @click="doDelete()" class="delete-order">
      <span>删除该订单</span>
    </div>
  </div>
</template>

<script>
import JSSDKLoader from '@/assets/js/WeChat.js';
import chargeApi from '@/api/charge';

export default {
  name: 'PayOrder',
  components: {
  },
  data () {
    return {
      record: {},
      timmer: {
        hour1: null,
        hour2: null,
        minute1: null,
        minute2: null
      }
    };
  },
  created: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.orderId = params.orderId;
    this.source = params.source;
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.record = params.result;
    this.countdown();
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
      this.$dialog.confirm({
        message: '您确定取消支付吗？确定后在支付剩余时间内仍可在待办业务中继续进行支付。'
      }).then(() => {
        this.$router.replace({
          name: 'confirmOrder',
          params: {
            orderId: this.record.orderId,
            source: this.source,
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      });
    },
    // 倒计时
    countdown: function () {
      let createTimeStr = this.record.createTime;
      createTimeStr = createTimeStr.replace(/-/g, '/');
      const createTime = new Date(createTimeStr);
      createTime.setDate(createTime.getDate() + 1);
      let second = Math.floor((createTime.getTime() - new Date().getTime()) / 1000);
      if (second > 0) {
        const hour = Math.floor(second / 3600);
        second %= 3600;
        const minute = Math.floor(second / 60);
        this.timmer.hour1 = Math.floor(hour / 10);
        this.timmer.hour2 = hour % 10;
        this.timmer.minute1 = Math.floor(minute / 10);
        this.timmer.minute2 = minute % 10;
        setTimeout(this.countdown, 30 * 1000);
      } else {
        this.timmer.hour1 = 0;
        this.timmer.hour2 = 0;
        this.timmer.minute1 = 0;
        this.timmer.minute2 = 0;
      }
    },
    // 微信支付
    doWeChatPay: function () {
      const me = this;
      me.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载中...'
      });
      setTimeout(function () {
        me.$toast.clear();
      }, 60000);
      JSSDKLoader().then(wx => {
        const url = location.href.split('#')[0];
        const params = {
          url: url,
          payChannel: 1
        };
        chargeApi.weChatPay(me.record.orderId, params).then(result => {
          if (result.status === 1) {
            wx.config({
              debug: false,
              appId: result.data.jsApiSign.appId, // 必填，公众号的唯一标识
              timestamp: result.data.jsApiSign.timestamp, // 必填，生成签名的时间戳
              nonceStr: result.data.jsApiSign.nonceStr, // 必填，生成签名的随机串
              signature: result.data.jsApiSign.signature, // 必填，签名
              jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表
            });
            wx.ready(function () {
              wx.chooseWXPay({
                timestamp: result.data.jsApiPay.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: result.data.jsApiPay.nonceStr, // 支付签名随机串，不长于 32 位
                package: result.data.jsApiPay.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                signType: result.data.jsApiPay.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: result.data.jsApiPay.paySign, // 支付签名
                success: function (res) {
                  me.$toast.clear();
                  me.$router.replace({
                    name: 'paySuccess',
                    params: {
                      curHouse: me.curHouse,
                      bindHouse: me.bindHouse
                    }
                  });
                },
                fail: function (res) {
                  me.$toast.clear();
                  me.$dialog.alert({
                    message: JSON.stringify(res)
                  });
                },
                cancel: function (res) {
                  me.$toast.clear();
                }
              });
            });
            wx.error(function (res) {
              me.$toast.clear();
              me.$dialog.alert({
                message: JSON.stringify(res)
              });
            });
          } else {
            me.$toast.clear();
            me.$dialog.alert({
              message: result.data.message
            });
          }
        });
      });
    },
    // 龙e付
    doCCBPay: function () {
      const me = this;
      me.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '加载中...'
      });
      setTimeout(function () {
        me.$toast.clear();
      }, 60000);
      JSSDKLoader().then(wx => {
        const url = location.href.split('#')[0];
        const params = {
          url: url,
          payChannel: 2
        };
        chargeApi.weChatPay(me.record.orderId, params).then(result => {
          if (result.status === 1) {
            wx.config({
              debug: false,
              appId: result.data.jsApiSign.appId, // 必填，公众号的唯一标识
              timestamp: result.data.jsApiSign.timestamp, // 必填，生成签名的时间戳
              nonceStr: result.data.jsApiSign.nonceStr, // 必填，生成签名的随机串
              signature: result.data.jsApiSign.signature, // 必填，签名
              jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表
            });
            wx.ready(function () {
              wx.chooseWXPay({
                timestamp: result.data.jsApiPay.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: result.data.jsApiPay.nonceStr, // 支付签名随机串，不长于 32 位
                package: result.data.jsApiPay.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                signType: result.data.jsApiPay.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: result.data.jsApiPay.paySign, // 支付签名
                success: function (res) {
                  me.$toast.clear();
                  me.$router.replace({
                    name: 'paySuccess',
                    params: {
                      curHouse: me.curHouse,
                      bindHouse: me.bindHouse
                    }
                  });
                },
                fail: function (res) {
                  me.$toast.clear();
                  me.$dialog.alert({
                    message: JSON.stringify(res)
                  });
                },
                cancel: function (res) {
                  me.$toast.clear();
                }
              });
            });
            wx.error(function (res) {
              me.$toast.clear();
              me.$dialog.alert({
                message: JSON.stringify(res)
              });
            });
          } else {
            me.$toast.clear();
            me.$dialog.alert({
              message: result.data.message
            });
          }
        });
      });
    },
    doDelete: function () {
      this.$dialog.confirm({
        message: '您确定删除当前订单吗？确定删除后如需交费需要重新进行操作。'
      }).then(() => {
        chargeApi.deleteOrder(this.record.orderId).then(result => {
          if (result.status === 1) {
            if (this.orderId) {
              // 待办业务
              this.$router.replace({
                name: 'orderList',
                params: {
                  source: this.source,
                  curHouse: this.curHouse,
                  bindHouse: this.bindHouse
                }
              });
            } else {
              this.$router.replace({
                name: 'serviceHall',
                params: {
                  curHouse: this.curHouse,
                  bindHouse: this.bindHouse
                }
              });
            }
          } else {
            this.$toast(result.data.message);
          }
        });
      });
    }
  }
};
</script>

<style scoped>
#content{
  width: 750px;display: flex;flex-direction: column;
}
.content{
  background-color: #f4f5fa;height: 1206px;position: relative;
}
header{
   width: 100%;height: 88px;background-color:#e3e3e3;text-align: center;line-height:88px ;position: relative;
}
header i{
  width: 20px;height: 35px;position: absolute;top: 26px;left: 30px;background: url(../../../assets/icon/ty_icon_back.png) no-repeat center;background-size: 20px 36px;
}
header>.heds-nr{
  width: 100%;height: 88px;display: flex;flex-direction: row;justify-content: center;
}
header>.heds-nr>span{
  font-size: 36px;color: #333333;
}
.order-payment{
  width: 690px;margin: 30px 30px 0 30px;display: flex;flex-direction: column;padding: 0 30px;box-sizing: border-box;border-radius: 10px 10px 0 0;background-color: #fff;
}
.order-payment .time{
  display: flex;flex-direction: column;align-items: center;
}
.order-payment .time .time-title{
  font-size: 29px;color: #999;margin-top: 30px;
}
.order-payment .time .countdown{
  width: 630px; font-size: 29px;color: #fff;margin: 20px 0 30px 0;display: flex;flex-direction: row;justify-content: center;
}
.order-payment .time .countdown .countdown-bk{
  width:38px;height: 38px;background-color: #363636;display: inline-block;line-height: 38px;text-align: center;margin: 0 4px;
}
.order-payment .time .countdown .maohao{
  color: #000;
}
.order-payment .wxzf-list{
  display: flex;flex-direction: row;justify-content: space-between;height: 88px;border-top: 1px solid #f7f7f7;align-items: center;justify-content: space-between;
}
.order-payment .wxzf-list>.span1{
  font-size: 28px;color: #999;
}
.order-payment .wxzf-list>.span2{
  font-size: 28px;color: #333;
}
.order-payment .wxzf-list>.span3{
  font-size: 36px;color: #ff6016;display: flex;flex-direction: row;
}
.blb{
  width: 690px;height: 36px;background-color: palegreen;margin: 0 30px;background: url(../../../assets/icon/invoice-foot.png) no-repeat center ;background-size: 690px 36px;
}
.pay-wx{
  width: 690px;height: 88px;border-radius: 10px; background-color: #fff;margin: 30px 30px 0 30px;display: flex;flex-direction: row;justify-content: center;align-items: center;
}
.pay-wx>img{
  width: 64px;height: 64px;
}
.pay-wx>span{
  font-size: 32px;color: #363636;margin-left: 20px;
}
.delete-order{
  width: 690px;margin: 0 30px;text-align: center;position: absolute;bottom: 28px;left: 0;
}
.delete-order>span{
  font-size: 26px;color: #666;
}
</style>
