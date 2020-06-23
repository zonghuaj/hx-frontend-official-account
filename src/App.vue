<template>
  <div id="app">
    <router-view v-wechat-title="$route.meta.title"></router-view>
    <div id="menu" v-if="isHomePage">
      <p @click="goCharge">供热交费</p>
      <p @click="goRepair">供热报修</p>
      <p @click="goComplain">供热投诉</p>
      <p @click="goStopHeating">停供申请</p>
      <p @click="goMyMaintenance">换热站电话</p>
      <p @click="goServiceHall">更多业务</p>
      <p @click="nav('profile')">个人中心</p>
      <p @click="nav('aboutUs')">关于我们</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
  },
  data () {
    return {
      isHomePage: true
    };
  },
  created: function () {
    const path = window.location.href;
    const suffix = path.substring(path.indexOf('#') + 1, path.length);
    this.isHomePage = suffix.startsWith('/homePage');
    window.addEventListener('beforeunload', () => {
      const params = this.$route.params;
      if (Object.keys(params).length !== 0) {
        sessionStorage.setItem('params', JSON.stringify(params));
      }
    });
  },
  watch: {
    '$route' (to, from) {
      const path = to.path;
      this.isHomePage = path.startsWith('/homePage');
    }
  },
  methods: {
    nav: function (path) {
      this.$router.push('/' + path);
    },
    goCharge: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'editInvoice'
        }
      });
    },
    goRepair: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'addRepair'
        }
      });
    },
    goComplain: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'addComplain'
        }
      });
    },
    goStopHeating: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'addStopHeating'
        }
      });
    },
    goMyMaintenance: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'myMaintenance'
        }
      });
    },
    goServiceHall: function () {
      this.$router.push({
        path: '/chooseRoom',
        query: {
          label: 'serviceHall'
        }
      });
    }
  }
};
</script>

<style>
  #app {
    text-align: center;
  }
</style>
