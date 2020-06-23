<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>停供确认</span>
    </div>
    <div class="notice">
      用热户（房主）<span class="underline">{{ record.ownerName }}</span>，身份证号：<span class="underline">{{ record.identifyNo }}</span>，是<span class="underline">{{ curHouse.hotAddress }}</span>房主，电话号码为：<span class="underline">{{ record.telephone }}</span>。本人已经阅读并了解以下《暂停供热用户须知》及《停供协议》内容；因本人需要，现申请<span class="underline">{{ curHouse.hotAddress }}</span>{{ other.chargeMonth }}供热年度暂时停供供热。
      <p class="notice-title">暂停供热用户须知</p>
      1、用热户保证上传的所有证件为真实的，所留电话号码为本人常用号码，否则由此引起相关的法律责任及社会影响由用热户自行承担；
      <br />
      2、用热户提交停供申请后，供热公司要及时对停供房屋的阀门进行关闭或断管处理，用热户要积极配合供热公司的工作，并承诺本年度不私自开栓供热；
      <br />
      3、用热户阀门关闭或断管处理完成后，供热公司会通过短信或微信的方式通知用户停供已经办理成功，并将《停供协议》电子版发送给用热户，接收到电子版的《停供协议》代表停供已经办理成功；
      <br />
      4、停供办理成功后，用户需要维护其室内供热设施，保证其完好、无水。一旦出现冻害及其他损失，由用户自行承担责任；
      <br />
      5、对于符合停供条件且已分户的用户，停供办理成功后，如在以后年度，未主动申请恢复供热，供热公司视其延续停供期限，且不需每年再办理停供申请。
      <br />
      6、停供办理成功后，如需要重新恢复供热的，请在当年10月25前到供热公司交纳全额采暖费方可办理。
      <br />
      7、用热户原因造成供热公司不能进行阀门关闭或断管处理的，即停供办理没有成功的，要按照全额采暖费补交。
      <p class="notice-title">停供协议</p>
      一、甲方接受乙方针对<span class="underline">{{ curHouse.hotAddress }}</span>（用户编号<span class="underline">{{ other.userCode }}</span>）房间暂停供热的申请，停供期限为{{ other.sDate }}起至{{ other.eDate }}止，如乙方在以后每年10月15日前未交纳全额采暖费，或未接到甲方的交费通知，甲方视乙方停供期限顺延。
      <br />
      二、暂停供热期间，甲方应对乙方室外的供热设施进行巡查，发现故障要及时告知乙方处理。
      <br />
      三、乙方确保所留联系方式真实有效，如有变更应在变更一周内通知甲方。暂停供热期间，乙方有义务配合甲方对房间内的供热设施进行检查，发现有供热状况应及时通知甲方，并补交相关费用。
      <br />
      四、暂停供热期间，乙方自行对室内供热设施进行维护，保证其完好、无水，并保证房屋的门窗等关闭状态，防止因供热设施发生冻害而造成的财产损失。由于乙方停供造成的供热设施冻裂、上下水管道冻裂、墙面结霜脱落、供水、下水、供电、供气等设施损坏，包括给第三方造成的经济损失均由乙方自行负责并承担赔偿责任。
      <br />
      五、同一供热期内需要恢复供热的，甲方应当给与恢复，并不得向乙方收取采暖费以外的费用。乙方需持本人身份证、停供房间当年全额采暖费收据（发票）到所属的供热站所办理开栓事宜。恢复供热后，乙方在同一供热期内不得再次提出暂停供热。如在以后供热期恢复的要在每年的10月15日前办理。
      <br />
      六、乙方在约定的暂停供热期内，不得擅自开启供热阀门，一经甲方发现，乙方同意补交停供以来所有年度采暖费，并按沈阳市相关规定接受处理。
      <br />
      七、收取供热设施运行基础费根据市政府文件确定的标准和时间执行。
      <br />
      八、甲方在乙方提出停供申请后5个工作日内完成停供操作，乙方应配合甲方的关栓、断管操作；乙方不配合等原因导致延期关栓的，乙方将承担相应责任。
      <br />
      九、甲方完成关栓、断管操作后，本协议生效。
    </div>
    <div class="read">
      <van-checkbox v-model="checked">
        <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
        已阅读<span>《暂停供热用户须知》</span>及<span>《停供协议》</span>
      </van-checkbox>
    </div>
    <van-button class="btn-submit" text="提交" :disabled="!checked" @click="doSubmit" />
  </div>
</template>

<script>
import constant from '@/assets/js/constant';
import orderApi from '@/api/order';

export default {
  name: 'ConfirmStopHeating',
  components: {
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      other: {},
      record: {},
      checked: false,
      icon: constant.radioStyle.icon
    };
  },
  beforeMount: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.other = params.other;
    this.record = params.record;
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
        name: 'addStopHeating',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          other: this.other,
          record: this.record
        }
      });
    },
    doSubmit: function () {
      this.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '提交中...'
      });
      orderApi.saveStopHeating(this.curHouse.houseId, this.record).then(result => {
        this.$toast.clear();
        if (result.status === 1) {
          this.$dialog.alert({
            message: '您已成功提交停供申请，可在待办业务中继续查看。'
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

.notice {
  width: 690px;
  font-size: 28px;
  color: #333333;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 30px 30px 0;
  line-height: 200%;
  text-align: left;
  word-break: break-all;
}

.underline {
  font-weight: bold;
  text-decoration: underline;
  display: inline;
}

.notice-title {
  font-weight: bold;
  margin-top: 30px;
  text-align: center;
}

.read {
  width: 690px;
  margin: 30px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.read img {
  width: 28px;
  height: 28px;
}

.read span {
  color: #ff6016;
}

.btn-submit {
  width: 690px;
  height: 88px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  margin: 30px 30px 0;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}
</style>
