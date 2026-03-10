import { ComponentStyle, DiyComponent } from '@/components/DiyEditor/util'

/** 用户信息属性 */
export interface UserInfoProperty {
  // 标题
  title: string
  // 菜单项
  items: {
    icon: string
    name: string
    url: string
  }[]
  // 组件样式
  style: ComponentStyle
}

// 定义组件
export const component = {
  id: 'UserInfo',
  name: '用户信息',
  icon: 'ep:user',
  property: {
    title: '我的信息',
    items: [
      { icon: 'ep:setting', name: '我的设置', url: '' },
      { icon: 'ep:location', name: '地址管理', url: '' },
      { icon: 'ep:user-filled', name: '平台合伙人', url: '' }
    ],
    style: {
      bgType: 'color',
      bgColor: '#fff',
      marginLeft: 8,
      marginRight: 8,
      marginBottom: 8,
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      borderBottomLeftRadius: 8
    } as ComponentStyle
  }
} as DiyComponent<UserInfoProperty>
