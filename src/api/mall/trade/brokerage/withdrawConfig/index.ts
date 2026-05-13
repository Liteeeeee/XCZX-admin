import request from '@/config/axios'

export interface BrokerageWithdrawConfigVO {
  id?: number
  code?: string
  withdrawMinPrice?: number
  withdrawMaxPrice?: number
  withdrawFeeRate?: number
  withdrawDescription?: string
  otherDescription?: string
  remark?: string
  status?: number
  sort?: number
  createTime?: Date
}

export const getBrokerageWithdrawConfigPage = async (params: any) => {
  return await request.get({ url: `/trade/brokerage-withdraw-config/page`, params })
}

export const getBrokerageWithdrawConfig = async (id: number) => {
  return await request.get({ url: `/trade/brokerage-withdraw-config/get`, params: { id } })
}

export const getBrokerageWithdrawConfigByCode = async (code: string) => {
  return await request.get({ url: `/trade/brokerage-withdraw-config/get-by-code`, params: { code } })
}

export const createBrokerageWithdrawConfig = async (data: BrokerageWithdrawConfigVO) => {
  return await request.post({ url: `/trade/brokerage-withdraw-config/create`, data })
}

export const updateBrokerageWithdrawConfig = async (data: BrokerageWithdrawConfigVO) => {
  return await request.put({ url: `/trade/brokerage-withdraw-config/update`, data })
}

