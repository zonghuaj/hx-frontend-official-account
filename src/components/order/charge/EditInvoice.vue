<template>
  <div id="wrap">
    <div class="header">
      <img class="goBack" @click="goBack" src="@/assets/icon/ty_icon_back.png"/>
      <div class="title">编辑发票（2/5）</div>
    </div>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" source="editInvoice" @switch="switchHouse"></house-card>
    <div class="category" v-if="isCurrentYear == 1 && (isHouse == 1 || previousYear.flag == 1)">
      <van-radio-group v-model="paymentMethod" @change="changePaymentMethod()">
        <van-radio name="selfPay" v-if="isHouse == 1">
          全部自费
          <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
        </van-radio>
        <van-radio name="reimbursePart" v-if="isHouse == 1">
          部分报销
          <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
        </van-radio>
        <van-radio name="reimburseAll" v-if="isHouse == 1">
          全部报销
          <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
        </van-radio>
        <van-radio name="reference" v-if="previousYear.flag == 1">
          参照往年
          <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
        </van-radio>
      </van-radio-group>
    </div>
    <div class="yearCard" v-for="period in payingPeriod" :key="period.chargeYear">
      <div class="orderInfo">
        <div class="orderInfo-left">
          <img src="@/assets/icon/ty_icon_clock.png">
          <span class="year">{{ period.chargeYear }}年度</span>
        </div>
        <div class="orderInfo-right">
          <span class="sqtLabel">交费面积</span>
          <span class="sqtValue">{{ period.chargeArea }}m²</span>
          <input class="wnqfjf" type="button" value="往年欠费交费" v-if="previousPeriod.length > 0" @click="showOwe()" />
        </div>
      </div>
      <div class="invoInfo" v-if="period.visibility.selfPayCard">
        <div class="invoiceTitle">
          <div class="invoiceTitle-left">
            <p></p>
            <span class="name">发票信息1</span>
          </div>
          <div class="invoiceTitle-right">
            <span class="sqtLabel">交费方式</span>
            <span class="sqtValue">自费</span>
          </div>
        </div>
        <div class="line" v-if="period.visibility.selfPayAreaField">
          <div class="label"><span>*</span>自费面积</div>
          <div class="input"><input type="number" name="area" placeholder="请输入自费面积" v-model="period.selfPay.area" @change="changeSelfPayArea(period)" /></div>
        </div>
        <div class="line">
          <div class="label"><span>*</span>发票抬头</div>
          <div class="input">
            <input type="text" name="title" placeholder="请输入交费人或房主姓名" v-model="period.selfPay.title" />
          </div>
        </div>
      </div>
      <div class="invoInfo" v-if="period.visibility.reimburseCard" v-for="(reimbursePart, index) in period.reimbursePartArray" :key="index">
        <div class="invoiceTitle">
          <div class="invoiceTitle-left">
            <p></p>
            <span class="name">发票信息{{ period.visibility.selfPayCard ? (index + 2) : (index + 1) }}</span>
          </div>
          <div class="invoiceTitle-right">
            <span class="sqtLabel" v-if="previousPeriod.length == 0">交费方式</span>
            <span class="sqtValue" v-if="previousPeriod.length == 0">{{ isHouse == 0 ? '非住宅' : '报销' }}</span>
            <img src="@/assets/icon/pay_icon_close.png" v-if="reimbursePart.deletable" @click="deleteInvoice(period, reimbursePart)">
          </div>
        </div>
        <div class="line">
          <div class="label"><span>*</span>报销面积</div>
          <div class="input">
            <input type="number" name="area" placeholder="请输入报销面积" v-model="reimbursePart.area" @change="changeReimburseArea(period, reimbursePart)" />
          </div>
        </div>
        <div class="line">
          <div class="label"><span>*</span>抬头类型</div>
          <div class="input radio">
            <el-radio-group v-model="reimbursePart.titleCategory" @change="changeTitleCategory(reimbursePart)">
              <el-radio label="business">企业</el-radio>
              <el-radio label="nonbusiness">非企业</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="line">
          <div class="label"><span>*</span>发票抬头</div>
          <div class="input">
            <div class="titlePicker">
              <span v-if="reimbursePart.titleCategory == 'business'">{{ reimbursePart.title }}</span>
              <input type="text" placeholder="请输入发票抬头" v-model="reimbursePart.title" v-else />
              <img src="@/assets/icon/ty_icon_more_orange.png" @click="showInvoiceTitle(reimbursePart)">
            </div>
          </div>
        </div>
        <div class="line" v-if="reimbursePart.titleCategory == 'business'">
          <div class="label"><span>*</span>税号</div>
          <div class="input">{{ reimbursePart.taxNo }}</div>
        </div>
        <div class="line" v-if="reimbursePart.titleCategory == 'business' && reimbursePart.showMoreFields">
          <div class="label">开户行</div>
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
          <img src="@/assets/icon/ty_icon_retract.png" @click="toggleInvoice(reimbursePart)" v-if="reimbursePart.showMoreFields">
          <img src="@/assets/icon/ty_icon_unfold.png" @click="toggleInvoice(reimbursePart)" v-else>
        </div>
        <div class="line u">
          <div class="label">报销人</div>
          <div class="input">
            <input type="text" name="reimbursementApplicant" placeholder="请输入报销人" v-model="reimbursePart.reimbursementApplicant"/>
          </div>
        </div>
      </div>
      <div class="btnAddInvoBar" v-if="period.visibility.btnAddInvoice">
        <div class="btnAddInvo" style="border: 1px dashed #ff6016;" @click="addInvoice(period)">
          <img src="@/assets/icon/ty_icon_add.png">
          <div>添加发票</div>
          <img class="arrow" src="@/assets/icon/ty_icon_more.png">
        </div>
      </div>
    </div>
    <van-button class="btnNext" text="下一步" @click="next" />
    <van-popup class="validate-name" v-model="showValidateNamePopup" :close-on-click-overlay="false">
      <validate-name :previousYear="previousYear" @confirm="selectValidateName" @cancel="hideValidateName" v-if="showValidateNamePopup"></validate-name>
    </van-popup>
    <van-popup class="owe-list" v-model="showOweList" :close-on-click-overlay="false">
      <owe-list :previousPeriod="previousPeriod" @confirm="selectOwe" @cancel="hideOwe" v-if="showOweList"></owe-list>
    </van-popup>
    <van-popup class="invoice-title-list" v-model="showInvoiceTitleList" position="right" :close-on-click-overlay="false">
      <invoice-title-list-popup ref="invoiceTitleList" :invoiceTitleType="invoiceTitleType" @select="selectInvoiceTitle" @goBack="hideInvoiceTitle" v-if="showInvoiceTitleList"></invoice-title-list-popup>
    </van-popup>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';
import ValidateName from '@/components/order/charge/ValidateName';
import OweList from '@/components/order/charge/OweList';
import InvoiceTitleListPopup from '@/components/profile/invoiceTitle/InvoiceTitleListPopup';
import constant from '@/assets/js/constant';
import chargeApi from '@/api/charge';

export default {
  name: 'EditInvoice',
  components: {
    HouseCard,
    ValidateName,
    OweList,
    InvoiceTitleListPopup
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      isCurrentYear: 1,
      isHouse: 0,
      paymentMethod: 'selfPay',
      previousPeriod: [],
      payingPeriod: [],
      // 参照往年
      previousYear: {},
      validateNameFlag: false,
      showValidateNamePopup: false,
      showOweList: false,
      showInvoiceTitleList: false,
      invoiceTitleType: constant.invoice_title_type.business,
      icon: constant.radioStyle.icon
    };
  },
  created: function () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    if (params.hasOwnProperty('isCurrentYear')) {
      this.isCurrentYear = params.isCurrentYear;
      this.isHouse = params.isHouse;
      this.paymentMethod = params.paymentMethod;
      this.previousPeriod = params.previousPeriod;
      this.payingPeriod = params.payingPeriod;
      this.previousYear = params.previousYear;
      this.validateNameFlag = params.validateNameFlag;
    } else {
      this.initPage();
    }
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
      // 发票抬头
      if (this.showInvoiceTitleList) {
        if (this.$refs.invoiceTitleList.showInvoiceTitleForm) {
          this.$refs.invoiceTitleList.showInvoiceTitleForm = false;
          return;
        }
        this.showInvoiceTitleList = false;
        return;
      }
      this.$dialog.confirm({
        message: '您将放弃本次编辑内容，是否继续。'
      }).then(() => {
        this.$router.push({
          name: 'serviceHall',
          params: {
            curHouse: this.curHouse,
            bindHouse: this.bindHouse
          }
        });
      });
    },
    switchHouse: function (house) {
      if (this.curHouse === house) {
        return;
      }
      this.curHouse = house;
      this.isCurrentYear = 1;
      this.isHouse = 0;
      this.paymentMethod = 'selfPay';
      this.previousPeriod = [];
      this.payingPeriod = [];
      this.previousYear = {};
      this.validateNameFlag = false;
      this.invoiceTitleType = constant.invoice_title_type.business;
      this.initPage();
    },
    initPage: function () {
      chargeApi.getPayablePeriod(this.curHouse.houseId).then(result => {
        // 测试数据
        // result.previousPeriod = [{
        //   chargeId: 1,
        //   chargeMonth: '2016-2017',
        //   chargeYear: '2016',
        //   chargeArea: 150,
        //   totalAccount: 3000,
        //   price: 23,
        //   ceSubsidyPrice: 26,
        //   isHouse: 0
        // }, {
        //   chargeId: 1,
        //   chargeMonth: '2017-2018',
        //   chargeYear: '2017',
        //   chargeArea: 150,
        //   totalAccount: 3000,
        //   price: 23,
        //   ceSubsidyPrice: 26,
        //   isHouse: 0
        // }, {
        //   chargeId: 1,
        //   chargeMonth: '2018-2019',
        //   chargeYear: '2018',
        //   chargeArea: 150,
        //   totalAccount: 3000,
        //   price: 23,
        //   ceSubsidyPrice: 26,
        //   isHouse: 0
        // }]
        this.previousPeriod = result.previousPeriod;
        if (this.previousPeriod.length > 0) {
          this.showOwe();
        } else {
          // 测试数据
          // result.curPeriod = {
          //   chargeId: 1,
          //   chargeMonth: '2018-2019',
          //   chargeYear: '2018',
          //   chargeArea: 150,
          //   price: 23,
          //   ceSubsidyPrice: 26,
          //   isHouse: 1
          // }
          const period = result.curPeriod;
          this.isHouse = period.isHouse;
          if (this.isHouse === 0) {
            this.paymentMethod = 'reimburseAll';
          }
          this.payingPeriod = [this.getPeriod(period)];
          // 参照往年-发票
          this.getPreviousYear();
        }
      });
    },
    // 参照往年-发票
    getPreviousYear: function () {
      chargeApi.getPreviousYear(this.curHouse.houseId).then(result => {
        if (result.status === 1) {
          this.previousYear = result.data;
          console.log(JSON.stringify(this.previousYear));
          if (this.previousYear.flag === 1) {
            // 户主姓名为空或者户主姓名为“无”，参照往年默认选中
            if (!this.previousYear.ownerName || this.previousYear.ownerName === '无') {
              this.previousYear.isDefault = 1;
            }
            if (this.previousYear.isDefault === 0 && !this.validateNameFlag) {
              this.$dialog.confirm({
                message: '该房屋有往年交费信息可参照，请问是否参照？'
              }).then(() => {
                this.paymentMethod = 'reference';
                this.showValidateNamePopup = true;
              });
            } else {
              this.paymentMethod = 'reference';
              this.doRefer();
            }
          }
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    // 参照往年
    doRefer: function () {
      const visibility = {
        selfPayCard: false,
        reimburseCard: false
      };
      const selfPay = {
      };
      const reimbursePartArray = [];
      const invoices = this.previousYear.invoices;
      for (let index = 0; index < invoices.length; index++) {
        const invoice = invoices[index];
        if (invoice.invoiceTypeId === constant.invoice_type.selfPay) {
          visibility.selfPayCard = true;
          selfPay.area = invoice.invoiceArea;
          selfPay.title = invoice.pTitle;
        } else {
          visibility.reimburseCard = true;
          reimbursePartArray.push({
            area: invoice.invoiceArea,
            titleCategory: (invoice.invoiceTitleTypeId === constant.invoice_title_type.business ? 'business' : 'nonbusiness'),
            title: invoice.pTitle,
            taxNo: invoice.pTaxNo,
            bank: invoice.pBankName,
            bankAccount: invoice.pAccountNo,
            address: invoice.pAddress,
            mobile: invoice.pTelephone,
            reimbursementApplicant: invoice.applicant,
            showMoreFields: false
          });
        }
      }
      for (var index = 0; index < reimbursePartArray.length; index++) {
        reimbursePartArray[index].id = 'p-' + (index + 1);
        reimbursePartArray[index].deletable = index > 0;
      }
      if (visibility.selfPayCard) {
        if (visibility.reimburseCard) {
          // 部分报销
          visibility.selfPayAreaField = true;
          visibility.btnAddInvoice = reimbursePartArray.length < 2;
        } else {
          // 全部自费
          visibility.selfPayAreaField = false;
          visibility.btnAddInvoice = false;
        }
      } else {
        // 全部报销
        visibility.selfPayAreaField = false;
        visibility.btnAddInvoice = reimbursePartArray.length < 3;
      }
      this.payingPeriod[0].visibility = visibility;
      this.payingPeriod[0].selfPay = selfPay;
      this.payingPeriod[0].reimbursePartArray = reimbursePartArray;
    },
    changePaymentMethod: function () {
      for (var index = 0; index < this.payingPeriod.length; index++) {
        if (this.paymentMethod === 'selfPay') {
          this.payingPeriod[index].visibility = {
            selfPayCard: true,
            reimburseCard: false,
            selfPayAreaField: false,
            btnAddInvoice: false
          };
          this.payingPeriod[index].selfPay = {
            area: this.payingPeriod[index].chargeArea
          };
        } else if (this.paymentMethod === 'reimbursePart') {
          this.payingPeriod[index].visibility = {
            selfPayCard: true,
            reimburseCard: true,
            selfPayAreaField: true,
            btnAddInvoice: true
          };
          this.payingPeriod[index].selfPay = {
            area: this.payingPeriod[index].chargeArea
          };
          this.payingPeriod[index].reimbursePartArray = [{
            id: 'p-1',
            area: 0,
            titleCategory: 'business',
            title: '',
            taxNo: '',
            bank: '',
            bankAccount: '',
            address: '',
            mobile: '',
            reimbursementApplicant: '',
            showMoreFields: false,
            deletable: false
          }];
        } else if (this.paymentMethod === 'reimburseAll') {
          this.payingPeriod[index].visibility = {
            selfPayCard: false,
            reimburseCard: true,
            selfPayAreaField: false,
            btnAddInvoice: true
          };
          this.payingPeriod[index].reimbursePartArray = [{
            id: 'p-1',
            area: this.payingPeriod[index].chargeArea,
            titleCategory: 'business',
            title: '',
            taxNo: '',
            bank: '',
            bankAccount: '',
            address: '',
            mobile: '',
            reimbursementApplicant: '',
            showMoreFields: false,
            deletable: false
          }];
        } else if (this.paymentMethod === 'reference') {
          if (this.previousYear.isDefault === 0 && !this.validateNameFlag) {
            this.showValidateNamePopup = true;
          } else {
            this.doRefer();
          }
        }
      }
    },
    addInvoice: function (period) {
      let paymentMethod = this.paymentMethod;
      if (paymentMethod === 'reference') {
        if (period.visibility.selfPayCard) {
          if (period.visibility.reimburseCard) {
            paymentMethod = 'reimbursePart';
          } else {
            paymentMethod = 'selfPay';
          }
        } else {
          paymentMethod = 'reimburseAll';
        }
      }
      if (paymentMethod === 'reimbursePart') {
        period.reimbursePartArray.push({
          id: 'p-2',
          area: 0,
          titleCategory: 'business',
          title: '',
          taxNo: '',
          bank: '',
          bankAccount: '',
          address: '',
          mobile: '',
          reimbursementApplicant: '',
          showMoreFields: false,
          deletable: true
        });
        period.visibility.btnAddInvoice = false;
      } else if (paymentMethod === 'reimburseAll') {
        if (period.reimbursePartArray.length === 1) {
          period.reimbursePartArray.push({
            id: 'p-2',
            area: 0,
            titleCategory: 'business',
            title: '',
            taxNo: '',
            bank: '',
            bankAccount: '',
            address: '',
            mobile: '',
            reimbursementApplicant: '',
            showMoreFields: false,
            deletable: true
          });
        } else if (period.reimbursePartArray.length === 2) {
          period.reimbursePartArray.push({
            id: 'p-3',
            area: 0,
            titleCategory: 'business',
            title: '',
            taxNo: '',
            bank: '',
            bankAccount: '',
            address: '',
            mobile: '',
            reimbursementApplicant: '',
            showMoreFields: false,
            deletable: true
          });
          period.visibility.btnAddInvoice = false;
        }
      }
    },
    deleteInvoice: function (period, reimbursePart) {
      let paymentMethod = this.paymentMethod;
      if (paymentMethod === 'reference') {
        if (period.visibility.selfPayCard) {
          if (period.visibility.reimburseCard) {
            paymentMethod = 'reimbursePart';
          } else {
            paymentMethod = 'selfPay';
          }
        } else {
          paymentMethod = 'reimburseAll';
        }
      }
      if (paymentMethod === 'reimbursePart') {
        period.reimbursePartArray.pop();
        period.reimbursePartArray[0].area = this.float.subtract(period.chargeArea, period.selfPay.area);
      } else if (paymentMethod === 'reimburseAll') {
        if (period.reimbursePartArray.length === 2) {
          period.reimbursePartArray.pop();
          period.reimbursePartArray[0].area = period.chargeArea;
        } else if (period.reimbursePartArray.length === 3) {
          if (reimbursePart.id === period.reimbursePartArray[1].id) {
            period.reimbursePartArray.splice(1, 1);
            period.reimbursePartArray[0].area = this.float.subtract(period.chargeArea, period.reimbursePartArray[1].area);
            period.reimbursePartArray[1].id = 'p-2';
          } else if (reimbursePart.id === period.reimbursePartArray[2].id) {
            period.reimbursePartArray.pop();
            period.reimbursePartArray[1].area = this.float.subtract(period.chargeArea, period.reimbursePartArray[0].area);
          }
        }
      }
      period.visibility.btnAddInvoice = true;
    },
    toggleInvoice: function (reimbursePart) {
      reimbursePart.showMoreFields = !reimbursePart.showMoreFields;
    },
    changeSelfPayArea: function (period) {
      let paymentMethod = this.paymentMethod;
      if (paymentMethod === 'reference') {
        if (period.visibility.selfPayCard) {
          if (period.visibility.reimburseCard) {
            paymentMethod = 'reimbursePart';
          } else {
            paymentMethod = 'selfPay';
          }
        } else {
          paymentMethod = 'reimburseAll';
        }
      }
      if (paymentMethod === 'reimbursePart') {
        if (period.reimbursePartArray.length === 1) {
          period.reimbursePartArray[0].area = this.float.subtract(period.chargeArea, period.selfPay.area);
        }
      }
    },
    changeReimburseArea: function (period, reimbursePart) {
      if (period.isPartOwe === 0) {
        let paymentMethod = this.paymentMethod;
        if (paymentMethod === 'reference') {
          if (period.visibility.selfPayCard) {
            if (period.visibility.reimburseCard) {
              paymentMethod = 'reimbursePart';
            } else {
              paymentMethod = 'selfPay';
            }
          } else {
            paymentMethod = 'reimburseAll';
          }
        }
        if (paymentMethod === 'reimbursePart') {
          if (period.reimbursePartArray.length === 1) {
            period.selfPay.area = this.float.subtract(period.chargeArea, period.reimbursePartArray[0].area);
          }
        } else if (paymentMethod === 'reimburseAll') {
          if (period.reimbursePartArray.length === 1) {
            period.reimbursePartArray.push({
              id: 'p-2',
              area: this.float.subtract(period.chargeArea, reimbursePart.area),
              titleCategory: 'business',
              title: '',
              taxNo: '',
              bank: '',
              bankAccount: '',
              address: '',
              mobile: '',
              reimbursementApplicant: '',
              showMoreFields: false,
              deletable: true
            });
          } else if (period.reimbursePartArray.length === 2) {
            if (reimbursePart.id === period.reimbursePartArray[0].id) {
              period.reimbursePartArray[1].area = this.float.subtract(period.chargeArea, reimbursePart.area);
            } else {
              period.reimbursePartArray[0].area = this.float.subtract(period.chargeArea, reimbursePart.area);
            }
          }
        }
      }
    },
    changeTitleCategory: function (reimbursePart) {
      reimbursePart.title = '';
      reimbursePart.taxNo = '';
      reimbursePart.bank = '';
      reimbursePart.bankAccount = '';
      reimbursePart.address = '';
      reimbursePart.mobile = '';
    },
    hideValidateName: function () {
      this.showValidateNamePopup = false;
      if (this.payingPeriod[0].visibility.selfPayCard) {
        if (this.payingPeriod[0].visibility.reimburseCard) {
          this.paymentMethod = 'reimbursePart';
        } else {
          this.paymentMethod = 'selfPay';
        }
      } else {
        this.paymentMethod = 'reimburseAll';
      }
    },
    selectValidateName: function () {
      this.showValidateNamePopup = false;
      this.validateNameFlag = true;
      this.doRefer();
    },
    showOwe: function () {
      this.showOweList = true;
    },
    hideOwe: function () {
      // ToDo
      if (this.payingPeriod.length === 0) {
        this.goBack();
      } else {
        this.showOweList = false;
      }
    },
    selectOwe: function (records) {
      this.showOweList = false;
      this.isCurrentYear = 0;
      this.paymentMethod = 'reimburseAll';
      this.payingPeriod = [];
      for (var index = 0; index < records.length; index++) {
        this.payingPeriod.push(this.getPeriod(records[index]));
      }
    },
    showInvoiceTitle: function (reimbursePart) {
      this.showInvoiceTitleList = true;
      this.reimbursePart = reimbursePart;
      this.invoiceTitleType = reimbursePart.titleCategory === 'business' ? constant.invoice_title_type.business : constant.invoice_title_type.nonbusiness;
    },
    hideInvoiceTitle: function () {
      this.showInvoiceTitleList = false;
      this.reimbursePart = null;
    },
    selectInvoiceTitle: function (record) {
      this.showInvoiceTitleList = false;
      this.reimbursePart.title = record.pTitle;
      this.reimbursePart.taxNo = record.pTaxNo;
      this.reimbursePart.bank = record.pBankName;
      this.reimbursePart.bankAccount = record.pAccountNo;
      this.reimbursePart.address = record.pAddress;
      this.reimbursePart.mobile = record.pTelephone;
    },
    next: function () {
      if (this.verify()) {
        this.$router.push({
          name: 'confirmOrder',
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
    getPeriod: function (period) {
      console.log(JSON.stringify(period));
      var result = {
        chargeId: period.chargeId,
        chargeMonth: period.chargeMonth,
        chargeYear: period.chargeYear,
        chargeArea: period.chargeArea,
        price: period.price,
        ceSubsidyPrice: period.ceSubsidyPrice,
        totalAccount: period.totalAccount,
        isPartOwe: period.isPartOwe
      };
      if (this.paymentMethod === 'selfPay') {
        result.visibility = {
          selfPayCard: true,
          reimburseCard: false,
          selfPayAreaField: false,
          btnAddInvoice: false
        };
        result.selfPay = {
          area: period.chargeArea
        };
        result.reimbursePartArray = [];
      } else if (this.paymentMethod === 'reimburseAll') {
        result.visibility = {
          selfPayCard: false,
          reimburseCard: true,
          selfPayAreaField: false,
          btnAddInvoice: period.isPartOwe === 0
        };
        result.selfPay = {};
        result.reimbursePartArray = [{
          id: 'p-1',
          area: period.chargeArea,
          titleCategory: 'business',
          title: '',
          taxNo: '',
          bank: '',
          bankAccount: '',
          address: '',
          mobile: '',
          reimbursementApplicant: '',
          showMoreFields: false,
          deletable: false
        }];
      }
      return result;
    },
    verify: function () {
      for (var idx = 0; idx < this.payingPeriod.length; idx++) {
        const period = this.payingPeriod[idx];
        let paymentMethod = this.paymentMethod;
        if (paymentMethod === 'reference') {
          if (period.visibility.selfPayCard) {
            if (period.visibility.reimburseCard) {
              paymentMethod = 'reimbursePart';
            } else {
              paymentMethod = 'selfPay';
            }
          } else {
            paymentMethod = 'reimburseAll';
          }
        }
        if (paymentMethod === 'selfPay') {
          const reg = /^.{2,5}$/;
          if (!reg.test(period.selfPay.title)) {
            this.$toast('发票抬头最少2个字最多5个字');
            return false;
          }
          if (period.selfPay.title === '个人') {
            this.$toast('发票抬头不能是“个人”');
            return false;
          }
        } else if (paymentMethod === 'reimbursePart') {
          if (!period.selfPay.title) {
            this.$toast('请输入发票抬头!');
            return false;
          }
          if (period.selfPay.title === '个人') {
            this.$toast('发票抬头不能是“个人”');
            return false;
          }
          if (!period.selfPay.area) {
            this.$toast('请输入自费面积!');
            return false;
          } else {
            const reg = /^\d+\.?\d{0,2}$/;
            if (!reg.test(period.selfPay.area)) {
              this.$toast('自费面积最多2位小数');
              return false;
            }
          }
          let totalArea = period.selfPay.area;
          for (let i = 0; i < period.reimbursePartArray.length; i++) {
            const reimburse = period.reimbursePartArray[i];
            if (!reimburse.title) {
              this.$toast('请输入发票抬头!');
              return false;
            }
            if (reimburse.title === '个人') {
              this.$toast('发票抬头不能是“个人”');
              return false;
            }
            if (!reimburse.area) {
              this.$toast('请输入报销面积!');
              return false;
            } else {
              const reg = /^\d+\.?\d{0,2}$/;
              if (!reg.test(reimburse.area)) {
                this.$toast('报销面积最多2位小数');
                return false;
              }
            }
            if (reimburse.reimbursementApplicant) {
              const reg = /^.{2,5}$/;
              if (!reg.test(reimburse.reimbursementApplicant)) {
                this.$toast('报销人最少2个字最多5个字');
                return false;
              }
            }
            totalArea = this.float.add(totalArea, reimburse.area);
          }
          if (!this.float.isEqual(totalArea, period.chargeArea, 2)) {
            this.$toast('发票自费/报销面积之和与交费面积不一致！');
            return false;
          }
        } else if (paymentMethod === 'reimburseAll') {
          let totalArea = 0;
          for (let i = 0; i < period.reimbursePartArray.length; i++) {
            const reimburse = period.reimbursePartArray[i];
            if (!reimburse.title) {
              this.$toast('请输入发票抬头!');
              return false;
            }
            if (reimburse.title === '个人') {
              this.$toast('发票抬头不能是“个人”');
              return false;
            }
            if (!reimburse.area) {
              this.$toast('请输入报销面积!');
              return false;
            } else {
              const reg = /^\d+\.?\d{0,2}$/;
              if (!reg.test(reimburse.area)) {
                this.$toast('报销面积最多2位小数');
                return false;
              }
            }
            if (reimburse.reimbursementApplicant) {
              const reg = /^.{2,5}$/;
              if (!reg.test(reimburse.reimbursementApplicant)) {
                this.$toast('报销人最少2个字最多5个字');
                return false;
              }
            }
            totalArea = this.float.add(totalArea, reimburse.area);
          }
          if (!this.float.isEqual(totalArea, period.chargeArea, 2)) {
            this.$toast('发票自费/报销面积之和与交费面积不一致！');
            return false;
          }
        }
      }
      return true;
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
    justify-content: space-around;
    align-items: center;
  }
  .yearCard {
    width: 720px;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
  }
  .orderInfo {
    width: 690px;
    height: 100px;
    background: #ffffff;
    margin-left: 30px;
    margin-top: 20px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .orderInfo-left {
    margin-left: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .orderInfo-left img {
    width: 60px;
    height: 60px;
  }
  .orderInfo-left .year {
    font-size: 30px;
    color: #333333;
    margin-left: 30px;
    white-space: nowrap;
  }
  .orderInfo-right {
    margin-right: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .orderInfo-right .sqtLabel {
    font-size: 26px;
    color: #999999;
    white-space: nowrap;
  }
  .orderInfo-right .sqtValue {
    font-size: 26px;
    color: #333333;
    margin-left: 10px;
  }
  .orderInfo-right .wnqfjf {
    font-size: 22px;
    color: #ff6016;
    background-color: #fff;
    border: 1px solid #ff6016;
    padding: 5px;
    margin-left: 10px;
  }
  .invoInfo {
    width: 690px;
    margin-left: 30px;
    margin-top: 20px;
    background-color: #fff;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  .invoiceTitle {
    width: 690px;
    height: 86px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .invoiceTitle-left {
    margin-left: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .invoiceTitle-left p {
    width: 6px;
    height: 26px;
    background: linear-gradient(to right, #ff8850, #ff6016);
  }
  .invoiceTitle-left .name {
    font-size: 30px;
    color: #333333;
    margin-left: 30px;
  }
  .invoiceTitle-right {
    margin-right: 30px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .invoiceTitle-right .sqtLabel {
    font-size: 26px;
    color: #999999;
  }
  .invoiceTitle-right .sqtValue {
    font-size: 26px;
    color: #333333;
    margin-left: 20px;
  }
  .invoiceTitle-right img {
    width: 22px;
    height: 22px;
    margin-left: 20px;
  }
  .invoInfo .line {
    border-top: 1px solid #e8e8e8;
    width: 630px;
    height: 88px;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .line input::-webkit-input-placeholder {
    font-size: 28px;color: #999999;
  }
  .line input:-moz-placeholder {
    font-size: 28px;color: #999999;
  }
  .line input::-moz-placeholder {
    font-size: 28px;color: #999999;
  }
  .line input:-ms-input-placeholder {
    font-size: 28px;color: #999999;
  }
  .u {
    border-top: none;
  }
  .invoInfo .line .label {
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
    width: 456px;
    font-size: 28px;
    color: #333333;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .invoInfo .line .input .titlePicker {
    height: 66px;
    width: 456px;
    border: 1px solid #e8e8e8;
    font-size: 28px;
    color: #333333;
    display: flex;
    display: -webkit-flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  .invoInfo .line .input .titlePicker span {
    width: 424px;
    padding-left: 20px;
    text-align: left;
  }
  .invoInfo .line .input .titlePicker img {
    width: 12px;height: 21px;
    margin-left: 20px;
    margin-right: 20px;
  }
  .invoInfo .line .input input {
    height: 66px;
    width: 456px;
    font-size: 28px;
    color: #333333;
    border: 1px solid #e8e8e8;
    padding-left: 20px;
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
  .radio {
    font-size: 28px;
    color: #333333;
  }
  .radio .van-radio-group {
    width: 300px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .btnAddInvoBar {
    width: 690px;
    height: 128px;
    margin-left: 30px;
    background-color: #fff;
  }
  .btnAddInvo {
    width: 630px;
    height: 88px;
    margin-left: 30px;
    margin-bottom: 20px;
    margin-top: 20px;
    border-radius: 10px;
    font-size: 32px;
    color: #999999;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background-color: #fff;
  }
  .btnAddInvo img {
    margin-left: 30px;
    margin-right: 30px;
    width: 48px;
    height: 48px;
  }
  .btnAddInvo div {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .btnAddInvo .arrow {
    margin-right: 30px;
    width: 18px;
    height: 30px;
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

.van-radio-group {
  width: 630px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.el-radio-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.el-radio {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.van-radio img {
  width: 28px;
  height: 28px;
}

.validate-name {
  width: 565px;
  border-radius: 10px;
}

.owe-list {
  width: 690px;
}

.invoice-title-list {
  width: 750px;
  height: 100%;
  background-color: #f4f5fa;
}
</style>
