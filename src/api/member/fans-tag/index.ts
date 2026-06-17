import request from '@/config/axios'

export interface FansTagVO {
  id?: number
  groupId: number
  name: string
  code: string
  status: number
  sort?: number
  remark?: string
  createTime?: string
}

export const getFansTagPage = async (params: any) => {
  return await request.get({ url: '/member/fans-tag/page', params })
}

export const getFansTag = async (id: number) => {
  return await request.get({ url: '/member/fans-tag/get?id=' + id })
}

export const createFansTag = async (data: FansTagVO) => {
  return await request.post({ url: '/member/fans-tag/create', data })
}

export const updateFansTag = async (data: FansTagVO) => {
  return await request.put({ url: '/member/fans-tag/update', data })
}

export const deleteFansTag = async (id: number) => {
  return await request.delete({ url: '/member/fans-tag/delete?id=' + id })
}

export const getFansTagListByGroupId = async (groupId: number) => {
  return await request.get({ url: '/member/fans-tag/list-by-group-id?groupId=' + groupId })
}
