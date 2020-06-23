<template>
  <div class="content">
    <div class="nav">
      <div class="nav-icon">
        <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      </div>
      <span class="nav-title">{{ record.invoiceTitleLibId ? '编辑发票抬头' : '添加发票抬头' }}</span>
      <div class="nav-btn">
        <span @click="doSave">保存</span>
      </div>
    </div>
    <div class="form">
      <!--
      <div class="head" style="border: 1px solid #e8e8e8;">
        <img src="@/assets/icon/personal_icon_fptt.png" />
        <span>发票抬头信息</span>
      </div>
      -->
      <div class="body">
        <div class="item" style="border-top: none;">
          <span class="item-left">抬头类型</span>
          <span class="item-right">{{ getInvoiceTitleType() }}</span>
        </div>
        <div class="item">
          <span class="item-left"><font color="red">*</font>&nbsp;发票抬头</span>
          <el-autocomplete
            class="item-right"
            placeholder="请输入发票抬头"
            v-model="record.pTitle"
            value-key="pTitle"
            :fetch-suggestions="querySearchAsync"
            :trigger-on-focus="false"
            @select="handleSelect">
          </el-autocomplete>
        </div>
        <div class="item" v-if="enterpriseFlag">
          <span class="item-left"><font color="red">*</font>&nbsp;发票税号</span>
          <input class="item-right" type="text" placeholder="请输入发票税号" v-model="record.pTaxNo" />
        </div>
        <div class="item" v-if="enterpriseFlag && expanded">
          <span class="item-left">开户行名称</span>
          <input class="item-right" type="text" placeholder="请输入开户行名称" v-model="record.pBankName" />
        </div>
        <div class="item" v-if="enterpriseFlag && expanded">
          <span class="item-left">开户行账号</span>
          <input class="item-right" type="text" placeholder="请输入开户行账号" v-model="record.pAccountNo" />
        </div>
        <div class="item" v-if="enterpriseFlag && expanded">
          <span class="item-left">公司地址</span>
          <input class="item-right" type="text" placeholder="请输入公司地址" v-model="record.pAddress" />
        </div>
        <div class="item" v-if="enterpriseFlag && expanded">
          <span class="item-left">公司电话</span>
          <input class="item-right" type="text" placeholder="请输入公司电话" v-model="record.pTelephone" />
        </div>
        <div class="toggle" v-if="enterpriseFlag">
          <img src="@/assets/icon/ty_icon_retract.png" @click="toggle" v-if="expanded">
          <img src="@/assets/icon/ty_icon_unfold.png" @click="toggle" v-else>
        </div>
      </div>
    </div>
    <div class="btn-delete" @click="doDelete" v-if="record.invoiceTitleLibId">
      <img src="@/assets/icon/ty_icon_del.png" />
      <span>删除该发票抬头</span>
    </div>
  </div>
</template>

<script>
import constant from '@/assets/js/constant';
import invoiceTitleApi from '@/api/invoice-title';

export default {
  name: 'InvoiceTitleFormPopup',
  components: {
  },
  props: [
    'enterpriseFlag',
    'invoiceTitle'
  ],
  data () {
    return {
      record: {},
      expanded: false,
      getInvoiceTitleType: function () {
        return this.enterpriseFlag ? '企业' : '非企业';
      }
    };
  },
  beforeMount: function () {
    if (this.invoiceTitle) {
      this.record = this.invoiceTitle;
    }
  },
  mounted: function () {
  },
  methods: {
    goBack: function () {
      this.$emit('goBack');
    },
    doSave: function () {
      if (!this.record.pTitle) {
        this.$toast('请输入发票抬头！');
        return;
      }
      if (this.enterpriseFlag) {
        const reg = /^[0-9a-zA-Z]+$/;
        if (!this.record.pTaxNo) {
          this.$toast('请输入发票税号！');
          return;
        } else if (!reg.test(this.record.pTaxNo)) {
          this.$toast('请输入有效的发票税号！');
          return;
        }
      }
      this.$toast.loading({
        duration: 0,
        forbidClick: true,
        message: '保存中...'
      });
      this.record.pType = this.enterpriseFlag ? constant.invoice_title_type.business : constant.invoice_title_type.nonbusiness;
      invoiceTitleApi.saveInvoiceTitle(this.record).then(result => {
        this.$toast.clear();
        if (result.status === 1) {
          this.$emit('confirm');
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    doDelete: function () {
      this.$dialog.confirm({
        message: '确定要删除这张发票抬头？'
      }).then(() => {
        this.$toast.loading({
          duration: 0,
          forbidClick: true,
          message: '删除中...'
        });
        invoiceTitleApi.deleteInvoiceTitle(this.record.invoiceTitleLibId).then(result => {
          this.$toast.clear();
          if (result.status === 1) {
            this.$emit('confirm');
          } else {
            this.$toast(result.data.message);
          }
        });
      });
    },
    toggle: function () {
      this.expanded = !this.expanded;
    },
    querySearchAsync: function (queryString, callback) {
      if (queryString) {
        const params = {
          invoiceType: this.enterpriseFlag ? constant.invoice_title_type.business : constant.invoice_title_type.nonbusiness,
          titleName: queryString
        };
        invoiceTitleApi.queryInvoiceTitle(params).then(result => {
          if (result.status === 1) {
            callback(result.data);
          } else {
            this.$toast(result.data.message);
          }
        });
      }
    },
    handleSelect: function (item) {
      if (this.enterpriseFlag) {
        this.record.pTaxNo = item.pTaxNo;
        this.record.pBankName = item.pBankName;
        this.record.pAccountNo = item.pAccountNo;
        this.record.pAddress = item.pAddress;
        this.record.pTelephone = item.pTelephone;
      }
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
  justify-content: space-between;
  align-items: center;
}

.nav-icon {
  width: 80px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.nav-icon>img {
  width: 20px;
  height: 35px;
}

.nav-title {
  font-size: 36px;
  color: #333333;
}

.nav-btn {
  width: 80px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.nav-btn>span {
  font-size: 28px;
  color: #ff6016;
}

.form {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: column;
}

.head {
  width: 690px;
  background-color: #f7f7f7;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.head>img {
  width: 32px;
  height: 32px;
}

.head>span {
  font-size: 32px;
  color: #333333;
  margin-left: 10px;
}

.body {
  width: 690px;
  padding: 0 30px;
  display: flex;
  flex-direction: column;
}

.item {
  width: 630px;
  border-top: 1px solid #f7f7f7;
  padding: 20px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.item-right {
  width: 460px;
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: right;
}

.toggle {
  margin: 20px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.toggle>img {
  width: 30px;
  height: 28px;
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
