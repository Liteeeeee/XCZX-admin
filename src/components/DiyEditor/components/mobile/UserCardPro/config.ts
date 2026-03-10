import { ComponentStyle, DiyComponent } from '@/components/DiyEditor/util'

/** 用户卡片Pro属性 */
export interface UserCardProProperty {
  // 用户名
  nickname: string
  // 手机号
  mobile: string
  // 会员等级
  levelName: string
  // 资产项
  stats: {
    label: string
    value: string
    unit?: string
  }[]
  // 组件样式
  style: ComponentStyle
}

// 定义组件
export const component = {
  id: 'UserCardPro',
  name: '用户卡片Pro',
  icon: 'mdi:account-card-details-outline',
  property: {
    nickname: '尊贵的小仙草',
    mobile: '136****3356',
    levelName: '普通会员',
    stats: [
      { label: '余额', value: '1000.00' },
      { label: '积分', value: '1000' },
      { label: '优惠券', value: '10' }
    ],
    style: {
      bgType: 'color',
      bgColor: '#e0fde0',
      marginBottom: 8,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      borderRadius: 12,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12
    } as ComponentStyle
  }
} as DiyComponent<UserCardProProperty>
