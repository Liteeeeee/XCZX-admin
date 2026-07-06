import request from '@/config/axios'

export interface WebsiteProductVO {
  id?: number
  spuId?: number
  spuName?: string
  skuId?: number
  skuName?: string
  productName: string
  productTag?: string
  keyword?: string
  displayReason?: string
  adminMemo?: string
  status: number
  sort: number
  openTime?: string
  createTime?: string
}

export const getWebsiteProductPage = async (params: any) => {
  return await request.get({ url: `/promotion/website-product/page`, params })
}

export const getWebsiteProduct = async (id: number) => {
  return await request.get({ url: `/promotion/website-product/get?id=` + id })
}

export const createWebsiteProduct = async (data: WebsiteProductVO) => {
  return await request.post({ url: `/promotion/website-product/create`, data })
}

export const updateWebsiteProduct = async (data: WebsiteProductVO) => {
  return await request.put({ url: `/promotion/website-product/update`, data })
}

export const deleteWebsiteProduct = async (id: number) => {
  return await request.delete({ url: `/promotion/website-product/delete?id=` + id })
}
