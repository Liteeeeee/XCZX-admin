import request from '@/config/axios'

export interface MemberWordingVO {
  id?: number
  name?: string
  code?: string
  categoryCode?: string
  categoryName?: string
  typeCode?: string
  typeName?: string
  templateId?: number
  templateCode?: string
  params?: string
  dailyLimit?: number
  requireProduct?: boolean
  requireCoupon?: boolean
  status?: number
  remark?: string
  createTime?: string
  paramMetas?: MemberWordingParamMetaVO[]
}

export interface MemberWordingParamMetaVO {
  paramName?: string
  constantCode?: string
  constantName?: string
  constantDescription?: string
}

export const getMemberWordingPage = async (params: any) => {
  return await request.get({ url: '/member/wording/page', params })
}

export const getMemberWording = async (id: number) => {
  return await request.get({ url: '/member/wording/get?id=' + id })
}

export const createMemberWording = async (data: any) => {
  return await request.post({ url: '/member/wording/create', data })
}

export const updateMemberWording = async (data: any) => {
  return await request.put({ url: '/member/wording/update', data })
}

export const deleteMemberWording = async (id: number) => {
  return await request.delete({ url: '/member/wording/delete?id=' + id })
}

export const getMemberWordingParamMetas = async (code: string) => {
  return await request.get({ url: '/member/wording/param-metas', params: { code } })
}

export const getMemberWordingConstantList = async () => {
  return await request.get({ url: '/member/wording/constant-list' })
}

export const getMemberWordingTemplateVariableList = async () => {
  return await request.get({ url: '/member/wording/template-variable-list' })
}

export const previewMemberWording = async (data: any) => {
  return await request.post({ url: '/member/wording/preview', data })
}

export const sendMemberWording = async (data: any) => {
  return await request.post({ url: '/member/wording/send', data })
}

export const batchSendMemberWording = async (data: any) => {
  return await request.post({ url: '/member/wording/send-batch', data })
}

export const getMemberWordingLogPage = async (params: any) => {
  return await request.get({ url: '/member/wording-log/page', params })
}
