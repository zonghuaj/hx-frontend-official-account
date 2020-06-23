<template>
  <div class="nav">
    <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
    <span>{{ title }}</span>
  </div>
</template>

<script>
import JSSDKLoader from '@/assets/js/WeChat.js';
import wxApi from '@/api/wx';
import { houseBind } from '@/api/house';

export default {
  name: 'HeadCard',
  components: {
  },
  props: [
    'title'
  ],
  data () {
    return {
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
      const routeName = this.$route.name;
      if (routeName === 'card' || routeName === 'address' || routeName === 'blueAddress' || routeName === 'floorNumber' || routeName === 'phoneNumber') {
        this.$router.push({
          name: 'company',
          params: {
            label: this.label,
            houseId: this.houseId,
            company: this.company,
            searchMethod: this.searchMethod
          }
        });
      } else if (routeName === 'company') {
        this.$router.push({
          name: 'houseList',
          params: {
            label: this.label,
            houseId: this.houseId
          }
        });
      } else {
        if (this.label === 'historyOrderList' || this.label === 'houseList' || this.label === 'invoiceList') {
          this.$router.push({
            name: 'profile'
          });
        } else if (this.label === 'switchHouse') {
          houseBind().then((res) => {
            const houseList = res.data.data;
            if (houseList.length === 0) {
              JSSDKLoader().then(wx => {
                const url = location.href.split('#')[0];
                const params = {
                  url: url
                };
                wxApi.getSignature(params).then(result => {
                  if (result.status === 1) {
                    wx.config({
                      debug: false,
                      appId: result.data.appId, // 必填，公众号的唯一标识
                      timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                      nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
                      signature: result.data.signature, // 必填，签名
                      jsApiList: ['closeWindow'] // 必填，需要使用的JS接口列表
                    });
                    wx.ready(function () {
                      wx.closeWindow();
                    });
                    wx.error(function (res) {
                      alert(JSON.stringify(res));
                    });
                  } else {
                    this.$toast(result.data.message);
                  }
                });
              });
            } else {
              let house = null;
              for (let index = 0; index < houseList.length; index++) {
                if (this.houseId === houseList[index].houseId) {
                  house = houseList[index];
                  break;
                }
              }
              if (house) {
                this.$router.replace({
                  name: 'serviceHall',
                  params: {
                    curHouse: house,
                    bindHouse: houseList
                  }
                });
              } else {
                this.$toast('请选择房屋');
              }
            }
          });
        } else if (this.label === 'editInvoice' || this.label === 'addRepair' || this.label === 'addComplain' || this.label === 'addStopHeating' || this.label === 'serviceHall') {
          JSSDKLoader().then(wx => {
            const url = location.href.split('#')[0];
            const params = {
              url: url
            };
            wxApi.getSignature(params).then(result => {
              if (result.status === 1) {
                wx.config({
                  debug: false,
                  appId: result.data.appId, // 必填，公众号的唯一标识
                  timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                  nonceStr: result.data.nonceStr, // 必填，生成签名的随机串
                  signature: result.data.signature, // 必填，签名
                  jsApiList: ['closeWindow'] // 必填，需要使用的JS接口列表
                });
                wx.ready(function () {
                  wx.closeWindow();
                });
                wx.error(function (res) {
                  alert(JSON.stringify(res));
                });
              } else {
                this.$toast(result.data.message);
              }
            });
          });
        }
      }
    }
  }
};
</script>

<style scoped>
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
</style>
