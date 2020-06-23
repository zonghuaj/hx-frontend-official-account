import Vue from 'vue';
import App from './App';
import router from './router';
import common from './utils/common';
import float from './utils/float';
import rem from './utils/rem';
import axios from 'axios';
import VueWechatTitle from 'vue-wechat-title';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/reset.css';

// mock
// WARNING: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.
import './mock';

import VueTouch from 'vue-touch';

// import Pagination from 'tony-ui';
// 全局引入按需引入UI库 vant
import './plugins/vant';
Vue.use(VueWechatTitle);
// Vue.use(Pagination);
Vue.use(ElementUI);

Vue.use(VueTouch, {
  name: 'v-touch'
});

Vue.config.productionTip = false;

Vue.prototype.common = common;
Vue.prototype.float = float;
Vue.prototype.rem = rem;

axios.defaults.baseURL = process.env.API_ROOT;

/* eslint-disable */
let uid = sessionStorage.getItem('uid')
let sid = sessionStorage.getItem('sid')
if (uid && sid) {
  axios.defaults.headers.uid = uid
  axios.defaults.headers.sid = sid

  new Vue({
    el: '#app',
    router,
    components: {
      App
    },
    template: '<App/>'
  })
} else {
  let code = null
  let params = window.location.search.substring(1).split('&')
  for (let index = 0; index < params.length; index++) {
    let param = params[index].split('=')
    if (param[0] === 'code') {
      code = param[1];
      sessionStorage.setItem('code', response.data.data.uid);
    }
  }
  
  if (code) {
    axios.post('/user/openid/wechat', {
      code: code
    })
      .then(response => {
        if (response.data.status === 1) {
          sessionStorage.setItem('uid', response.data.data.uid)
          sessionStorage.setItem('sid', response.data.data.sid)
          
          axios.defaults.headers.uid = response.data.data.uid
          axios.defaults.headers.sid = response.data.data.sid

          new Vue({
            el: '#app',
            router,
            components: {
              App
            },
            template: '<App/>'
          })
        } else {
          Toast(response.data.data.message)
        }
      })
  } else {
    // 开发环境
    if (process.env.NODE_ENV === 'development') {
      
      axios.defaults.headers.uid = 409539
      axios.defaults.headers.sid = 'oOYLPv3tRTc0G6v9jVhU8lvyUexU'
      
      // axios.defaults.headers.uid = 1
      // axios.defaults.headers.sid = 'oOYLPvy-CvwlOOXqwNtmrNX1SmtI'
      
      // axios.defaults.headers.uid = 764
      // axios.defaults.headers.sid = 'oOYLPvzYZxOIRcong5cMkMIq9t64'
    }

    new Vue({
      el: '#app',
      router,
      components: {
        App
      },
      template: '<App/>'
    })
  }
}
