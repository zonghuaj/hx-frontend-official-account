<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>供热交费单（{{ record.dispOrderNo }}）详情</span>
    </div>
    <house-card :curHouse="curHouse"></house-card>
    <div class="detail" v-for="(detail, index) in record.details" :key="index">
      <div class="detail-item">
        <div class="detail-year">
          <img src="@/assets/icon/ty_icon_clock.png" />
          <span>{{ detail.chargeMonth }}</span>
        </div>
        <div class="detail-area">
          <span class="detail-area-left">交费面积</span>
          <span class="detail-area-right">{{ detail.area }}m²</span>
        </div>
      </div>
      <div class="invoice" v-for="(invoice, index) in detail.invoices" :key="index">
        <div class="invoice-head"></div>
        <div class="invoice-body">
          <div class="invoice-item">
            <span class="invoice-item-left">交费年度</span>
            <span class="invoice-item-right">{{ detail.chargeMonth }}</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">发票代码</span>
            <span class="invoice-item-right" v-if="invoice.invoiceCode">{{ invoice.invoiceCode }}</span>
            <span class="invoice-item-right" v-else>开票中</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">发票编号</span>
            <span class="invoice-item-right" v-if="invoice.invoiceNumber">{{ invoice.invoiceNumber }}</span>
            <span class="invoice-item-right" v-else>开票中</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">交费方式</span>
            <span class="invoice-item-right">{{ getInvoiceType(invoice.invoiceTypeId) }}</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">交费单价</span>
            <span class="invoice-item-right">{{ invoice.invoiceUnitPrice }}元/㎡</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">交费面积</span>
            <span class="invoice-item-right">{{ invoice.invoiceArea }}㎡</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">交费金额</span>
            <span class="invoice-item-right">{{ invoice.invoiceAmount }}元</span>
          </div>
          <div class="invoice-item">
            <span class="invoice-item-left">发票抬头</span>
            <span class="invoice-item-right">{{ invoice.pTitle }}</span>
          </div>
          <div class="invoice-item" v-if="invoice.invoiceTitleTypeId == 2">
            <span class="invoice-item-left">税号</span>
            <span class="invoice-item-right">{{ invoice.pTaxNo }}</span>
          </div>
          <div class="invoice-item" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <span class="invoice-item-left">开户行</span>
            <span class="invoice-item-right">{{ invoice.pBankName }}</span>
          </div>
          <div class="invoice-item" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <span class="invoice-item-left">账号</span>
            <span class="invoice-item-right">{{ invoice.pAccountNo }}</span>
          </div>
          <div class="invoice-item" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <span class="invoice-item-left">地址</span>
            <span class="invoice-item-right">{{ invoice.pAddress }}</span>
          </div>
          <div class="invoice-item" v-if="invoice.invoiceTitleTypeId == 2 && invoice.expanded">
            <span class="invoice-item-left">电话</span>
            <span class="invoice-item-right">{{ invoice.pTelephone }}</span>
          </div>
          <div class="invoice-toggle" v-if="invoice.invoiceTitleTypeId == 2">
            <img src="@/assets/icon/ty_icon_retract.png" @click="toggleInvoice(invoice)" v-if="invoice.expanded">
            <img src="@/assets/icon/ty_icon_unfold.png" @click="toggleInvoice(invoice)" v-else>
          </div>
          <div class="invoice-yl">
            <van-button class="invoice-yl-btn" text="发票预览" :disabled="!invoice.previewUrl" @click="previewInvoice(invoice)" />
          </div>
        </div>
        <div class="invoice-foot"></div>
      </div>
    </div>
    <div class="order">
      <span>发票数量&nbsp;<font color="red">{{ record.invoiceQty }}</font>&nbsp;张</span>
      <span>订单金额&nbsp;<font color="red">{{ record.totalAmount }}</font>&nbsp;元</span>
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import orderApi from '@/api/order';

export default {
  name: 'ChargeForm',
  components: {
    HouseCard
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
    this.orderId = params.orderId;
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
        name: 'orderList',
        params: {
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    initPage: function () {
      orderApi.getPaymentOrder(this.orderId).then(result => {
        if (result.status === 1) {
          const record = result.data;
          // 发票数量
          let invoiceQty = 0;
          for (let index = 0; index < record.details.length; index++) {
            invoiceQty += record.details[index].invoices.length;
          }
          record.invoiceQty = invoiceQty;
          this.record = record;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    toggleInvoice: function (invoice) {
      this.$set(invoice, 'expanded', !invoice.expanded);
    },
    previewInvoice: function (invoice) {
      this.$router.push({
        name: 'previewInvoice',
        params: {
          orderId: this.orderId,
          source: this.source,
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          invoice: invoice
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

.detail {
  width: 690px;
  margin: 20px 30px 0;
}

.detail-item {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.detail-year {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.detail-year>img {
  width: 60px;
  height: 60px;
}

.detail-year>span {
  font-size: 30px;
  color: #333333;
  margin-left: 30px;
}

.detail-area {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.detail-area-left {
  font-size: 28px;
  color: #999999;
}

.detail-area-right {
  font-size: 28px;
  color: #333333;
  margin-left: 30px;
}

.invoice {
  width: 690px;
  margin-top: 20px;
}

.invoice-head {
  width: 690px;
  height: 20px;
  border-radius: 10px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}

.invoice-body {
  width: 650px;
  background-color: #ffffff;
  margin: 0 20px;
}

.invoice-item {
  width: 610px;
  border-bottom: 1px solid #e8e8e8;
  padding: 20px 0;
  margin: 0 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.invoice-item-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.invoice-item-right {
  width: 440px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.invoice-toggle {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.invoice-toggle img {
  width: 30px;
  height: 28px;
}

.invoice-yl {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.invoice-yl-btn {
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

.invoice-foot {
  width: 650px;
  height: 36px;
  background: url(../../assets/icon/invoice-foot.png) no-repeat center center;
  background-size: 650px 36px;
  margin: 0 20px;
}

.order {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.order>span {
  font-size: 28px;
  color: #999999;
}
</style>
