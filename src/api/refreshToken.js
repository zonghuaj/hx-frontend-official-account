/*
 * @Description:刷新token
 * @author Tony
 * @date 2020-06-20 18:00:00
 * @last modified by Tony
 * @last modified time 2020-06-20 18:00:00
 */

import { get } from '@/api/axios';

export const refreshTokenP = params => {
  return new Promise((resolve, reject) => {
    get('/user/openid/wechat', params)
      .then(res => {
        if (res.code === 1) {
          sessionStorage.setItem('token', res.data.token);
        }
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const refreshToken = {
  refreshTokenP: refreshTokenP
};
