import request from '@/config/axios'

export interface MemberInviteConfigVO {
  id: number
  name: string
  firstExperience: number
  otherExperience: number
  firstUpgradeEnable: boolean
  upgradeLevel: number
  status: number
}

// 查询会员邀请配置分页
export const getMemberInviteConfigPage = async (params: any) => {
  return await request.get({ url: `/member-invite/config/page`, params })
}

// 查询会员邀请配置详情
export const getMemberInviteConfig = async (id: number) => {
  return await request.get({ url: `/member-invite/config/get?id=` + id })
}

// 新增会员邀请配置
export const createMemberInviteConfig = async (data: any) => {
  return await request.post({ url: `/member-invite/config/create`, data })
}

// 修改会员邀请配置
export const updateMemberInviteConfig = async (data: any) => {
  return await request.put({ url: `/member-invite/config/update`, data })
}

// 删除会员邀请配置
export const deleteMemberInviteConfig = async (id: number) => {
  return await request.delete({ url: `/member-invite/config/delete?id=` + id })
}
