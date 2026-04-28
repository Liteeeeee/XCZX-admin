import request from '@/config/axios'

export interface PromoterVO {
  id?: number
  mobile: string
  name?: string
  provinceId?: number
  provinceName?: string
  cityId?: number
  cityName?: string
  status: number
  bindCount?: number
  effectiveCount?: number
  remark?: string
  createTime?: string
}

// 查询推广员列表
export const getPromoterPage = async (params: any) => {
  return await request.get({ url: `/trade/promoter/page`, params })
}

// 查询推广员详情
export const getPromoter = async (id: number) => {
  return await request.get({ url: `/trade/promoter/get?id=` + id })
}

// 新增推广员
export const createPromoter = async (data: PromoterVO) => {
  return await request.post({ url: `/trade/promoter/create`, data })
}

// 修改推广员
export const updatePromoter = async (data: PromoterVO) => {
  return await request.put({ url: `/trade/promoter/update`, data })
}

// 删除推广员
export const deletePromoter = async (id: number) => {
  return await request.delete({ url: `/trade/promoter/delete?id=` + id })
}

// 获得推广员导入模板
export const importPromoterTemplate = async () => {
  return await request.get({ url: `/trade/promoter/get-import-template` })
}

// 导入推广员列表
export const importPromoter = async (data: { fileUrl: string, reason?: string, batchNo?: string }) => {
  return await request.post({ url: `/trade/promoter/import`, data })
}

// 生成小程序码
export const generateWxaQrcode = async (data: { scene: string; path: string; width?: number }) => {
  return await request.post({ url: `/system/social-client/wxa-qrcode`, data })
}

// ======================= 推广团队 =======================

export interface PromoterTeamVO {
  id?: number
  teamCode?: string
  name: string
  leaderId?: number
  leaderName?: string
  leaderMobile?: string
  status: number
  memberCount?: number
  remark?: string
  createTime?: string
  updateTime?: string
}

// 分页查询团队
export const getPromoterTeamPage = async (params?: any) => {
  return await request.get({ url: `/trade/promoter-team/page`, params })
}

// 查询团队详情
export const getPromoterTeam = async (id: number) => {
  return await request.get({ url: `/trade/promoter-team/get?id=` + id })
}

// 获取团队列表
export const getPromoterTeamList = async () => {
  return await request.get({ url: `/trade/promoter-team/list` })
}

// 创建团队
export const createPromoterTeam = async (data: PromoterTeamVO) => {
  return await request.post({ url: `/trade/promoter-team/create`, data })
}

// 更新团队
export const updatePromoterTeam = async (data: PromoterTeamVO) => {
  return await request.put({ url: `/trade/promoter-team/update`, data })
}

// 删除团队
export const deletePromoterTeam = async (id: number) => {
  return await request.delete({ url: `/trade/promoter-team/delete?id=` + id })
}

// 设置团队负责人
export const setPromoterTeamLeader = async (id: number, leaderId: number) => {
  return await request.put({ url: `/trade/promoter-team/set-leader`, data: { id, leaderId } })
}


