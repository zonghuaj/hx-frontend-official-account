// import html2canvas from "html2canvas";
// import JsPDF from 'jspdf'
// 存储localStorage
const setStore = (name, content) => {
  if (!name) {
    return;
  }
  if (typeof content !== 'string') {
    content = JSON.stringify(content);
  }
  window.localStorage.setItem(name, content);
};
// 读取localStorage
const getStore = name => {
  if (!name) {
    return;
  }
  return window.localStorage.getItem(name);
};
// 删除localStorage
const removeStore = name => {
  if (!name) {
    return;
  }
  window.localStorage.removeItem(name);
};
// 判断是否为手机
export const isPhone = () => {
  return (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent));
};
// 判断登录
export const checkLogin = (router, nextPath) => {
  const userId = common.getStore('userId');
  if (!userId) {
    router.push('/page/login?fb=' + nextPath);
    return false;
  }
  router.push(nextPath);
  return true;
};
export const getLoginUser = () => {
  return common.getStore('userId');
};
export const encodeURI = (str) => {
  return encodeURIComponent(encodeURIComponent(str));
};
export const decodeURI = (str) => {
  return decodeURIComponent(decodeURIComponent(str));
};

// 压缩图片
export function compressImage (src, config) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = function () {
      const me = this;
      let width = me.width;
      let height = me.height;
      const scale = width / height;
      if (config.width && config.height) {
        if (config.width < width) {
          width = config.width;
        }
        if (config.height < height) {
          height = config.height;
        }
      } else if (config.width) {
        if (config.width < width) {
          width = config.width;
          height = config.width / scale;
        }
      } else if (config.height) {
        if (config.height < height) {
          width = config.height * scale;
          height = config.height;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      const context = canvas.getContext('2d');
      context.drawImage(me, 0, 0, width, height);
      let quality = 0.7;
      if (config.quality) {
        quality = config.quality;
      }
      const result = canvas.toDataURL('image/jpeg', quality);
      resolve(result);
    };
  });
}

const common = {
  isPhone: isPhone,
  checkLogin: checkLogin,
  setStore: setStore,
  getStore: getStore,
  removeStore: removeStore,
  getLoginUser: getLoginUser,
  encodeURI: encodeURI,
  decodeURI: decodeURI,
  compressImage: compressImage
};
export default common;
