<template>
  <div class="content">
    <div class="tab">
      <span :class="companyFlag ? 'tab-item-active': 'tab-item'" @click="setCompanyFlag(true)">公司简介</span>
      <span :class="companyFlag ? 'tab-item': 'tab-item-active'" @click="setCompanyFlag(false)">合作伙伴</span>
    </div>
    <div class="company" v-if="companyFlag">
      <span class="company-content">三六六移动互联科技有限公司（以下简称“三六六公司”）是一家专注于移动互联网应用、企业信息化管理、节能技术研发的高科技公司。公司成立于2015年，作为联美量子股份有限公司（股票代码600167，以下简称“联美控股”）的成员企业，凭借集团在供热、地产、传媒等领域多年积累的技术和人才优势，通过将移动互联网与上述传统产业的融合，在节能技术应用、企业管理与控制、自动化与信息化融合、社区服务、移动互联网应用与拓展等多方面有着全面、优化的解决方案。</span>
      <img class="company-icon" src="@/assets/icon/company1.jpg" />
      <span class="company-content">“366e生活”微信公众平台是三六六公司为同为联美集团成员企业的浑南热力、新北热电、国惠环保、沈水湾清洁能源、国润低碳、国新环保等六家供热公司的80万沈城用户打造的，集供热缴费、退费补缴、报修投诉、停供恢复、信息修改等全部供热业务办理的网上服务平台，真正做到了足不出户、温暖到家。同时平台充分发挥联美集团的规模、技术、人才优势，以供热服务为先导，以生活服务为拓展，实现由单一供热服务向综合社区服务的转变，逐步开展生活超市、专业维修、周边优惠、上门服务、物业服务、金融理财等生活服务，打造线上线下同步、集团内外并举的联美大社区。</span>
      <img class="company-icon" src="@/assets/icon/company2.jpg" />
    </div>
  </div>
</template>

<script>
import JSSDKLoader from '@/assets/js/WeChat.js';
import wxApi from '@/api/wx';
import otherApi from '@/api/other';

export default {
  name: 'AboutUs',
  components: {
  },
  data () {
    return {
      companyFlag: true,
      company: {},
      partnerList: []
    };
  },
  beforeMount: function () {
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
    },
    initPage: function () {
      otherApi.getCompany().then(result => {
        if (result.status === 1) {
          this.company = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
      otherApi.getPartnerList().then(result => {
        if (result.status === 1) {
          this.partnerList = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    setCompanyFlag: function (companyFlag) {
      this.companyFlag = companyFlag;
    }
  }
};
</script>

<style scoped>
.content {
  width: 750px;
  background-color: #f4f5fa;
}

.tab {
  width: 750px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 15px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  font-size: 30px;
  color: #333333;
  padding: 15px 0;
}

.tab-item-active {
  font-size: 30px;
  color: #ff6016;
  background: url(../../assets/icon/maintain_sm_icon_xz.png) no-repeat bottom center;
  background-size: 40px 4px;
  padding: 15px 0;
}

.company {
  width: 750px;
  background-color: #ffffff;
  padding: 20px 30px;
}

.company-icon {
  width: 690px;
  height: 350px;
  margin-top: 20px;
}

.company-content {
  font-size: 28px;
  color: #333333;
  margin-top: 20px;
  line-height: 150%;
  text-align: left;
  text-indent: 60px;
}
</style>
