import request from '@/config/axios'

export interface MemberBrokerageCustomerVO {
  id: number
  brokerUserId: number
  memberId: number
  userNickname: string
  customerNickname: string
  memberLevel: number
  memberMobile: string
  registerTime: Date
  birthday: Date
  lastLoginTime: Date
  lastPurchaseTime: Date
  totalConsumeAmount: number
  totalConsumeCount: number
  lastBrowseProductId: number
  lastBrowseProductName: string
  clientStatus: string
  customerPreference: string
  customerInterest: string
  customerRemark: string
  createTime: Date
}

export const getMemberBrokerageCustomerPage = async (params: any) => {
  return await request.get({ url: '/member/brokerage-customer/page', params })
}

export const initAllMemberBrokerageCustomer = async () => {
  return await request.post({ url: '/member/brokerage-customer/init-all' })
}

