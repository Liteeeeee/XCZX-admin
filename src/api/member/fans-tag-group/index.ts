import request from '@/config/axios'

export interface FansTagGroupVO {
  id?: number
  name: string
  code: string
  status: number
  sort?: number
  remark?: string
  createTime?: string
}

export const getFansTagGroupPage = async (params: any) => {
  return await request.get({ url: '/member/fans-tag-group/page', params })
}

export const getFansTagGroup = async (id: number) => {
  return await request.get({ url: '/member/fans-tag-group/get?id=' + id })
}

export const getSimpleFansTagGroupList = async () => {
  return await request.get({ url: '/member/fans-tag-group/list-all-simple' })
}

export const createFansTagGroup = async (data: FansTagGroupVO) => {
  return await request.post({ url: '/member/fans-tag-group/create', data })
}

export const updateFansTagGroup = async (data: FansTagGroupVO) => {
  return await request.put({ url: '/member/fans-tag-group/update', data })
}

export const deleteFansTagGroup = async (id: number) => {
  return await request.delete({ url: '/member/fans-tag-group/delete?id=' + id })
}
