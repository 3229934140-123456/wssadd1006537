export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/checkup/index',
    'pages/messages/index',
    'pages/profile/index',
    'pages/taskDetail/index',
    'pages/chat/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '洁治护理助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2BA471',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '今日任务'
      },
      {
        pagePath: 'pages/checkup/index',
        text: '症状自查'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
