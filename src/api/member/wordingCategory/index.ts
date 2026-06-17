import request from '@/config/axios'

export interface MemberWordingCategoryVO {
  id?: number
  name?: string
  code?: string
  status?: number
  description?: string
  createTime?: string
}

export const getMemberWordingCategoryPage = async (params: any) => {
  return await request.get({ url: '/member/wording-category/page', params })
}

export const getMemberWordingCategory = async (id: number) => {
  return await request.get({ url: '/member/wording-category/get?id=' + id })
}

export const createMemberWordingCategory = async (data: any) => {
  return await request.post({ url: '/member/wording-category/create', data })
}

export const updateMemberWordingCategory = async (data: any) => {
  return await request.put({ url: '/member/wording-category/update', data })
}

export const deleteMemberWordingCategory = async (id: number) => {
  return await request.delete({ url: '/member/wording-category/delete?id=' + id })
}

export const getMemberWordingCategorySimpleList = async () => {
  return await request.get({ url: '/member/wording-category/list-all-simple' })
}
