<template>
  <van-swipe :autoplay="3000">
    <van-swipe-item v-for="(imaget, index) in images" :key="index">
      <img :src="imaget" />
    </van-swipe-item>
  </van-swipe>
</template>

<script>
import Vue from 'vue';
import { Swipe, SwipeItem, Lazyload } from 'vant';
Vue.use(Swipe);
Vue.use(SwipeItem);
Vue.use(Lazyload);

export default {
  name: 'HxSwipe',
  components: {},
  data () {
    return {
      images: [
        require('@/assets/auto_play_icon/servicehall_swipe.png'),
        require('@/assets/auto_play_icon/servicehall_swipe.png')
      ]
    };
  },
  beforeMount: function () {},
  mounted: function () {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }
  },
  destroyed: function () {
    window.removeEventListener('popstate', this.goBack, false);
  },
  methods: {}
};
</script>

<style lang="less">
@import "../../assets/style/var.less";
.van-swipe {
  &-item {
    color: @white;
    line-height: 150px;
    text-align: center;

    // &:nth-child(even) {
    //   background-color: #39a9ed;
    // }

    // &:nth-child(odd) {
    //   background-color: #66c6f2;
    // }
  }
  img {
    display: block;
    box-sizing: border-box;
    width: 750px;
    height: 379px;
    padding: 30px 30px;
    pointer-events: none;
  }
  .van-swipe__indicators {
    bottom: 50px;
  }
}
</style>
