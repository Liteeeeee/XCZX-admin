import request from '@/config/axios'

export interface LevelRightsVO {
  id?: number
  memberLevelId: number
  level: number
  rightsIds: number[]
  status: number
}

// 获得会员等级权益关联分页
export const getLevelRightsPage = async (params) => {
  return await request.get({ url: `/member/level-rights/page`, params })
}

// 根据会员等级获得关联的权益
export const getLevelRightsListByLevel = async (memberLevelId: number) => {
  return await request.get({
    url: `/member/level-rights/list-by-level?memberLevelId=` + memberLevelId
  })
}

// 获得会员等级权益关联
export const getLevelRights = async (id: number) => {
  return await request.get({ url: `/member/level-rights/get?id=` + id })
}

// 创建会员等级权益关联
export const createLevelRights = async (data: LevelRightsVO) => {
  return await request.post({ url: `/member/level-rights/create`, data })
}

// 更新会员等级权益关联
export const updateLevelRights = async (data: any) => {
  return await request.put({ url: `/member/level-rights/update`, data })
}

// 删除会员等级权益关联
export const deleteLevelRights = async (data: { memberLevelId: number; rightsIds: number[] }) => {
  return await request.delete({ url: `/member/level-rights/delete`, data })
}
