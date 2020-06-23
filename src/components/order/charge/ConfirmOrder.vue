<template>
  <div id="wrap">
    <div class="header">
      <img class="goBack" @click="goBack()" src="@/assets/icon/ty_icon_back.png"/>
      <div class="title">{{ this.payParams ? '供热交费单（' + this.payParams.orderNo + '）详情' : '确认订单（3/5）' }}</div>
    </div>
    <house-card :curHouse="curHouse"></house-card>
    <div class="category" v-if="isCurrentYear == 1 && isHouse == 1">
      <img src="@/assets/icon/pay_chaeckbox_selected.png">
      <span>{{ paymentMethodText }}</span>
    </div>
    <div class="yearCard" v-for="period in payingPeriod" :key="period.chargeYear">
      <div class="orderIntro">
        <img src="@/assets/icon/ty_icon_clock.png">
        <div class="year">{{ period.chargeYear }}年度</div>
        <p class="sqtLabel">交费面积</p>
        <span class="sqtValue">{{ period.chargeArea }}m²</span>
      </div>
      <div class="invoInfo" v-if="period.visibility.selfPayCard">
        <div class="title"></div>
        <div class="content">
          <div class="line u">
            <div class="column bold first">自费</div>
            <div class="column bold">{{ period.selfPay.area }}m²</div>
            <div class="column bold">{{ period.ceSubsidyPrice }}元/m²</div>
            <div class="column bold">{{ period.selfPay.chargeAmount }}元</div>
          </div>
          <div class="line">
            <div class="column first">交费方式</div>
            <div class="column">交费面积</div>
            <div class="column">交费单价</div>
            <div class="column">交费金额</div>
          </div>
          <div class="line">
            <div class="label">发票抬头</div>
            <div class="input">{{ period.selfPay.title }}</div>
          </div>
        </div>
        <div class="bottom"><img src="@/assets/icon/invoice-foot.png"></div>
      </div>

      <div class="invoInfo" v-if="period.visibility.reimburseCard" v-for="(reimbursePart, index) in period.reimbursePartArray" :key="index">
        <div class="title"></div>
        <div class="content">
          <div class="line u">
            <div class="column bold first">{{ isHouse == 0 ? '非住宅' : '报销' }}</div>
            <div class="column bold">{{ reimbursePart.area }}m²</div>
            <div class="column bold">{{ period.price }}元/m²</div>
            <div class="column bold">{{ reimbursePart.chargeAmount }}元</div>
          </div>
          <div class="line">
            <div class="column first">交费方式</div>
            <div class="column">交费面积</div>
            <div class="column">交费单价</div>
            <div class="column">交费金额</div>
          </div>
          <div class="line">
            <div class="label">发票抬头</div>
            <div class="input">{{ reimbursePart.title }}</div>
          </div>
          <div class="line" v-if="reimbursePart.titleCategory == 'business'">
            <div class="label"><span>*</span>税号</div>
            <div class="input">{{ reimbursePart.taxNo }}</div>
          </div>
          <div class="line" v-if="reimbursePart.titleCategory == 'business' && reimbursePart.showMoreFields">
            <div class="label">开户银行</div>
            <div class="input">{{ reimbursePart.bank }}</div>
          </div>
          <div class="line" v-if="reimbursePart.titleCategory == 'business' && reimbursePart.showMoreFields">
            <div class="label">账号</div>
            <div class="input">{{ reimbursePart.bankAccount }}</div>
          </div>
          <div class="line" v-if="reimbursePart.titleCategory == 'business' && reimbursePart.showMoreFields">
            <div class="label">地址</div>
            <div class="input">{{ reimbursePart.address }}</div>
          </div>
          <div class="line" v-if="reimbursePart.titleCategory == 'business' && reimbursePart.showMoreFields">
            <div class="label">电话</div>
            <div class="input">{{ reimbursePart.mobile }}</div>
          </div>
          <div class="btnShowMore" v-if="reimbursePart.titleCategory == 'business'">
            <img src="@/assets/icon/ty_icon_retract.png" @click="showMoreField(reimbursePart)" v-if="reimbursePart.showMoreFields">
            <img src="@/assets/icon/ty_icon_unfold.png" @click="showMoreField(reimbursePart)" v-else>
          </div>
          <div class="line u">
            <div class="label">报销人</div>
            <div class="input">{{ reimbursePart.reimbursementApplicant }}</div>
          </div>
        </div>
        <div class="bottom"><img src="@/assets/icon/invoice-foot.png"></div>
      </div>
    </div>
    <div class="summary">
      <div class="invoQty">
        <span class="span1">发票数量</span>
        <span class="span2">{{ invoQty }}</span>
        <span class="span3">张</span>
      </div>
      <div class="orderAmount">
        <span class="span1">订单金额</span>
        <span class="span2">{{ orderAmount }}</span>
        <span class="span3">元</span>
      </div>
    </div>
    <van-button class="btnNext" text="立即支付" @click="dopay" />
    <div class="remark" v-if="!orderId">订单有效期<span>24小时</span>，逾期自动删除</div>
    <span class="time" v-if="orderId">剩余支付时间：<font color="red">{{ time }}</font></span>
    <div class="btn-delete" @click="doDelete" v-if="orderId">
      <img src="@/assets/icon/ty_icon_del.png" />
      <span>删除该订单</span>
    </div>
  </div>
</template>

<script>
import chargeApi from '@/api/charge';
import HouseCard from '@/components/common/HouseCard';

export default {
  name: 'ConfirmOrder',
  components: {
    [HouseCard.name]: HouseCard
  },
  data () {
    return {
      orderId: null,
      source: null,
      curHouse: {},
      bindHouse: [],
      isCurrentYear: null,
      isHouse: null,
      paymentMethod: null,
      previousPeriod: [],
      payingPeriod: [],
      paymentMethodText: null,
      invoQty: 0,
      orderAmount: 0.00,
      payParams: null,
      time: null,
      disabled: false
    };
  },
  created: function () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.orderId = params.orderId;
    this.source = params.source;
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.isCurrentYear = params.isCurrentYear;
    this.isHouse = params.isHouse;
    this.paymentMethod = params.paymentMethod;
    this.previousPeriod = params.previousPeriod;
    this.payingPeriod = params.payingPeriod;
    this.previousYear = params.previousYear;
    this.validateNameFlag = params.validateNameFlag;
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
      if (this.orderId) {
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
          name: 'editInvoice',
          params: {
            curHouse: this.curHouse,
            bindHouse: this.bindHouse,
            isCurrentYear: this.isCurrentYear,
            isHouse: this.isHouse,
            paymentMethod: this.paymentMethod,
            previousPeriod: this.previousPeriod,
            payingPeriod: this.payingPeriod,
            previousYear: this.previousYear,
            validateNameFlag: this.validateNameFlag
          }
        });
      }
    },
    showMoreField: function (record) {
      record.showMoreFields = !record.showMoreFields;
    },
    initPage: function () {
      if (this.orderId) {
        chargeApi.getOrderInfo(this.orderId).then(result => {
          this.isCurrentYear = result.isCurrentYear;
          this.isHouse = result.isHouse;
          this.payingPeriod = result.payingPeriod;
          this.paymentMethodText = result.paymentMethodText;
          this.invoQty = result.invoQty;
          this.orderAmount = result.totalAmount;
          this.payParams = result.payParams;
          // 倒计时
          this.countdown();
        });
        return;
      }

      let paymentMethod = this.paymentMethod;
      if (paymentMethod === 'reference') {
        if (this.payingPeriod[0].visibility.selfPayCard) {
          if (this.payingPeriod[0].visibility.reimburseCard) {
            paymentMethod = 'reimbursePart';
          } else {
            paymentMethod = 'selfPay';
          }
        } else {
          paymentMethod = 'reimburseAll';
        }
      }

      if (paymentMethod === 'selfPay') {
        let totalAmount = 0;
        for (let idx = 0; idx < this.payingPeriod.length; idx++) {
          const period = this.payingPeriod[idx];
          period.selfPay.chargeAmount = this.float.multiply(period.ceSubsidyPrice, period.selfPay.area);
          period.amount = period.selfPay.chargeAmount;
          totalAmount = this.float.add(totalAmount, period.selfPay.chargeAmount);
        }
        this.invoQty = this.payingPeriod.length;
        this.orderAmount = totalAmount;
        this.paymentMethodText = '全部自费';
      } else if (paymentMethod === 'reimbursePart') {
        let partQty = 0; // 报销发票数量
        const selfQty = this.payingPeriod.length; // 自费发票数量
        let totalAmount = 0; // 订单总金额
        for (let idx = 0; idx < this.payingPeriod.length; idx++) {
          const period = this.payingPeriod[idx];
          let periodAmount = 0;
          // 自费部分
          period.selfPay.chargeAmount = this.float.multiply(period.ceSubsidyPrice, period.selfPay.area);
          totalAmount = this.float.add(totalAmount, period.selfPay.chargeAmount);
          periodAmount = this.float.add(periodAmount, period.selfPay.chargeAmount);
          // 报销部分
          const reimbursePartQty = period.reimbursePartArray.length;
          partQty += reimbursePartQty;
          for (let i = 0; i < reimbursePartQty; i++) {
            const reimbursePart = period.reimbursePartArray[i];
            reimbursePart.chargeAmount = this.float.multiply(period.price, reimbursePart.area);
            totalAmount = this.float.add(totalAmount, reimbursePart.chargeAmount);
            periodAmount = this.float.add(periodAmount, reimbursePart.chargeAmount);
          }
          period.amount = periodAmount;
        }
        this.invoQty = selfQty + partQty;
        this.orderAmount = totalAmount;
        this.paymentMethodText = '部分报销';
      } else if (paymentMethod === 'reimburseAll') {
        let partQty = 0; // 报销发票数量
        let totalAmount = 0; // 订单总金额
        for (let idx = 0; idx < this.payingPeriod.length; idx++) {
          const period = this.payingPeriod[idx];
          let periodAmount = 0;
          const reimbursePartQty = period.reimbursePartArray.length;
          partQty += reimbursePartQty;
          for (let i = 0; i < reimbursePartQty; i++) {
            const reimbursePart = period.reimbursePartArray[i];
            if (period.isPartOwe === 1) {
              reimbursePart.chargeAmount = period.totalAccount;
            } else {
              reimbursePart.chargeAmount = this.float.multiply(period.price, reimbursePart.area);
            }
            totalAmount = this.float.add(totalAmount, reimbursePart.chargeAmount);
            periodAmount = this.float.add(periodAmount, reimbursePart.chargeAmount);
          }
          period.amount = periodAmount;
        }
        this.invoQty = partQty;
        this.orderAmount = totalAmount;
        this.paymentMethodText = '全部报销';
      }
    },
    dopay: function () {
      const me = this;
      if (me.disabled) {
        return;
      }
      me.disabled = true;
      setTimeout(function () {
        me.disabled = false;
      }, 3000);
      if (me.orderId) {
        me.$router.replace({
          name: 'payOrder',
          params: {
            result: me.payParams,
            orderId: me.orderId,
            source: me.source,
            curHouse: me.curHouse,
            bindHouse: me.bindHouse
          }
        });
      } else {
        let paymentMethod = this.paymentMethod;
        if (paymentMethod === 'reference') {
          if (this.payingPeriod[0].visibility.selfPayCard) {
            if (this.payingPeriod[0].visibility.reimburseCard) {
              paymentMethod = 'reimbursePart';
            } else {
              paymentMethod = 'selfPay';
            }
          } else {
            paymentMethod = 'reimburseAll';
          }
        }
        chargeApi.saveOrder(me.curHouse.houseId, {
          isCurrentYear: me.isCurrentYear,
          isHouse: me.isHouse,
          invoQty: me.invoQty,
          orderAmount: me.orderAmount,
          paymentMethod: paymentMethod,
          payingPeriod: me.payingPeriod
        }).then(result => {
          if (result.status === 1) {
            me.$router.replace({
              name: 'payOrder',
              params: {
                result: result.data,
                source: 'serviceHall',
                curHouse: me.curHouse,
                bindHouse: me.bindHouse
              }
            });
          } else {
            me.$toast(result.data.message);
          }
        });
      }
    },
    doDelete: function () {
      this.$dialog.confirm({
        message: '您确定删除当前订单吗？确定删除后如需交费需要重新进行操作。'
      }).then(() => {
        chargeApi.deleteOrder(this.orderId).then(result => {
          if (result.status === 1) {
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
            this.$toast(result.data.message);
          }
        });
      });
    },
    // 倒计时
    countdown: function () {
      let createTimeStr = this.payParams.createTime;
      createTimeStr = createTimeStr.replace(/-/g, '/');
      const createTime = new Date(createTimeStr);
      createTime.setDate(createTime.getDate() + 1);
      let second = Math.floor((createTime.getTime() - new Date().getTime()) / 1000);
      if (second > 0) {
        const hour = Math.floor(second / 3600);
        second %= 3600;
        const minute = Math.floor(second / 60);
        this.time = (hour >= 10 ? hour : '0' + hour) + ':' + (minute >= 10 ? minute : '0' + minute);
        setTimeout(this.countdown, 30 * 1000);
      } else {
        this.time = '00:00';
      }
    }
  }
};
</script>

<style scoped>
  #wrap {
    width: 750px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    flex-flow: flex-start;
    background: #f4f5fa;
  }
  .header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex-flow: flex-start;
    width: 750px;
    height: 88px;
    background-color: #e3e3e3;
    font-size: 36px;
    color: #333333;
    text-align: center;
    line-height: 88px;
    align-items: center;
  }
  .header .goBack {
    width: 20px;
    height: 35px;
    margin-left: 30px;
    flex-wrap: nowrap;
    flex-flow: flex-start;
    align-items: center;
  }
  .header .title {
    width: 700px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex-flow: flex-start;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: #333333;
  }
  .category {
    margin-left: 30px;
    margin-top: 20px;
    width: 690px;
    height: 88px;
    background: #fff;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .category span {
    margin-left: 20px;
    font-size: 28px;
    color: #333333;
  }
  .category img {
    width: 28px;
    height: 28px;
  }
  .orderIntro {
    margin-left: 30px;
    margin-top: 20px;
    width: 690px;
    height: 100px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: #fff;
  }
  .orderIntro img {
    margin-left: 30px;
    width: 60px;
    height: 60px;
  }
  .orderIntro .year {
    margin-left: 30px;
    font-size: 30px;
    color: #333333;
    width: 310px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .orderIntro .sqtLabel {
    width: 140px;
    color: #999999;
    font-size: 26px;
  }
  .orderIntro .sqtValue {
    margin-right: 30px;
    color: #333333;
  }
  .invoInfo {
    width: 690px;
    margin-left: 30px;
    margin-top: 20px;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  .invoInfo .title {
    height: 24px;
    width: 690px;
    background: linear-gradient(to right, #ff8850, #ff6016);
    border-radius: 50px;
  }
  .invoInfo .content {
    width: 666px;
    margin: 0 17px;
    background-color: #fff;
  }
  .invoInfo .line {
    border-top: 1px solid #e8e8e8;
    width: 100%;
    height: 88px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .line .column {
    width: 150px;
    font-size: 26px;
    color: #999999;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-left: 1px solid #999999;
  }
  .line .first {
    margin-left: 30px;
    border: none;
  }
  .line .bold {
    font-size: 26px;
    color: #333333;
  }
  .u {
    border-top: none;
  }
  .invoInfo .line .label {
    width: 140px;
    margin-left: 30px;
    color: #999999;
    font-size: 28px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .invoInfo .line .label span{
    color: red;
  }
  .invoInfo .line .input {
    width: 430px;
    color: #333333;
    font-size: 28px;
    margin-right: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .invoInfo .line .input input {
    height: 66px;
    width: 412px;
    font-size: 28px;
    color: #333333;
    border: 1px solid #e8e8e8;
    text-align: right;
    padding-right: 20px;
  }
  .u {
    border-top: none;
  }
  .btnShowMore {
    width: 100%;
    height: 88px;
    background-color: #fff;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .btnShowMore img {
    width: 30px;
    height: 28px;
  }
  .invoInfo .bottom {
    width: 666px;
    height: 36px;
    overflow: hidden;
  }
  .invoInfo .bottom img {
    width: 666px;
    height: 36px;
  }
  .summary {
    width: 690px;
    height: 100px;
    margin-left: 30px;
    margin-top: 20px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
  }
  .summary .invoQty {
    width: 340px;
    margin-left: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .summary .span1{
    font-size: 28px;
    color: #999999;
  }
  .summary .span2{
    font-size: 34px;
    color: #ff6016;
    margin: 0 20px;
  }
  .summary .span3{
    font-size: 28px;
    color: #333333;
  }
  .summary .orderAmount {
    width: 350px;
    margin-right: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .btnNext {
    width: 690px;
    height: 90px;
    margin-top: 20px;
    margin-left: 30px;
    background: linear-gradient(to right, #ff8850, #ff6016);
    color: #fff;
    font-size: 32px;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .remark {
    margin-top: 20px;
    font-size: 26px;
    color: #333333;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .remark span {
    font-size: 30px;
    color: #ff6016;
  }

.time {
  width: 690px;
  font-size: 28px;
  color: #999999;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
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
