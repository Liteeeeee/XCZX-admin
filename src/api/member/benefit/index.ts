import request from '@/config/axios'

export interface BenefitVO {
  id: number
  memberLevelId?: number
  name: string
  icon: string
  info: string
  imgs?: string
  status: number
  sort?: number
}

// 获得会员权益分页
export const getBenefitPage = async (params) => {
  return await request.get({ url: `/member/rights/page`, params })
}

// 获得会员权益
export const getBenefit = async (id: number) => {
  return await request.get({ url: `/member/rights/get?id=` + id })
}

// 根据会员等级获得权益列表
export const getBenefitListByLevel = async (memberLevelId: number) => {
  return await request.get({ url: `/member/rights/list-by-level?memberLevelId=` + memberLevelId })
}

// 创建会员权益
export const createBenefit = async (data: BenefitVO) => {
  return await request.post({ url: `/member/rights/create`, data })
}

// 更新会员权益
export const updateBenefit = async (data: BenefitVO) => {
  return await request.put({ url: `/member/rights/update`, data })
}

// 删除会员权益
export const deleteBenefit = async (id: number) => {
  return await request.delete({ url: `/member/rights/delete?id=` + id })
}
