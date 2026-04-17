<template>
  <ContentWrap>
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px" label-width="90px">
      <el-form-item label="SKU 编号" prop="skuId">
        <el-input
          v-model="queryParams.skuId"
          class="!w-240px"
          clearable
          placeholder="请输入 SKU 编号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="全部">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推荐理由" prop="reason">
        <el-input
          v-model="queryParams.reason"
          class="!w-240px"
          clearable
          placeholder="请输入推荐理由"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="推荐特点" prop="feature">
        <el-input
          v-model="queryParams.feature"
          class="!w-240px"
          clearable
          placeholder="请输入推荐特点"
          @keyup.enter="handleQuery"
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
        <el-button v-hasPermi="['product:recommend:create']" plain type="primary" @click="openForm('create')">
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="编号" min-width="80" prop="id" />
      <el-table-column align="center" label="SKU 编号" min-width="90" prop="skuId" />
      <el-table-column align="center" label="商品" min-width="220">
        <template #default="{ row }">
          <div class="flex items-center gap-8px">
            <el-image v-if="row.skuPicUrl || row.spuPicUrl" :src="row.skuPicUrl || row.spuPicUrl" class="h-36px w-36px" />
            <span>{{ row.spuName || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="销售价(元)" min-width="100">
        <template #default="{ row }">
          {{ fenToYuan(row.skuPrice || 0) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="市场价(元)" min-width="100">
        <template #default="{ row }">
          {{ fenToYuan(row.marketPrice || 0) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" min-width="80" prop="status">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="推荐理由" min-width="180" prop="reason" />
      <el-table-column align="center" label="推荐特点" min-width="180" prop="feature" />
      <el-table-column align="center" label="排序" min-width="80" prop="sort" />
      <el-table-column :formatter="dateFormatter" align="center" label="创建时间" min-width="180" prop="createTime" />
      <el-table-column align="center" label="操作" width="160">
        <template #default="{ row }">
          <el-button v-hasPermi="['product:recommend:update']" link type="primary" @click="openForm('update', row.id)">
            编辑
          </el-button>
          <el-button v-hasPermi="['product:recommend:delete']" link type="danger" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <RecommendForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { fenToYuan } from '@/utils'
import * as RecommendApi from '@/api/mall/product/recommend'
import RecommendForm from './RecommendForm.vue'

defineOptions({ name: 'ProductRecommend' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<RecommendApi.RecommendVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  skuId: undefined,
  status: undefined,
  reason: undefined,
  feature: undefined
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await RecommendApi.getRecommendPage(queryParams)
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
  queryFormRef.value?.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await RecommendApi.deleteRecommend(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
