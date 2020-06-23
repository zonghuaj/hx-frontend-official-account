<template>
  <div class="content">
    <img class="icon" src="@/assets/icon/pay_win_icon_name.png" />
    <span class="title">姓名验证</span>
    <span class="subTitle">请补全当前房屋户主姓名</span>
    <div class="name">
      <input type="text" placeholder="请补全姓名" v-model="ownerNamePrefix" />
      <span>{{ ownerNameSuffix }}</span>
    </div>
    <div class="error" v-if="errorFlag">
      <img src="@/assets/icon/ty_icon_warning.png" />
      <span>您补全的姓名不对</span>
    </div>
    <input class="btn-cancel" type="button" value="取消" @click="doCancel" />
  </div>
</template>

<script>
export default {
  name: 'ValidateName',
  props: [
    'previousYear'
  ],
  components: {
  },
  data () {
    return {
      ownerNamePrefix: null,
      ownerNameSuffix: null,
      errorFlag: false
    };
  },
  beforeMount: function () {
    const ownerName = this.previousYear.ownerName;
    this.ownerNameSuffix = ownerName.charAt(ownerName.length - 1);
  },
  mounted: function () {
  },
  watch: {
    ownerNamePrefix: 'validateName'
  },
  methods: {
    validateName: function () {
      if (!this.ownerNamePrefix) {
        this.errorFlag = false;
        return;
      }
      if (this.ownerNamePrefix + this.ownerNameSuffix === this.previousYear.ownerName) {
        this.$emit('confirm');
      } else {
        this.errorFlag = true;
      }
    },
    doCancel: function () {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.content {
  width: 565px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.icon {
  width: 230px;
  height: 230px;
}

.title {
  font-size: 36px;
  color: #333333;
}

.subTitle {
  font-size: 28px;
  color: #ff6016;
  margin-top: 30px;
}

.name {
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.name>input {
  width: 200px;
  font-size: 28px;
  color: #333333;
  border: 1px solid #149bfa;
  padding: 10px;
}

.name>span {
  font-size: 28px;
  color: #333333;
  margin-left: 10px;
}

.error {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.error>img {
  width: 20px;
  height: 20px;
}

.error>span {
  font-size: 20px;
  color: red;
  margin-left: 10px;
}

.btn-cancel {
  width: 250px;
  height: 88px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  margin: 30px 0;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}
</style>
