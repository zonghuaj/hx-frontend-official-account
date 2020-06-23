import { axiosGet, axiosPost, get, post } from '@/api/axios';
import constant from '@/assets/js/constant';
import float from '@/utils/float';

// 参照往年-发票
const getPreviousYear = houseId => {
  return axiosGet('/invoice/reference/house/' + houseId);
};

// 微信支付
const weChatPay = (orderId, params) => {
  return axiosPost('/payment/order/' + orderId + '/wechat/payoff', params);
};

// 删除订单
const deleteOrder = orderId => {
  return axiosPost('/payment/order/' + orderId);
};

const getDefaultHouse = params => { return get('/basic/house/binding', params); };
const getBindHouse = params => {
  return new Promise((resolve, reject) => {
    get('/basic/house/binding', params)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const getPayablePeriod = houseId => {
  return new Promise((resolve, reject) => {
    get('/payment/house/' + houseId + '/payable', {})
      .then(res => {
        var previousPeriod = [];
        var curPeriod = {};
        const list = res.data;
        for (var i = 0; i < list.length; i++) {
          const period = list[i];
          period.chargeYear = period.chargeMonth.substring(0, 4);
          if (period.isCurrentYear) {
            curPeriod = period;
          } else {
            previousPeriod.push(period);
          }
        }
        resolve({
          previousPeriod: previousPeriod,
          curPeriod: curPeriod
        });
      })
      .catch(err => {
        reject(err);
      });
  });
};

const saveOrder = (houseId, val) => {
  var params = {
    isCurrentYear: val.isCurrentYear,
    isHouse: val.isHouse,
    invoiceCount: val.invoQty,
    totalAmount: val.orderAmount,
    systemChannel: constant.system_channel.wechat,
    details: []
  };
  const payingPeriod = val.payingPeriod;
  const paymentMethod = val.paymentMethod;
  if (paymentMethod === 'selfPay') {
    for (let idx = 0; idx < payingPeriod.length; idx++) {
      const period = payingPeriod[idx];
      const detail = {
        area: period.chargeArea,
        amount: period.amount,
        chargeMonth: period.chargeMonth,
        reimbursementType: constant.reimbursement_type.selfPay,
        chargeId: period.chargeId,
        isPartOwe: period.isPartOwe,
        invoices: [{
          invoiceTypeId: constant.invoice_type.selfPay,
          invoiceTitleTypeId: constant.invoice_title_type.nonbusiness,
          invoiceArea: period.selfPay.area,
          invoiceAmount: period.selfPay.chargeAmount,
          pTitle: period.selfPay.title,
          pTaxNo: null,
          pBankName: null,
          pAccountNo: null,
          pAddress: null,
          pTelephone: null,
          applicant: null
        }]
      };
      params.details.push(detail);
    }
  } else if (paymentMethod === 'reimbursePart') {
    for (let idx = 0; idx < payingPeriod.length; idx++) {
      const period = payingPeriod[idx];
      const detail = {
        area: period.chargeArea,
        amount: period.amount,
        chargeMonth: period.chargeMonth,
        reimbursementType: constant.reimbursement_type.reimbursementPart,
        chargeId: period.chargeId,
        isPartOwe: period.isPartOwe,
        invoices: [{
          invoiceTypeId: constant.invoice_type.selfPay,
          invoiceTitleTypeId: constant.invoice_title_type.nonbusiness,
          invoiceArea: period.selfPay.area,
          invoiceAmount: period.selfPay.chargeAmount,
          pTitle: period.selfPay.title,
          pTaxNo: null,
          pBankName: null,
          pAccountNo: null,
          pAddress: null,
          pTelephone: null,
          applicant: null
        }]
      };
      const reimbursePartQty = period.reimbursePartArray.length;
      for (let i = 0; i < reimbursePartQty; i++) {
        const reimbursePart = period.reimbursePartArray[i];
        detail.invoices.push({
          invoiceTypeId: constant.invoice_type.reimbursement,
          invoiceTitleTypeId: (reimbursePart.titleCategory === 'business' ? constant.invoice_title_type.business : constant.invoice_title_type.nonbusiness),
          invoiceArea: reimbursePart.area,
          invoiceAmount: reimbursePart.chargeAmount,
          pTitle: reimbursePart.title,
          pTaxNo: reimbursePart.taxNo,
          pBankName: reimbursePart.bank,
          pAccountNo: reimbursePart.bankAccount,
          pAddress: reimbursePart.address,
          pTelephone: reimbursePart.mobile,
          applicant: reimbursePart.reimbursementApplicant
        });
      }
      params.details.push(detail);
    }
  } else if (paymentMethod === 'reimburseAll') {
    for (let idx = 0; idx < payingPeriod.length; idx++) {
      const period = payingPeriod[idx];
      const detail = {
        area: period.chargeArea,
        amount: period.amount,
        chargeMonth: period.chargeMonth,
        reimbursementType: constant.reimbursement_type.reimbursementAll,
        chargeId: period.chargeId,
        isPartOwe: period.isPartOwe,
        invoices: []
      };
      const reimbursePartQty = period.reimbursePartArray.length;
      for (let i = 0; i < reimbursePartQty; i++) {
        const reimbursePart = period.reimbursePartArray[i];
        detail.invoices.push({
          invoiceTypeId: constant.invoice_type.reimbursement,
          invoiceTitleTypeId: (reimbursePart.titleCategory === 'business' ? constant.invoice_title_type.business : constant.invoice_title_type.nonbusiness),
          invoiceArea: reimbursePart.area,
          invoiceAmount: reimbursePart.chargeAmount,
          pTitle: reimbursePart.title,
          pTaxNo: reimbursePart.taxNo,
          pBankName: reimbursePart.bank,
          pAccountNo: reimbursePart.bankAccount,
          pAddress: reimbursePart.address,
          pTelephone: reimbursePart.mobile,
          applicant: reimbursePart.reimbursementApplicant
        });
      }
      params.details.push(detail);
    }
  }
  // Post
  return new Promise((resolve, reject) => {
    post('/payment/house/' + houseId + '/order', params)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const getOrderInfo = (orderId) => {
  return new Promise((resolve, reject) => {
    get('/payment/order/' + orderId + '', {})
      .then(res => {
        var resData = res.data;
        var result = {};
        const payingPeriod = [];

        let invoQty = 0;
        const details = resData.details;
        for (let idx = 0; idx < details.length; idx++) {
          const item = details[idx];
          const period = {
            selfPay: {},
            reimbursePartArray: [],
            chargeArea: item.area,
            amount: item.amount,
            chargeYear: item.chargeMonth.substring(0, 4),
            visibility: {
              selfPayCard: false,
              reimburseCard: false
            }
          };
          const invoices = item.invoices;
          invoQty += invoices.length;
          for (let index = 0; index < invoices.length; index++) {
            const invoce = invoices[index];
            if (invoce.invoiceTypeId === constant.invoice_type.selfPay) {
              period.selfPay.title = invoce.pTitle;
              period.selfPay.chargeAmount = invoce.invoiceAmount;
              period.selfPay.area = invoce.invoiceArea;
              period.ceSubsidyPrice = float.divide(invoce.invoiceAmount, invoce.invoiceArea);
              period.visibility.selfPayCard = true;
            } else {
              period.reimbursePartArray.push({
                chargeAmount: invoce.invoiceAmount,
                area: invoce.invoiceArea,
                titleCategory: (invoce.invoiceTitleTypeId === constant.invoice_title_type.business ? 'business' : 'nonbusiness'),
                title: invoce.pTitle,
                taxNo: invoce.pTaxNo,
                bank: invoce.pBankName,
                bankAccount: invoce.pAccountNo,
                address: invoce.pAddress,
                mobile: invoce.pTelephone,
                reimbursementApplicant: invoce.applicant,
                showMoreFields: false
              });
              period.price = float.divide(invoce.invoiceAmount, invoce.invoiceArea);
              period.visibility.reimburseCard = true;
            }
          }
          result.paymentMethodText = '全部报销';
          if (period.visibility.selfPayCard && period.visibility.reimburseCard) {
            result.paymentMethodText = '部分报销';
          } else if (period.visibility.selfPayCard && !period.visibility.reimburseCard) {
            result.paymentMethodText = '全部自费';
          }
          payingPeriod.push(period);
        }

        result.payingPeriod = payingPeriod;
        result.totalAmount = resData.totalAmount;
        result.invoQty = invoQty;
        result.isCurrentYear = resData.isCurrentYear;
        result.isHouse = resData.isHouse;

        result.payParams = {
          orderId: resData.orderId,
          orderNo: resData.dispOrderNo,
          amount: resData.totalAmount,
          createTime: resData.createTime
        };
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const getPaymentCharge = houseId => {
  return get('/payment/house/' + houseId + '/charge/enabled');
};

export const execWechatPay = (orderId, params) => {
  return new Promise((resolve, reject) => {
    post('/payment/order/' + orderId + '/wechat/payoff', params)
      .then(res => {
        resolve(res.data.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const sendWechatPayResult = (orderId) => {
  return new Promise((resolve, reject) => {
    post('/payment/order/' + orderId + '/wechat/payoff/result', {})
      .then(res => {
        resolve(res.data.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const chargeApi = {
  // 参照往年-发票
  getPreviousYear: getPreviousYear,
  // 微信支付
  weChatPay: weChatPay,
  // 删除订单
  deleteOrder: deleteOrder,
  getDefaultHouse: getDefaultHouse,
  getBindHouse: getBindHouse,
  getPayablePeriod: getPayablePeriod,
  saveOrder: saveOrder,
  getOrderInfo: getOrderInfo,
  execWechatPay: execWechatPay,
  sendWechatPayResult: sendWechatPayResult,
  getPaymentCharge: getPaymentCharge
};
export default chargeApi;
