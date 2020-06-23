<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>发票抬头列表</span>
    </div>
    <div class="tab">
      <span :class="enterpriseFlag ? 'tab-item-active': 'tab-item'" @click="setEnterpriseFlag(true)">企业</span>
      <span :class="enterpriseFlag ? 'tab-item': 'tab-item-active'" @click="setEnterpriseFlag(false)">非企业</span>
    </div>
    <div class="enterprise" v-for="(invoiceTitle, index) in enterpriseList" :key="index" v-if="enterpriseFlag">
      <div class="enterprise-left" @click="doSelect(invoiceTitle)">
        <img class="enterprise-left-left" src="@/assets/icon/personal_icon_gwb.png" />
        <div class="enterprise-left-right">
          <span class="enterprise-left-right-up">{{ invoiceTitle.pTitle }}</span>
          <span class="enterprise-left-right-down">{{ invoiceTitle.pTaxNo }}</span>
        </div>
      </div>
      <div class="enterprise-right" @click="doEdit(invoiceTitle)">
        <span style="border: 1px solid #ff6016;">编辑</span>
      </div>
    </div>
    <div class="nonenterprise" v-for="(invoiceTitle, index) in nonenterpriseList" :key="index" v-if="!enterpriseFlag">
      <div class="nonenterprise-left" @click="doSelect(invoiceTitle)">
        <img class="nonenterprise-left-left" src="@/assets/icon/personal_icon_gwb.png" />
        <span class="nonenterprise-left-right">{{ invoiceTitle.pTitle }}</span>
      </div>
      <div class="nonenterprise-right" @click="doEdit(invoiceTitle)">
        <span style="border: 1px solid #ff6016;">编辑</span>
      </div>
    </div>
    <div class="btn-add" style="border: 1px dashed #ff6016;" @click="doAdd">
      <div class="btn-add-left">
        <img src="@/assets/icon/ty_icon_add.png" />
        <span>添加发票抬头</span>
      </div>
      <img class="btn-add-right" src="@/assets/icon/ty_icon_more.png" />
    </div>
    <van-popup class='invoice-title-form' v-model="showInvoiceTitleForm" position="right" :close-on-click-overlay="false">
      <invoice-title-form-popup :enterpriseFlag="enterpriseFlag" :invoiceTitle="invoiceTitle" @confirm="doConfirm" @goBack="doHide" v-if="showInvoiceTitleForm"></invoice-title-form-popup>
    </van-popup>
  </div>
</template>

<script>
import InvoiceTitleFormPopup from '@/components/profile/invoiceTitle/InvoiceTitleFormPopup';
import constant from '@/assets/js/constant';
import invoiceTitleApi from '@/api/invoice-title';

export default {
  name: 'InvoiceTitleListPopup',
  components: {
    InvoiceTitleFormPopup
  },
  props: [
    'invoiceTitleType'
  ],
  data () {
    return {
      enterpriseFlag: true,
      enterpriseList: [],
      nonenterpriseList: [],
      invoiceTitle: null,
      showInvoiceTitleForm: false
    };
  },
  beforeMount: function () {
    this.enterpriseFlag = this.invoiceTitleType === constant.invoice_title_type.business;
    this.initPage();
  },
  mounted: function () {
  },
  methods: {
    goBack: function () {
      this.$emit('goBack');
    },
    initPage: function () {
      // 企业
      invoiceTitleApi.getInvoiceTitleList(constant.invoice_title_type.business).then(result => {
        if (result.status === 1) {
          this.enterpriseList = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
      // 非企业
      invoiceTitleApi.getInvoiceTitleList(constant.invoice_title_type.nonbusiness).then(result => {
        if (result.status === 1) {
          this.nonenterpriseList = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    setEnterpriseFlag: function (enterpriseFlag) {
      this.enterpriseFlag = enterpriseFlag;
    },
    doSelect: function (invoiceTitle) {
      this.$emit('select', invoiceTitle);
    },
    doAdd: function () {
      this.showInvoiceTitleForm = true;
      this.invoiceTitle = null;
    },
    doEdit: function (invoiceTitle) {
      this.showInvoiceTitleForm = true;
      this.invoiceTitle = invoiceTitle;
    },
    doConfirm: function () {
      this.showInvoiceTitleForm = false;
      this.initPage();
    },
    doHide: function () {
      this.showInvoiceTitleForm = false;
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

.tab {
  width: 750px;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  font-size: 30px;
  color: #333333;
  padding: 30px 0;
}

.tab-item-active {
  font-size: 30px;
  color: #ff6016;
  background: url(../../../assets/icon/maintain_sm_icon_xz.png) no-repeat bottom center;
  background-size: 40px 4px;
  padding: 30px 0;
}

.enterprise {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.enterprise-left {
  width: 490px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.enterprise-left-left {
  width: 40px;
  height: 40px;
}

.enterprise-left-right {
  margin-left: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.enterprise-left-right-up {
  font-size: 26px;
  color: #333333;
  text-align: left;
}

.enterprise-left-right-down {
  font-size: 26px;
  color: #333333;
  margin-top: 20px;
}

.enterprise-right {
  border-left: 1px solid #e8e8e8;
  padding-left: 30px;
  margin-left: 20px;
}

.enterprise-right>span {
  font-size: 22px;
  color: #ff6016;
  border-radius: 5px;
  padding: 5px 20px;
  white-space: nowrap;
}

.nonenterprise {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.nonenterprise-left {
  width: 490px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.nonenterprise-left-left {
  width: 40px;
  height: 40px;
}

.nonenterprise-left-right {
  font-size: 26px;
  color: #333333;
  margin-left: 30px;
  text-align: left;
}

.nonenterprise-right {
  border-left: 1px solid #e8e8e8;
  padding-left: 30px;
  margin-left: 20px;
}

.nonenterprise-right>span {
  font-size: 22px;
  color: #ff6016;
  border-radius: 5px;
  padding: 5px 20px;
  white-space: nowrap;
}

.btn-add {
  width: 690px;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.btn-add-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.btn-add-left>img {
  width: 48px;
  height: 48px;
}

.btn-add-left>span {
  font-size: 32px;
  color: #333333;
  margin-left: 30px;
}

.btn-add-right {
  width: 18px;
  height: 30px;
}

.invoice-title-form {
  width: 750px;
  height: 100%;
  background-color: #f4f5fa;
}
</style>
