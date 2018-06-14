// pages/list/list.js
const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data: {
    daysWeather:[]
  },
  onLoad() {
    this.getWeatherData()
  },
  onPullDownRefresh() {
    this.getWeatherData(() => {
      wx.stopPullDownRefresh()
    })
  },
  getWeatherData(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        'city': '南京市',
        'time': new Date().getTime().toLocaleString()
      },
      success: res => {
        let result = res.data.result
        let daysWeather = []
        for (let i = 0; i < result.length; i ++) {
          let date = new Date()
          date.setDate(date.getDate() + i)
          daysWeather.push({
            iconPath: '/images/' + result[i].weather + '-icon.png',
            temp: result[i].minTemp + '˚'+'-'+result[i].maxTemp+'˚',
            day: days[date.getDay()],
            date: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
          })
        }
        daysWeather[0].day = '今天'
        console.log(daysWeather)
        this.setData({
          daysWeather: daysWeather
        })
      },
      complete: () => {
        callback && callback()
      }
    })
  }
})