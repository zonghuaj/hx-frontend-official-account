<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>服务范围</span>
    </div>
    <div class="detail">
      <div class="detail-item">
        <span class="detail-item-left">服务范围</span>
        <span class="detail-item-right">{{ outlets.serviceArea }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Area',
  components: {
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      outlets: {}
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
    this.outlets = params.outlets;
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
      this.$router.push({
        name: 'businessList',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
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

.detail {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.detail-item {
  width: 690px;
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
}

.detail-item-left {
  font-size: 28px;
  color: #999999;
  white-space: nowrap;
}

.detail-item-right {
  font-size: 28px;
  color: #333333;
  margin-left: 20px;
  text-align: left;
}
</style>
