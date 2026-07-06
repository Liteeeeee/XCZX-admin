<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="85px"
    >
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          class="!w-240px"
          clearable
          placeholder="请输入商品名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="SPU 名称" prop="spuName">
        <el-input
          v-model="queryParams.spuName"
          class="!w-240px"
          clearable
          placeholder="请输入 SPU 名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="SKU 名称" prop="skuName">
        <el-input
          v-model="queryParams.skuName"
          class="!w-240px"
          clearable
          placeholder="请输入 SKU 名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品标签" prop="productTag">
        <el-input
          v-model="queryParams.productTag"
          class="!w-240px"
          clearable
          placeholder="请输入商品标签"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          class="!w-240px"
          clearable
          placeholder="请输入关键字"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="展示状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请选择展示状态"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
        <el-button
          v-hasPermi="['promotion:website-product:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="编号" min-width="90" prop="id" />
      <el-table-column align="center" label="商品名称" min-width="200" prop="productName" />
      <el-table-column align="center" label="SPU 名称" min-width="160" prop="spuName" />
      <el-table-column align="center" label="SKU 名称" min-width="160" prop="skuName" />
      <el-table-column align="center" label="商品标签" min-width="120" prop="productTag" />
      <el-table-column align="center" label="关键字" min-width="120" prop="keyword" />
      <el-table-column align="center" label="展示理由" min-width="200" prop="displayReason" />
      <el-table-column align="center" label="展示状态" min-width="90" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" min-width="70" prop="sort" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="开启时间"
        prop="openTime"
        width="180px"
      />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180px"
      />
      <el-table-column align="center" fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
            v-hasPermi="['promotion:website-product:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-hasPermi="['promotion:website-product:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
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

  <WebsiteProductForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as WebsiteProductApi from '@/api/mall/promotion/websiteProduct'
import WebsiteProductForm from './WebsiteProductForm.vue'

defineOptions({ name: 'WebsiteProduct' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref([])
const statusOptions = [
  { label: '关闭', value: 0 },
  { label: '开启', value: 1 }
]

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  productName: undefined as string | undefined,
  spuName: undefined as string | undefined,
  skuName: undefined as string | undefined,
  productTag: undefined as string | undefined,
  keyword: undefined as string | undefined,
  status: undefined as number | undefined,
  createTime: [] as string[]
})

const queryFormRef = ref()

const getStatusLabel = (status: number) => {
  return statusOptions.find((item) => item.value === status)?.label || '未知'
}

const getList = async () => {
  loading.value = true
  try {
    const data = await WebsiteProductApi.getWebsiteProductPage(queryParams)
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
    await WebsiteProductApi.deleteWebsiteProduct(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
