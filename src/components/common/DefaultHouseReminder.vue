<template>
  <div class="popup">
    <span class="message">您是否将所选择的房屋设置为默认房屋？</span>
    <div class="btn">
      <van-button text="确认" @click="doConfirm" />
      <van-button text="关闭" @click="doClose" />
      <van-button text="不再提醒" @click="doCancleReminder" />
    </div>
  </div>
</template>

<script>
import baseApi from '@/api/base';

export default {
  name: 'DefaultHouseReminder',
  props: [
    'house'
  ],
  data () {
    return {
    };
  },
  beforeMount: function () {
  },
  mounted: function () {
  },
  methods: {
    doConfirm: function () {
      const params = {
        primary: 1
      };
      baseApi.setDefaultHouse(this.house.houseId, this.house.bindId, params).then(result => {
        if (result.status === 1) {
          this.$emit('confirm');
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    doClose: function () {
      this.$emit('close');
    },
    doCancleReminder: function () {
      baseApi.cancelReminder().then(result => {
        if (result.status === 1) {
          this.$emit('close');
        } else {
          this.$toast(result.data.message);
        }
      });
    }
  }
};
</script>

<style scoped>
.popup {
  width: 700px;
  height: auto;
}

.message {
  height: 200px;
  font-size: 32px;
  color: #333333;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.btn {
  width: 640px;
  margin: 0 30px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.btn>button {
  width: 200px;
  height: 80px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}
</style>
