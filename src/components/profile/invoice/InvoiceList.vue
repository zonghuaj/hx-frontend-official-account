<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>发票查询列表</span>
    </div>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse"></house-card>
    <div class="year">
      <span>{{ chargeMonth }}</span>
      <img src="@/assets/icon/maintain_icon_xl.png" @click="showChargeMonth" />
    </div>
    <van-popup v-model="showChargeMonthPopup">
      <span>请选择交费年度</span>
      <van-radio-group v-model="chargeMonth">
        <van-cell-group>
          <van-cell
            :title-style="chargeMonth == item ? 'color: #ff6016;' : ''"
            :title="item"
            clickable
            center
            @click="selectChargeMonth(item)"
            v-for="(item, index) in chargeMonthList"
            :key="index">
            <van-radio :name="item">
              <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal" />
            </van-radio>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-popup>
    <div class="invoice" v-for="(item, index) in invoiceList" :key="index">
      <div class="invoice-head"></div>
      <div class="invoice-body">
        <div class="invoice-item">
          <span class="invoice-item-left">交费年度</span>
          <span class="invoice-item-right">{{ item.chargeMonth }}</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">发票代码</span>
          <span class="invoice-item-right">{{ item.invoiceCode }}</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">发票编号</span>
          <span class="invoice-item-right">{{ item.invoiceNumber }}</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">交费方式</span>
          <span class="invoice-item-right">{{ getInvoiceType(item.invoiceTypeId) }}</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">交费单价</span>
          <span class="invoice-item-right">{{ item.invoiceUnitPrice }}元/㎡</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">交费面积</span>
          <span class="invoice-item-right">{{ item.invoiceArea }}㎡</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">交费金额</span>
          <span class="invoice-item-right">{{ item.invoiceAmount }}元</span>
        </div>
        <div class="invoice-item">
          <span class="invoice-item-left">发票抬头</span>
          <span class="invoice-item-right">{{ item.pTitle }}</span>
        </div>
        <div class="invoice-item" v-if="item.invoiceTitleTypeId == 2">
          <span class="invoice-item-left">税号</span>
          <span class="invoice-item-right">{{ item.pTaxNo }}</span>
        </div>
        <div class="invoice-item" v-if="item.invoiceTitleTypeId == 2 && item.expanded">
          <span class="invoice-item-left">开户行</span>
          <span class="invoice-item-right">{{ item.pBankName }}</span>
        </div>
        <div class="invoice-item" v-if="item.invoiceTitleTypeId == 2 && item.expanded">
          <span class="invoice-item-left">账号</span>
          <span class="invoice-item-right">{{ item.pAccountNo }}</span>
        </div>
        <div class="invoice-item" v-if="item.invoiceTitleTypeId == 2 && item.expanded">
          <span class="invoice-item-left">地址</span>
          <span class="invoice-item-right">{{ item.pAddress }}</span>
        </div>
        <div class="invoice-item" v-if="item.invoiceTitleTypeId == 2 && item.expanded">
          <span class="invoice-item-left">电话</span>
          <span class="invoice-item-right">{{ item.pTelephone }}</span>
        </div>
        <div class="invoice-toggle" v-if="item.invoiceTitleTypeId == 2">
          <img src="@/assets/icon/ty_icon_retract.png" @click="toggleInvoice(item)" v-if="item.expanded">
          <img src="@/assets/icon/ty_icon_unfold.png" @click="toggleInvoice(item)" v-else>
        </div>
        <div class="invoice-yl">
          <van-button class="invoice-yl-btn" text="发票预览" :disabled="!item.previewUrl" @click="previewInvoice(item)" />
        </div>
      </div>
      <div class="invoice-foot"></div>
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import constant from '@/assets/js/constant';
import invoiceApi from '@/api/invoice';

export default {
  name: 'InvoiceList',
  components: {
    HouseCard
  },
  data () {
    return {
      source: null,
      curHouse: {},
      bindHouse: [],
      showChargeMonthPopup: false,
      chargeMonthList: [],
      chargeMonth: null,
      invoiceList: [],
      icon: constant.radioStyle.icon,
      getInvoiceType: function (type) {
        return type === 1 ? '自费' : '报销';
      }
    };
  },
  beforeMount: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
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
  watch: {
    chargeMonth: 'getInvoiceList'
  },
  methods: {
    goBack: function () {
      history.pushState(null, null, document.URL);
      if (this.source === 'serviceHall') {
        this.$router.push({
          name: 'serviceHall',
          params: {
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      } else {
        if (this.bindHouse[0].isDefault === 0 && this.bindHouse.length > 1) {
          this.$router.push({
            path: '/chooseRoom',
            query: {
              label: 'invoiceList'
            }
          });
        } else {
          this.$router.push({
            name: 'profile'
          });
        }
      }
    },
    switchHouse: function (house) {
      if (this.curHouse === house) {
        return;
      }
      this.curHouse = house;
      this.chargeMonthList = [];
      this.chargeMonth = null;
      this.invoiceList = [];
      this.initPage();
    },
    initPage: function () {
      invoiceApi.getHouseChargeMonthList(this.curHouse.houseId).then(result => {
        if (result.status === 1) {
          this.chargeMonthList = result.data;
          if (this.chargeMonthList.length > 0) {
            this.chargeMonth = this.chargeMonthList[0];
          }
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    showChargeMonth: function () {
      if (this.chargeMonthList.length > 0) {
        this.showChargeMonthPopup = true;
      }
    },
    selectChargeMonth: function (item) {
      this.showChargeMonthPopup = false;
      this.chargeMonth = item;
    },
    getInvoiceList: function () {
      if (!this.chargeMonth) {
        return;
      }
      const params = {
        houseId: this.curHouse.houseId,
        chargeMonth: this.chargeMonth
      };
      invoiceApi.getInvoiceList(params).then(result => {
        if (result.status === 1) {
          this.invoiceList = result.data;
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

.year {
  width: 690px;
  height: 88px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.year>span {
  font-size: 28px;
  color: #333333;
}

.year>img {
  width: 18px;
  height: 10px;
  margin-left: 10px;
}

.invoice {
  width: 690px;
  margin: 20px 30px 0;
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
  background: url(../../../assets/icon/invoice-foot.png) no-repeat center center;
  background-size: 650px 36px;
  margin: 0 20px;
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
</style>
