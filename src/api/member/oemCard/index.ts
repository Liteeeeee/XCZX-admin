import request from '@/config/axios'

export interface OemCardVO {
  id: number
  cardNo: string
  cardSecret: string
  cardType: string
  channelCode: string
  batchNo: string
  validDays: number
  userId: number
  nickname: string
  mobile: string
  bindTime: string
  expireTime: string
  status: number
  remark: string
  createTime: string
}

export interface OemCardPageReqVO {
  cardNo?: string
  batchNo?: string
  cardType?: string
  channelCode?: string
  userId?: number
  status?: number
  createTime?: string[]
  pageNo: number
  pageSize: number
}

export interface OemCardUpdateReqVO {
  id: number
  cardType?: string
  channelCode?: string
  cardSecret?: string
  validDays?: number
  remark?: string
}

export interface OemCardStatusReqVO {
  id: number
  status: number
}

export interface OemCardUnbindReqVO {
  id: number
}

export interface OemCardImportReqVO {
  fileUrl: string
  batchNo?: string
  cardType?: string
  channelCode?: string
  validDays?: number
  remark?: string
}

export interface OemCardBindReqVO {
  cardNo?: string
  cardSecret?: string
  userId: number
  force?: boolean
}

export const getOemCardPage = async (params: OemCardPageReqVO) => {
  return await request.get({ url: `/member/oem-card/page`, params })
}

export const getOemCard = async (id: number) => {
  return await request.get({ url: `/member/oem-card/get?id=` + id })
}

export const updateOemCard = async (data: OemCardUpdateReqVO) => {
  return await request.put({ url: `/member/oem-card/update`, data })
}

export const updateOemCardStatus = async (data: OemCardStatusReqVO) => {
  return await request.put({ url: `/member/oem-card/update-status`, data })
}

export const unbindOemCard = async (data: OemCardUnbindReqVO) => {
  return await request.put({ url: `/member/oem-card/unbind`, data })
}

export const importOemCard = async (data: OemCardImportReqVO) => {
  return await request.post({ url: `/member/oem-card/import`, data })
}

export const bindOemCard = async (data: OemCardBindReqVO) => {
  return await request.post({ url: `/member/oem-card/bind`, data })
}

export const deleteOemCard = async (id: number) => {
  return await request.delete({ url: `/member/oem-card/delete?id=` + id })
}
