<template>
  <div id="wrap">
    <div class="header">
      <img class="goBack" @click="goBack()" src="@/assets/icon/ty_icon_back.png"/>
      <div class="title">供热交费单详情</div>
    </div>
    <house-card :curHouse="curHouse"></house-card>
    <div class="yearCard">
      <div class="orderIntro">
        <div class="title">
          <p></p>
          <div class="name">订单信息</div>
        </div>
        <div class="line">
          <div class="label">业务类别</div>
          <div class="input tw1">{{ record.businessType }}</div>
          <div class="label">订单编号</div>
          <div class="input tw2">{{ record.poDispNo }}</div>
        </div>
        <div class="line">
          <div class="label">交费年度</div>
          <div class="input tw1">{{ record.chargeMonth }}</div>
          <div class="label">交费面积</div>
          <div class="input tw2">{{ record.area }}m²</div>
        </div>
      </div>
      <div class="invoInfo" v-for="(invoice, index) in record.invoices" :key="index">
        <div class="title"></div>
        <div class="content">
          <div class="line">
            <div class="label">交费年度</div>
            <div class="input">{{ record.chargeMonth }}</div>
          </div>
          <div class="line">
            <div class="label">发票代码</div>
            <div class="input">{{ invoice.invoiceCode }}</div>
          </div>
          <div class="line">
            <div class="label">发票编码</div>
            <div class="input">{{ invoice.invoiceNumber }}</div>
          </div>
          <div class="line">
            <div class="label">交费方式</div>
            <div class="input">{{ getInvoiceType(invoice.invoiceTypeId) }}</div>
          </div>
          <div class="line">
            <div class="label">交费单价</div>
            <div class="input">{{ invoice.invoiceUnitPrice }}元/m²</div>
          </div>
          <div class="line">
            <div class="label">交费面积</div>
            <div class="input">{{ invoice.invoiceArea }}m²</div>
          </div>
          <div class="line">
            <div class="label">交费金额</div>
            <div class="input">{{ invoice.invoiceAmount }}元</div>
          </div>
          <div class="line">
            <div class="label">发票抬头</div>
            <div class="input">{{ invoice.pTitle }}</div>
          </div>
          <div class="line" v-if="invoice.invoiceTitleTypeId == 2">
            <div class="label">税号</div>
            <div class="input">{{ invoice.pTaxNo }}</div>
          </div>
          <div class="line" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <div class="label">开户行</div>
            <div class="input">{{ invoice.pBankName }}</div>
          </div>
          <div class="line" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <div class="label">账号</div>
            <div class="input">{{ invoice.pAccountNo }}</div>
          </div>
          <div class="line" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <div class="label">地址</div>
            <div class="input">{{ invoice.pAddress }}</div>
          </div>
          <div class="line" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <div class="label">电话</div>
            <div class="input">{{ invoice.pTelephone }}</div>
          </div>
          <div class="fp-toggle" v-if="invoice.invoiceTitleTypeId == 2">
            <img src="@/assets/icon/ty_icon_retract.png" @click="toggleInvoice(invoice)" v-if="invoice.expanded">
            <img src="@/assets/icon/ty_icon_unfold.png" @click="toggleInvoice(invoice)" v-else>
          </div>
          <div class="fp-yl">
            <van-button class="fp-yl-btn" text="发票预览" :disabled="!invoice.previewUrl" @click="previewInvoice(invoice)" />
          </div>
        </div>
        <div class="bottom"><img src="@/assets/icon/invoice-foot.png"></div>
      </div>
    </div>
    <div class="summary">
      <div class="invoQty">
        <span class="span1">发票数量</span>
        <span class="span2">{{ record.invoiceQty }}</span>
        <span class="span3">张</span>
      </div>
      <div class="orderAmount">
        <span class="span1">订单金额</span>
        <span class="span2">{{ record.amount }}</span>
        <span class="span3">元</span>
      </div>
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import orderApi from '@/api/order';

export default {
  name: 'HistoryChargeForm',
  components: {
    [HouseCard.name]: HouseCard
  },
  data () {
    return {
      source: '',
      curHouse: {},
      bindHouse: [],
      record: {},
      getInvoiceType: function (type) {
        return type === 1 ? '自费' : '报销';
      }
    };
  },
  beforeMount: function () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.detailId = params.detailId;
    this.source = params.source;
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.initPage();
  },
  mounted () {
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
      this.$router.push({
        name: 'historyChargeList',
        params: {
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    initPage: function () {
      orderApi.getPaymentOrderDetail(this.detailId).then(result => {
        if (result.status === 1) {
          const record = result.data;
          // 发票数量
          record.invoiceQty = record.invoices.length;
          this.record = record;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    toggleInvoice: function (item) {
      this.$set(item, 'expanded', !item.expanded);
    },
    previewInvoice: function (item) {
      this.$router.push({
        name: 'previewInvoice',
        params: {
          detailId: this.detailId,
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          invoice: item
        }
      });
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
    height: 240px;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background: #fff;
  }
  .orderIntro .title {
    height: 86px;
    width: 690px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .orderIntro .title p {
    margin-left: 30px;
    width: 6px;
    height: 26px;
    background: linear-gradient(to right, #ff8850, #ff6016);
  }
  .orderIntro .title .name {
    margin-left: 30px;
    font-size: 30px;
    color: #333333;
    width: 390px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .orderIntro .line {
    border-top: 1px solid #e8e8e8;
    width: 100%;
    height: 88px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .orderIntro .line .label {
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
  .orderIntro .line .input {
    color: #333333;
    font-size: 28px;
    margin-left: 10px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .tw1 {
    width: 185px;
  }
  .tw2 {
    width: 225px;
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
    width: 650px;
    background-color: #ffffff;
    margin: 0 20px;
  }
  .invoInfo .line {
    width: 610px;
    border-top: 1px solid #e8e8e8;
    padding: 20px 0;
    margin: 0 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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
    width: 150px;
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
    width: 440px;
    font-size: 28px;
    color: #333333;
    margin-left: 20px;
    text-align: right;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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
    margin-bottom: 40px;
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
    margin-top: 70px;
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

.fp-toggle {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.fp-toggle img {
  width: 30px;
  height: 28px;
}

.fp-yl {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.fp-yl-btn {
  height: 44px;
  font-size: 22px;
  color: #ffffff;
  border-radius: 10px;
  padding: 0 20px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}
</style>
