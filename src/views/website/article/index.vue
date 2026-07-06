<template>
  <ContentWrap>
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="95px">
      <el-form-item label="文章分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" class="!w-240px" clearable placeholder="全部">
          <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="搜索关键字" prop="searchKey">
        <el-input
          v-model="queryParams.searchKey"
          class="!w-240px"
          clearable
          placeholder="关键字/标签/标题/内容"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="展示状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择展示状态">
          <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否热门" prop="recommendHot">
        <el-select v-model="queryParams.recommendHot" class="!w-240px" clearable placeholder="全部">
          <el-option v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否轮播图" prop="recommendBanner">
        <el-select v-model="queryParams.recommendBanner" class="!w-240px" clearable placeholder="全部">
          <el-option v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联 SPU" prop="spuId">
        <el-input-number v-model="queryParams.spuId" :min="0" clearable controls-position="right" class="!w-240px" />
      </el-form-item>
      <el-form-item label="关联 SKU" prop="skuId">
        <el-input-number v-model="queryParams.skuId" :min="0" clearable controls-position="right" class="!w-240px" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button v-hasPermi="['promotion:website-article:create']" plain type="primary" @click="openForm('create')">
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="编号" min-width="90" prop="id" />
      <el-table-column align="center" label="封面" min-width="80" prop="picUrl">
        <template #default="{ row }">
          <el-image v-if="row.picUrl" :src="row.picUrl" class="h-30px w-30px" @click="imagePreview(row.picUrl)" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题" min-width="200" prop="title" />
      <el-table-column align="center" label="分类" min-width="160" prop="categoryId">
        <template #default="scope">
          {{ categoryList.find((item) => item.id === scope.row.categoryId)?.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="标签" min-width="120" prop="tag" />
      <el-table-column align="center" label="作者" min-width="120" prop="author" />
      <el-table-column align="center" label="排序" min-width="70" prop="sort" />
      <el-table-column align="center" label="展示状态" min-width="90" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="热门" min-width="70" prop="recommendHot">
        <template #default="scope">
          <el-tag :type="scope.row.recommendHot ? 'success' : 'info'">
            {{ scope.row.recommendHot ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="轮播图" min-width="70" prop="recommendBanner">
        <template #default="scope">
          <el-tag :type="scope.row.recommendBanner ? 'success' : 'info'">
            {{ scope.row.recommendBanner ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :formatter="dateFormatter" align="center" label="发布时间" prop="publishTime" width="180px" />
      <el-table-column :formatter="dateFormatter" align="center" label="创建时间" prop="createTime" width="180px" />
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button v-hasPermi="['promotion:website-article:update']" link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button v-hasPermi="['promotion:website-article:delete']" link type="danger" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNo" :total="total" @pagination="getList" />
  </ContentWrap>

  <WebsiteArticleForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { createImageViewer } from '@/components/ImageViewer'
import * as WebsiteArticleApi from '@/api/mall/promotion/websiteArticle'
import * as ArticleCategoryApi from '@/api/mall/promotion/articleCategory'
import WebsiteArticleForm from './WebsiteArticleForm.vue'

defineOptions({ name: 'WebsiteArticle' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  categoryId: undefined as number | undefined,
  searchKey: undefined as string | undefined,
  status: undefined as number | undefined,
  recommendHot: undefined as boolean | undefined,
  recommendBanner: undefined as boolean | undefined,
  spuId: undefined as number | undefined,
  skuId: undefined as number | undefined,
  createTime: [] as string[]
})

const queryFormRef = ref()

const categoryList = ref<ArticleCategoryApi.ArticleCategoryVO[]>([])

const imagePreview = (imgUrl: string) => {
  createImageViewer({ urlList: [imgUrl] })
}

const getList = async () => {
  loading.value = true
  try {
    const data = await WebsiteArticleApi.getWebsiteArticlePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await WebsiteArticleApi.deleteWebsiteArticle(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  categoryList.value =
    (await ArticleCategoryApi.getSimpleArticleCategoryList()) as ArticleCategoryApi.ArticleCategoryVO[]
  await getList()
})
</script>
