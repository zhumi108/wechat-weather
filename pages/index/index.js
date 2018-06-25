const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const UNPROMPTED = 0
const UNANTHENTED = 1
const AUTHENED = 2

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    city: '广州市', 
    locationAuthType: UNPROMPTED
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'CTSBZ-ZF6A6-WQESR-EGTND-6ZIOJ-4VF57'
    })
    wx.getSetting({
      success: res=> {
        let auth = res.authSetting['scope.userLocation']
        let authType = auth ? AUTHENED : (auth === false) ? UNANTHENTED : UNPROMPTED
        this.setData({
          locationAuthType: authType
        })
        if (auth) {
          this.getCityAndWeather()
        } else {
          this.getNow()
        }
      },
      fail: res=> {
        this.getNow()
      }
    })
    this.getNow()
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result
        console.log(this.data.city)
        console.log(result)
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setNow(result) {
    let weather = result.now.weather
    let temp = result.now.temp
    this.setData({
      nowTemp: temp + "˚",
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  }, 
  setHourlyWeather(result) {
    let nowHour = new Date().getHours()
    let forecast = result.forecast
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '˚'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}˚- ${result.today.maxTemp}˚`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocation() {
    if (this.data.locationAuthType === UNANTHENTED)
      wx.openSetting({
        success: res => {
          if (res.authSetting['scope.userLocation']) {
            this.getCityAndWeather()
          }
        }
      })
    else
      this.getCityAndWeather()
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHENED
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNANTHENTED
        })
      }
    })
  }
})
