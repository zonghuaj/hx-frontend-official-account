<template>
  <div class="popup-window">
    <div class="ove-title">
      <div class="ove-title-tp"><img src="@/assets/icon/pay_win_icon_year.png"/></div>
      <div class="ove-title-bt"><span>请选择欠费年度</span></div>
      <div class="ove-title-jj"><span>用户您好，请先结清全部欠费后，再交纳当年采暖费。</span></div>
    </div>
    <div class="ove-con">
      <table >
        <tr align="center">
          <td>欠费年度</td>
          <td>欠费金额（元）</td>
          <td>欠费面积（㎡）</td>
          <td><img :src="icon.normal"/></td>
        </tr>
        <tr align="center" v-for="period in previousPeriod" :key="period.chargeYear">
          <td @click="select(period)">{{ period.chargeYear }}</td>
          <td @click="select(period)">{{ period.totalAccount }}</td>
          <td @click="select(period)">{{ period.chargeArea }}</td>
          <td @click="select(period)" class="radio">
            <van-checkbox v-model="period.checked">
              <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal">
            </van-checkbox>
          </td>
        </tr>
      </table>
    </div>
    <div class="ove-button">
      <input id="btnCalcel" type="button" value="取消" @click="doCancel()"/>
      <input id="btnConfirm" type="button" value="确定" @click="doConfirm()"/>
    </div>
  </div>
</template>

<script>
import constant from '@/assets/js/constant';

export default {
  name: 'OweList',
  components: {
  },
  data () {
    return {
      icon: constant.checkboxStyle.icon
    };
  },
  props: ['previousPeriod'],
  methods: {
    select: function (period) {
      if (period.checked) {
        this.$set(period, 'checked', false);
      } else {
        this.$set(period, 'checked', true);
      }
    },
    doConfirm: function () {
      const records = [];
      for (var index = 0; index < this.previousPeriod.length; index++) {
        const period = this.previousPeriod[index];
        if (period.checked) {
          records.push(period);
        }
      }
      if (records.length === 0) {
        this.$toast('请选择欠费年度！');
        return;
      }
      this.$emit('confirm', records);
    },
    doCancel: function () {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
  .popup-window{
    width: 690px;border-radius: 10px;
    background-color: #fff;
    position: relative;padding-top: 308px;margin-top: 64px;
  }
  .ove-title{
    width: 630px;
    margin: 0 30px 20px 30px;
    display: flex;flex-direction: column;
    padding-bottom: 30px;border-bottom: 1px solid #e8e8e8;position: absolute;top: -64px;
  }
  .ove-title>div{
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .ove-title .ove-title-tp>img{
    width: 230px;height: 230px;
  }
  .ove-title .ove-title-bt>span{
    font-size: 36px;color: #333;
  }
  .ove-title .ove-title-jj{
    margin-top: 20px;
  }
  .ove-title .ove-title-jj>span{
    font-size:24px;color: #333;
  }
  .ove-con{
    width: 690px;
    padding: 0 30px;
    box-sizing: border-box;
  }
  .ove-con table{
    width: 630px;border-collapse:collapse;
  }
  .ove-con table tr{
    height: 88px;
    font-size: 28px;
    color: #666;
    border-bottom:1px solid #e8e8e8;
  }
  .ove-con table tr:nth-child(1){
    font-size: 28px;color: #999;
    height: 40px;
    border-top: none;
  }
  .ove-con table tr:nth-child(4){
    border-bottom: none;
  }
  .ove-con table tr td{
    border:0px;
    white-space: nowrap;
  }
  .ove-con table tr td img{
      width: 28px;
      height: 28px;
  }
  .ove-con table tr td:nth-child(4){
    text-align: right;
  }
  .ove-con table tr td:nth-child(1){
    width: 120px;
  }
  .ove-con table tr td:nth-child(2){
    width: 250px;
  }
  .ove-con table tr td:nth-child(3){
    width: 200px;
  }
  .ove-con table tr td:nth-child(4){
    width: 28px;
  }
  .ove-button{
    width: 690px;height: 88px;border-top: 1px solid #e8e8e8;display: flex;flex-direction: row;
  }
  .ove-button input{
    height: 88px;font-size: 28px;color: #666;text-align: center;line-height: 88px;
  }
  .ove-button input:nth-child(1){
    width: 345px;border-right: 1px solid #e8e8e8;box-sizing: border-box;border-radius: 0 0 0 10px;
  }
  .ove-button input:nth-child(2){
    width: 345px;border-radius: 0 0 10px 0;
  }
  #btnConfirm {color: #ff6016;}
</style>
