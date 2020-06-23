<template>
  <div>
    <head-card :title="title"></head-card>
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script>
import HeadCard from '@/components/house/HeadCard';
import orderApi from '@/api/order';
import chargeApi from '@/api/charge';
import { houseBind } from '@/api/house';

export default {
  name: 'ChooseRoom',
  components: {
    HeadCard
  },
  data () {
    return {
      label: null,
      houseId: null,
      title: '选择房屋'
    };
  },
  beforeMount () {
    this.label = this.$route.query.label;
    this.houseId = this.$route.query.houseId;
    this.initPage();
  },
  mounted () {
  },
  methods: {
    initPage: function () {
      if (this.label === 'houseList') {
        this.title = '房屋列表';
      }
      houseBind().then((result) => {
        const houseList = result.data.data;

        if (this.label) {
          if (houseList.length === 1 || (houseList.length > 1 && houseList[0].isDefault === 1)) {
            const house = houseList[0];
            if (this.label === 'serviceHall') {
              this.$router.replace({
                name: 'serviceHall',
                params: {
                  curHouse: house,
                  bindHouse: houseList
                }
              });
            } else if (this.label === 'editInvoice') {
              chargeApi.getPaymentCharge(house.houseId).then(result => {
                if (result.status === 1) {
                  this.$router.replace({
                    name: 'editInvoice',
                    params: {
                      curHouse: house,
                      bindHouse: houseList
                    }
                  });
                } else {
                  this.$dialog.alert({
                    message: result.data.message
                  }).then(() => {
                    this.$router.replace({
                      name: 'serviceEHall', // serviceHall
                      params: {
                        curHouse: house,
                        bindHouse: houseList
                      }
                    });
                  });
                }
              });
            } else if (this.label === 'addRepair') {
              this.$router.replace({
                name: 'addRepair',
                params: {
                  curHouse: house,
                  bindHouse: houseList
                }
              });
            } else if (this.label === 'addComplain') {
              this.$router.replace({
                name: 'addComplain',
                params: {
                  curHouse: house,
                  bindHouse: houseList
                }
              });
            } else if (this.label === 'addStopHeating') {
              orderApi.verifyStopHeating(house.houseId).then(result => {
                if (result.status === 1) {
                  const other = result.data;
                  this.$router.replace({
                    name: 'addStopHeating',
                    params: {
                      curHouse: house,
                      bindHouse: houseList,
                      other: other
                    }
                  });
                } else {
                  this.$dialog.alert({
                    message: result.data.message
                  }).then(() => {
                    this.$router.replace({
                      name: 'serviceHall',
                      params: {
                        curHouse: house,
                        bindHouse: houseList
                      }
                    });
                  });
                }
              });
            } else if (this.label === 'myMaintenance') {
              this.$router.replace({
                name: 'myMaintenance',
                params: {
                  curHouse: house,
                  bindHouse: houseList
                }
              });
            } else if (this.label === 'invoiceList') {
              this.$router.replace({
                name: 'invoiceList',
                params: {
                  curHouse: house,
                  bindHouse: houseList
                }
              });
            } else if (this.label === 'historyOrderList') {
              this.$router.replace({
                name: 'historyOrderList',
                params: {
                  curHouse: house,
                  bindHouse: houseList
                }
              });
            } else {
              this.$router.replace({
                name: 'houseList',
                params: {
                  label: this.label,
                  houseId: this.houseId
                }
              });
            }
          } else {
            this.$router.replace({
              name: 'houseList',
              params: {
                label: this.label,
                houseId: this.houseId
              }
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
</style>
