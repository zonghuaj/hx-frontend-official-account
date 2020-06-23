import { axiosGet } from '@/api/axios';

const getUser = () => {
  return axiosGet('/puser');
};

const getNotice = () => {
  // 测试数据
  return new Promise((resolve, reject) => {
    const result = {
      status: 1,
      data: {
        // 公司公告
        company: 100,
        // 系统通知
        system: 100
      }
    };
    resolve(result);
  });
};

const profileApi = {
  getUser: getUser,
  getNotice: getNotice
};

export default profileApi;
