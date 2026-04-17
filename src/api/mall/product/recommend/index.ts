import request from '@/config/axios'

export interface RecommendVO {
  id?: number
  skuId: number
  skuPicUrl?: string
  spuName?: string
  spuPicUrl?: string
  skuPrice?: number
  marketPrice?: number
  status?: number
  reason?: string
  feature?: string
  sort?: number
  createTime?: Date
}

export interface RecommendSkuSimpleVO {
  id: number
  spuName: string
  picUrl?: string
  price?: number
  marketPrice?: number
}

// 获得推荐商品分页
export const getRecommendPage = async (params: any) => {
  return await request.get({ url: '/product/recommend/page', params })
}

// 获得推荐商品
export const getRecommend = async (id: number) => {
  return await request.get({ url: '/product/recommend/get', params: { id } })
}

// 创建推荐商品
export const createRecommend = async (data: RecommendVO) => {
  return await request.post({ url: '/product/recommend/create', data })
}

// 更新推荐商品
export const updateRecommend = async (data: RecommendVO) => {
  return await request.put({ url: '/product/recommend/update', data })
}

// 删除推荐商品
export const deleteRecommend = async (id: number) => {
  return await request.delete({ url: '/product/recommend/delete', params: { id } })
}

// 获得 SKU 选择器分页
export const getRecommendSkuPage = async (params: any) => {
  return await request.get({ url: '/product/recommend/sku/page', params })
}
