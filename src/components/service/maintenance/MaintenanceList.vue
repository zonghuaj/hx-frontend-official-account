<template>
  <div class="content">
    <div class="nav">
      <img src="@/assets/icon/ty_icon_back.png" @click="goBack" />
      <span>换热站</span>
    </div>
    <div class="tab">
      <span :class="listModel ? 'tab-item-active': 'tab-item'" @click="setListModel(true)">列表模式</span>
      <span :class="listModel ? 'tab-item': 'tab-item-active'" @click="setListModel(false)">地图模式</span>
    </div>
    <div v-show="listModel">
      <div class="search">
        <div class="search-company">
          <span>{{ company.abbreviationName }}</span>
          <img src="@/assets/icon/maintain_icon_xl.png" @click="showCompany" />
        </div>
        <van-popup v-model="showCompanyPopup">
          <span>请选择供热公司</span>
          <van-radio-group v-model="company.companyId">
            <van-cell-group>
              <van-cell
                :title-style="company.companyId == item.companyId ? 'color: #ff6016;' : ''"
                :title="item.abbreviationName"
                clickable
                center
                @click="selectCompany(item)"
                v-for="(item, index) in companyList"
                :key="index">
                <van-radio :name="item.companyId">
                  <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal" />
                </van-radio>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </van-popup>
        <div class="search-area">
          <span>{{ area.name }}</span>
          <img src="@/assets/icon/maintain_icon_xl.png" @click="showArea" />
        </div>
        <van-popup v-model="showAreaPopup">
          <span>请选择地区</span>
          <van-radio-group v-model="area.id">
            <van-cell-group>
              <van-cell
                :title-style="area.id == item.id ? 'color: #ff6016;' : ''"
                :title="item.name"
                clickable
                center
                @click="selectArea(item)"
                v-for="(item, index) in areaList"
                :key="index">
                <van-radio :name="item.id">
                  <img slot="icon" slot-scope="props" :src="props.checked ? icon.active : icon.normal" />
                </van-radio>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </van-popup>
      </div>
      <div class="outlets" v-for="(item, index) in outletsList" :key="index">
        <div class="outlets-name">
          <div class="outlets-name-left">
            <img src="@/assets/icon/maintain_icon_site.png" />
            <span>{{ item.outletsName }}</span>
          </div>
          <span class="outlets-name-right" style="border: 1px solid #ff6016;" @click="goTimeArea(item)">服务时间及范围</span>
        </div>
        <div class="outlets-address">
          <div class="outlets-address-left">
            <img src="@/assets/icon/maintain_sm_icon_dz.png" />
            <span>地址：</span>
            <span>{{ item.outletsAddress }}</span>
          </div>
          <div class="outlets-address-right" @click="locate(item)">
            <img src="@/assets/icon/maintain_icon_dw.png" />
            <span>查看地图</span>
          </div>
        </div>
        <div class="outlets-telephone">
          <img src="@/assets/icon/maintain_sm_icon_dh.png" />
          <span>电话：</span>
          <span><a :href="'tel:' + item.outletsTelephone">{{ item.outletsTelephone }}</a></span>
        </div>
      </div>
    </div>
    <div class="map" v-show="!listModel">
      <div class="amap" id="amapDiv"></div>
      <div v-if="outlets">
        <div class="map-outlets-name">
          <img src="@/assets/icon/maintain_icon_site.png" />
          <span>{{ outlets.outletsName }}</span>
        </div>
        <div class="map-outlets-address">
          <img src="@/assets/icon/maintain_sm_icon_dz.png" />
          <span>地址：</span>
          <span>{{ outlets.outletsAddress }}</span>
        </div>
        <div class="map-outlets-telephone">
          <img src="@/assets/icon/maintain_sm_icon_dh.png" />
          <span>电话：</span>
          <span><a :href="'tel:' + outlets.outletsTelephone">{{ outlets.outletsTelephone }}</a></span>
        </div>
        <div class="map-outlets-area">
          <img src="@/assets/icon/maintain_sm_icon_qy.png" />
          <span>服务范围：</span>
          <span>{{ outlets.serviceArea }}</span>
        </div>
        <!--
        <input class="btn-navigate" type="button" value="到这去" @click="navigate" />
        -->
      </div>
    </div>
  </div>
</template>

<script>
import constant from '@/assets/js/constant';
import AMapLoader from '@/assets/js/AMap.js';
import dictionaryApi from '@/api/dictionary';
import serviceApi from '@/api/service.js';

export default {
  name: 'MaintenanceList',
  components: {
  },
  data () {
    return {
      curHouse: {},
      bindHouse: [],
      listModel: true,
      showCompanyPopup: false,
      companyList: [{
        abbreviationName: '全部供热公司'
      }],
      company: {
        abbreviationName: '全部供热公司'
      },
      showAreaPopup: false,
      areaList: [{
        name: '全部地区'
      }],
      area: {
        name: '全部地区'
      },
      outletsList: [],
      outlets: null,
      icon: constant.radioStyle.icon
    };
  },
  beforeMount: function () {
    let params = this.$route.params;
    if (Object.keys(params).length === 0) {
      if (sessionStorage.getItem('params')) {
        params = JSON.parse(sessionStorage.getItem('params'));
      }
    }
    this.curHouse = params.curHouse;
    this.bindHouse = params.bindHouse;
    this.outlets = params.outlets;
    this.initPage();
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
        name: 'myMaintenance',
        params: {
          curHouse: this.curHouse,
          bindHouse: this.bindHouse
        }
      });
    },
    initPage: function () {
      // 供热公司
      serviceApi.getCompanyList().then(result => {
        if (result.status === 1) {
          this.companyList = this.companyList.concat(result.data);
        } else {
          this.$toast(result.data.message);
        }
      });
      // 地区
      dictionaryApi.getAreaList().then(result => {
        if (result.status === 1) {
          this.areaList = this.areaList.concat(result.data);
        } else {
          this.$toast(result.data.message);
        }
      });
      // 高德地图
      AMapLoader().then(AMap => {
        this.amap = new AMap.Map('amapDiv', {
          center: [123.34586, 41.762168],
          zoom: 13
        });
        if (this.outlets) {
          this.locate(this.outlets);
        }
      });
      this.getOutletsList();
    },
    getOutletsList: function () {
      const params = {
        typeId: 2,
        companyId: this.company.companyId,
        areaId: this.area.id
      };
      serviceApi.getOutletsList(params).then(result => {
        if (result.status === 1) {
          this.outletsList = result.data;
        } else {
          this.$toast(result.data.message);
        }
      });
    },
    setListModel: function (listModel) {
      this.listModel = listModel;
    },
    showCompany: function () {
      if (this.companyList.length > 0) {
        this.showCompanyPopup = true;
      }
    },
    selectCompany: function (item) {
      this.showCompanyPopup = false;
      // 深拷贝
      this.company = JSON.parse(JSON.stringify(item));
      this.getOutletsList();
    },
    showArea: function () {
      if (this.areaList.length > 0) {
        this.showAreaPopup = true;
      }
    },
    selectArea: function (item) {
      this.showAreaPopup = false;
      // 深拷贝
      this.area = JSON.parse(JSON.stringify(item));
      this.getOutletsList();
    },
    goTimeArea: function (item) {
      this.$router.push({
        name: 'timeArea',
        params: {
          source: 'maintenanceList',
          curHouse: this.curHouse,
          bindHouse: this.bindHouse,
          outlets: item
        }
      });
    },
    locate: function (item) {
      this.outlets = item;
      this.setListModel(false);
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(this.outlets.longitude, this.outlets.latitude),
        title: this.outlets.outletsName
      });
      this.amap.clearMap();
      this.amap.add(marker);
      this.amap.panTo([this.outlets.longitude, this.outlets.latitude]);
    },
    navigate: function (item) {
    }
  }
};
</script>

<style scoped>
.content {
  width: 750px;
  background-color: #f4f5fa;
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

.tab {
  width: 750px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  padding: 15px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  font-size: 28px;
  color: #333333;
  padding: 15px 0;
}

.tab-item-active {
  font-size: 28px;
  color: #ff6016;
  background: url(../../../assets/icon/maintain_sm_icon_xz.png) no-repeat bottom center;
  background-size: 40px 4px;
  padding: 15px 0;
}

.search {
  width: 750px;
  background-color: #ffffff;
  padding: 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.search-company {
  width: 375px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.search-company>span {
  font-size: 28px;
  color: #333333;
}

.search-company>img {
  width: 18px;
  height: 10px;
  margin-left: 10px;
}

.search-area {
  width: 375px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.search-area>span {
  font-size: 28px;
  color: #333333;
}

.search-area>img {
  width: 18px;
  height: 10px;
  margin-left: 10px;
}

.outlets {
  width: 690px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px 30px;
  margin: 20px 30px 0;
}

.outlets-name {
  width: 630px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.outlets-name-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.outlets-name-left>img {
  width: 32px;
  height: 32px;
}

.outlets-name-left>span {
  width: 350px;
  font-size: 30px;
  color: #333333;
  margin-left: 20px;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.outlets-name-right {
  font-size: 22px;
  color: #ff6016;
  border-radius: 5px;
  padding: 5px 20px;
  margin-left: 20px;
}

.outlets-address {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.outlets-address-left {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.outlets-address-left>img {
  width: 24px;
  height: 24px;
}

.outlets-address-left>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.outlets-address-left>span:nth-child(3) {
  width: 340px;
  font-size: 26px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.outlets-address-right {
  margin-left: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.outlets-address-right>img {
  width: 32px;
  height: 32px;
}

.outlets-address-right>span {
  font-size: 26px;
  color: #ff6016;
  margin-left: 10px;
}

.outlets-telephone {
  width: 630px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.outlets-telephone>img {
  width: 24px;
  height: 24px;
}

.outlets-telephone>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.outlets-telephone>span:nth-child(3) {
  font-size: 26px;
  color: #333333;
}

.map {
  width: 750px;
  height: 100%;
  background-color: #ffffff;
}

.amap {
  width: 750px;
  height: 750px;
}

.map-outlets-name {
  width: 690px;
  border-bottom: 1px solid #e8e8e8;
  padding: 20px 0;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.map-outlets-name>img {
  width: 32px;
  height: 32px;
}

.map-outlets-name>span {
  width: 638px;
  font-size: 30px;
  color: #333333;
  margin-left: 20px;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.map-outlets-address {
  width: 690px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.map-outlets-address>img {
  width: 24px;
  height: 24px;
}

.map-outlets-address>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.map-outlets-address>span:nth-child(3) {
  width: 550px;
  font-size: 26px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.map-outlets-telephone {
  width: 690px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.map-outlets-telephone>img {
  width: 24px;
  height: 24px;
}

.map-outlets-telephone>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.map-outlets-telephone>span:nth-child(3) {
  font-size: 26px;
  color: #333333;
}

.map-outlets-area {
  width: 690px;
  margin: 20px 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.map-outlets-area>img {
  width: 24px;
  height: 24px;
}

.map-outlets-area>span:nth-child(2) {
  font-size: 26px;
  color: #999999;
  margin-left: 20px;
}

.map-outlets-area>span:nth-child(3) {
  width: 500px;
  font-size: 26px;
  color: #333333;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.btn-navigate {
  width: 690px;
  height: 88px;
  font-size: 32px;
  color: #ffffff;
  border-radius: 10px;
  margin: 20px 30px 0;
  background: -webkit-linear-gradient(left, #ff8500, #ff6016);
  background: -o-linear-gradient(right, #ff8500, #ff6016);
  background: -moz-linear-gradient(right, #ff8500, #ff6016);
  background: linear-gradient(to right, #ff8500, #ff6016);
}

.van-popup {
  width: 690px;
  border-radius: 10px;
}

.van-popup>span {
  font-size: 28px;
  color: #333333;
  margin: 30px 0;
}

.van-radio-group {
  padding: 0 30px;
  max-height: 600px;
  overflow-y: auto;
}

.van-cell {
  padding: 30px 0;
  line-height: normal;
}

.van-cell img {
  width: 28px;
  height: 28px;
}

.van-cell__title {
  font-size: 28px;
  color: #333333;
  text-align: left;
  flex: 1;
}

.van-cell__value {
  flex: none;
}
</style>
