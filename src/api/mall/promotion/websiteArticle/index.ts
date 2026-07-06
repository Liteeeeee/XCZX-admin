import request from '@/config/axios'

export interface WebsiteArticleVO {
  id?: number
  title: string
  categoryId: number
  keyword?: string
  tag?: string
  author?: string
  introduction?: string
  picUrl?: string
  sort: number
  status: number
  recommendHot: boolean
  recommendBanner: boolean
  bannerPicUrl?: string
  spuId?: number
  skuId?: number
  content: string
  publishTime?: string
  createTime?: string
}

export const getWebsiteArticlePage = async (params: any) => {
  return await request.get({ url: `/promotion/website-article/page`, params })
}

export const getWebsiteArticle = async (id: number) => {
  return await request.get({ url: `/promotion/website-article/get?id=` + id })
}

export const createWebsiteArticle = async (data: WebsiteArticleVO) => {
  return await request.post({ url: `/promotion/website-article/create`, data })
}

export const updateWebsiteArticle = async (data: WebsiteArticleVO) => {
  return await request.put({ url: `/promotion/website-article/update`, data })
}

export const deleteWebsiteArticle = async (id: number) => {
  return await request.delete({ url: `/promotion/website-article/delete?id=` + id })
}
