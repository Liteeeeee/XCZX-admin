import request from '@/config/axios'

export interface BrokerageApplyVO {
  id: number
  userId: number
  provinceId: number
  cityId: number
  occupation: string
  idCardNo: string
  idCardFrontUrl: string
  idCardBackUrl: string
  additionalInfo: string
  status: number
  refuseReason: string
  resubmitCount: number
  lastResubmitTime: Date
  auditUserId: number
  auditUserName: string
  auditTime: Date
  bindUserId: number
  brokerageUserId: number
  createTime: Date
}

export interface BrokerageApplyAuditReqVO {
  id: number
  status: number
  auditReason?: string
}

export interface BrokerageAuditRecordVO {
  id: number
  userId: number
  applyId: number
  status: number
  auditUserId: number
  auditUserName: string
  auditTime: Date
  auditReason: string
  createTime: Date
}

export interface AppBrokerageApplyResubmitReqVO {
  applyId: number
  occupation: string
  idCardNo: string
  idCardFrontUrl: string
  idCardBackUrl: string
  additionalInfo?: string
}

export const getBrokerageApplyPage = async (params: any) => {
  return await request.get({ url: `/trade/brokerage-apply/page`, params })
}

export const getBrokerageApply = async (id: number) => {
  return await request.get({ url: `/trade/brokerage-apply/` + id })
}

export const auditBrokerageApply = async (data: BrokerageApplyAuditReqVO) => {
  return await request.post({ url: `/trade/brokerage-apply/audit`, data })
}

export const getBrokerageApplyAuditRecordPage = async (params: any) => {
  return await request.get({ url: `/trade/brokerage-apply/audit-record/page`, params })
}

export const resubmitBrokerageApply = async (data: AppBrokerageApplyResubmitReqVO) => {
  return await request.put({
    url: import.meta.env.VITE_BASE_URL + `/app-api/trade/brokerage-apply/resubmit`,
    data
  })
}
