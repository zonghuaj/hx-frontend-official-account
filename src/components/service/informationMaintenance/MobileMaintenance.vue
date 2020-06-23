<template>
  <div id="content" class="content">
    <header>
      <i @click="goBack()"></i>
      <div class="heds-nr"><span>预留手机号维护</span>
      </div>
    </header>
    <house-card :curHouse="curHouse" :bindHouse="bindHouse" @switch="switchHouse"></house-card>
    <div class="ylsjh-bgxx">
      <div class="sjh">
        <div class="sjh-title"><div class="sjh-title-dian"></div><span>选择预留手机号</span></div>
        <div class="sjh-con">
          <div class="sjh-left"><span class="huisezi">预留手机号</span></div>
          <div class="sjh-right">
            <input class="heisezi xzsjh" type="text" value="130xxxx1111"/>
            <img class="xzsjh-jt" src="assets/icon/maintain_icon_xl.png" alt="" />
          </div>
        </div>
        <div class="sjh-con">
          <div class="sjh-left"><span class="huisezi">手机验证码</span></div>
          <div class="sjh-right">
            <input class="heisezi sryzm" type="text" placeholder="请输入验证码"/>
            <input class="chengsezi" type="button" value="发送验证码" />
          </div>
        </div>
      </div>
      <div class="sjh">
        <div class="sjh-title"><div class="sjh-title-dian"></div><span>变更信息</span></div>
        <div class="sjh-con">
          <div class="sjh-left"><span class="huisezi">预留手机号</span></div>
          <div class="sjh-right">
            <input class="heisezi xzsjh" type="text" placeholder="请输入新手机号"/>
          </div>
        </div>
        <div class="sjh-con">
          <div class="sjh-left"><span class="huisezi">手机验证码</span></div>
          <div class="sjh-right">
            <input class="heisezi sryzm" type="text" placeholder="请输入验证码"/>
            <input class="chengsezi" type="button" value="发送验证码" />
          </div>
        </div>
      </div>
    </div>
    <div class="tjao">
      <input type="button" name="" id="" value="提交申请" />
    </div>
  </div>
</template>

<script>
import HouseCard from '@/components/common/HouseCard';

export default {
  name: 'MobileMaintenance',
  components: {
    [HouseCard.name]: HouseCard
  },
  data () {
    return {
      curHouse: {},
      bindHouse: []
    };
  },
  beforeMount: function () {
    var params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
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
        name: 'informationMaintenance',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    switchHouse: function (item) {
      this.curHouse = item;
    }
  }
};
</script>

<style scoped>
#content{
  width: 750px;display: flex;flex-direction: column;
}
.content{
  background-color: #f4f5fa;
}
header{
   width: 100%;height: 88px;background-color:#e3e3e3;font-size: 36px;color: #333333;text-align: center;line-height:88px ;position: relative;
}
header i{
  width: 20px;height: 35px;position: absolute;top: 26px;left: 30px;background: url(../../../assets/icon/ty_icon_back.png) no-repeat center;background-size: 20px 36px;
}
.sy-dqfw{
  width: 100%;background-color: #f4f5fa;padding: 0 30px;box-sizing: border-box;
}
.sy-dqfw .dqfw{
  width: 690px;height: 137px;border-radius: 10px;background-color: #fff;display: flex;flex-direction: row;box-shadow:0 0 8px #fb2b2b2 inset;margin-top: 20px;
}
.sy-dqfw .dqfw .shouye-tx{
  height: 100%;width: 100px;padding: 0 20px;box-sizing: border-box;position: relative;
 }
.sy-dqfw .dqfw .shouye-tx>.touxiang{
  display: inline-block;position: absolute;margin: auto auto;top: 0;right: 0;bottom: 0;left: 0;text-align: center; color: #fff;
}
.sy-dqfw .dqfw .shouye-tx>.touxiang>p{
  display: inline-block;
  width: 38px;
  font-size: 18px;
  margin: 18px 0;
}
.sy-dqfw .dqfw .address{
  width: 504px;
}
.sy-dqfw .dqfw .address h3{
  width: 100%;font-size: 30px;color: #333;margin-top: 20px;overflow: hidden; white-space: nowrap;
}
.sy-dqfw .dqfw .address>.dzxx{
  width: 100%;font-size: 22px;color: #666666;margin-top: 20px;overflow: hidden;
}
.sy-dqfw .dqfw .address>.dzxx>span{
  margin-right: 20px;display: inline-block; white-space: nowrap;
}
.sy-dqfw .dqfw .address>.dzxx>.span1{
  background-color: #f4f4f4;padding: 0 10px;
}
.sy-dqfw .dqfw .address>.dzxx>.moren{
  background-color: #fff0e9;color: #ff7803;
}
.sy-dqfw .dqfw .address>.dzxx>.jia{
  background-color: #ff6016;color: #fff;
}
.sy-dqfw .dqfw .the-editor{
  height: 100%;width: 88px;display: flex;flex-direction: row;justify-content: flex-end;align-items: center;
}
.sy-dqfw .dqfw .the-editor>img{
  width: 18px;height: 30px;margin-right: 30px;
}
.sy-dqfw .dqfw .shouye-tx{
  height: 100%;width: 120px;padding: 0 20px;box-sizing: border-box;position: relative;
}
.sy-dqfw .dqfw .shouye-tx>.touxiang{
  width: 80px;height: 80px;background: url(../../../assets/icon/sy_house.png) no-repeat center;background-size: 80px 80px; font-size: 18px;
}
.wjyw{
  width: 690px;margin: 0 30px;
}
.wjyw .wjyw-list{
  width: 690px;height: 120px;background-color: #fff;border-radius:10px ;margin-top: 20px;box-shadow:0 0 8px #fb2b2b2 inset;
}
.wjyw .wjyw-list>a{
  width: 690px;height: 120px;border-radius:10px ;display: flex;justify-content: space-between;align-items: center;
}
.wjyw .wjyw-list>a .list-left{
  display: flex;justify-content: flex-start;align-items: center;
}
.wjyw .wjyw-list>a .list-left .list-left-tp{
  margin:0 20px 0 30px;
}
.wjyw .wjyw-list>a .list-left .list-left-tp>img{
  width: 60px;height: 60px;
}
.wjyw .wjyw-list>a .list-left .list-left-wz>span{
  font-size: 28px;color: #333;
}
.wjyw .wjyw-list>a .list-right{
  margin-right: 34px;
}
.wjyw .wjyw-list>a .list-right>img{
  width: 18px;height: 30px;
}
.ylsjh-bgxx{
  width: 690px;margin: 0 30px;display: flex;flex-direction: column;
}
.ylsjh-bgxx .sjh{
  width: 690px;display: flex;flex-direction: column;background-color: #fff;border-radius: 10px;margin-top: 20px;padding: 0 30px;box-sizing: border-box;
}
.sjh-title{
  width: 630px;height: 90px;display: flex;flex-direction: row;justify-content: flex-start;align-items: center;
}
.sjh-title .sjh-title-dian{
  width: 6px;height: 26px;
  background: -webkit-linear-gradient(left,  #ff8500,#ff6016);
    background: -o-linear-gradient(right, #ff8500,#ff6016);
    background: -moz-linear-gradient(right, #ff8500,#ff6016);
    background: linear-gradient(to right, #ff8500,#ff6016);
}
.sjh-title>span{
  font-size: 28px;color: #333;margin-left: 20px;
}
.sjh-con{
  width: 630px;height: 88px;display: flex;flex-direction: row;justify-content: space-between;align-items: center;border-top: 1px solid #e8e8e8;
}
.huisezi{
  font-size: 28px;color: #999;
}
.heisezi{
  font-size: 28px;color: #333;
}
.chengsezi{
  font-size: 28px;color: #ff6016;background-color: #fff;padding: 0 20px;border-left: 1px solid #e8e8e8;
}
.sjh-right{
  width: 433px;height: 54px;border: 1px solid #e8e8e8;display: flex;flex-direction: row;justify-content: space-between;align-items: center;padding-left: 50px;box-sizing: border-box;
}
.xzsjh{
  width: 220px;
}
.xzsjh-jt{
  width: 18px;height: 10px;margin-right: 20px;
}
.sryzm{
  width: 190px;
}
.tjao{
  width: 690px;height: 88px; margin: 30px 30px 0 30px;
}
.tjao>input{
  width: 690px;height: 88px;border-radius: 10px;font-size: 32px;color: #fff;
  background: -webkit-linear-gradient(left,  #ff8500,#ff6016);
    background: -o-linear-gradient(right, #ff8500,#ff6016);
    background: -moz-linear-gradient(right, #ff8500,#ff6016);
    background: linear-gradient(to right, #ff8500,#ff6016);
}
</style>
