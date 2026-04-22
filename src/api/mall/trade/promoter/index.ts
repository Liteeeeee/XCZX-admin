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
  return await request.download({ url: `/trade/promoter/get-import-template` })
}

// 导入推广员列表
export const importPromoter = async (data: { fileUrl: string, reason?: string, batchNo?: string }) => {
  return await request.post({ url: `/trade/promoter/import`, data })
}

// ======================= 推广员负责地区 =======================

export interface PromoterAreaVO {
  id?: number
  promoterId?: number
  mobile?: string
  name?: string
  areaId: number
  areaName: string
  parentId?: number
  parentName?: string
  status?: number
  memberCount?: number
  description?: string
  createTime?: string
  updateTime?: string
}

// 分页查询推广员地区（Leader管理）
export const getPromoterAreaPage = async (params?: any) => {
  return await request.get({ url: `/trade/promoter/area/page`, params })
}

// 添加推广员负责地区
export const createPromoterArea = async (data: any) => {
  return await request.post({ url: `/trade/promoter/area/add`, data })
}

// 删除推广员负责地区
export const deletePromoterArea = async (id: number) => {
  return await request.delete({ url: `/trade/promoter/area/delete?id=` + id })
}

// 清空推广区域负责人
export const clearPromoterAreaLeader = async (id: number) => {
  return await request.put({ url: `/trade/promoter/area/clear-leader?id=` + id })
}

// 更新推广员负责地区状态（如果是虚拟字段，后端可能暂无此接口）
export const updatePromoterAreaStatus = async (id: number, status: number) => {
  return await request.put({ url: `/trade/promoter/area/update-status`, data: { id, status } })
}

