<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="推荐商品" prop="skuId">
            <div class="w-full">
              <el-button type="primary" plain @click="openSkuDialog">选择 SKU</el-button>
              <div v-if="selectedSku" class="mt-10px flex items-center gap-12px">
                <el-image
                  v-if="selectedSku.picUrl"
                  :src="selectedSku.picUrl"
                  style="width: 48px; height: 48px"
                  fit="cover"
                />
                <div class="text-14px">
                  <div>{{ selectedSku.spuName }}</div>
                  <div class="text-12px text-[var(--el-text-color-secondary)]">
                    SKU：{{ selectedSku.id }}，价格：{{ fenToYuan(selectedSku.price || 0) }} 元
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="推荐理由" prop="reason">
            <el-input v-model="formData.reason" placeholder="请输入推荐理由" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="推荐特点" prop="feature">
            <el-input v-model="formData.feature" placeholder="请输入推荐特点" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <Dialog v-model="skuDialogVisible" title="选择 SKU" width="900px">
    <el-form ref="skuQueryFormRef" :inline="true" :model="skuQueryParams" class="-mb-15px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="skuQueryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入 SKU 或 SPU 名称"
          @keyup.enter="handleSkuQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleSkuQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetSkuQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="skuLoading" :data="skuList" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="SKU ID" min-width="90" prop="id" />
      <el-table-column align="center" label="图片" min-width="80">
        <template #default="{ row }">
          <el-image v-if="row.picUrl" :preview-src-list="[row.picUrl]" :src="row.picUrl" class="h-36px w-36px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品名称" min-width="180" prop="spuName" />
      <el-table-column align="center" label="销售价(元)" min-width="100">
        <template #default="{ row }">
          {{ fenToYuan(row.price || 0) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="市场价(元)" min-width="100">
        <template #default="{ row }">
          {{ fenToYuan(row.marketPrice || 0) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleSelectSku(row)">选择</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="skuQueryParams.pageSize"
      v-model:page="skuQueryParams.pageNo"
      :total="skuTotal"
      @pagination="getSkuList"
    />
  </Dialog>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { fenToYuan } from '@/utils'
import * as RecommendApi from '@/api/mall/product/recommend'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formRef = ref()
const formData = ref<RecommendApi.RecommendVO>({
  id: undefined,
  skuId: undefined as unknown as number,
  status: 0,
  reason: undefined,
  feature: undefined,
  sort: 0
})
const formRules = reactive({
  skuId: [{ required: true, message: '请选择推荐商品', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const selectedSku = ref<RecommendApi.RecommendSkuSimpleVO>()
const skuDialogVisible = ref(false)
const skuLoading = ref(false)
const skuList = ref<RecommendApi.RecommendSkuSimpleVO[]>([])
const skuTotal = ref(0)
const skuQueryFormRef = ref()
const skuQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined
})

const getSkuList = async () => {
  skuLoading.value = true
  try {
    const data = await RecommendApi.getRecommendSkuPage(skuQueryParams)
    skuList.value = data.list
    skuTotal.value = data.total
  } finally {
    skuLoading.value = false
  }
}

const openSkuDialog = async () => {
  skuDialogVisible.value = true
  await getSkuList()
}

const handleSkuQuery = () => {
  skuQueryParams.pageNo = 1
  getSkuList()
}

const resetSkuQuery = () => {
  skuQueryFormRef.value?.resetFields()
  handleSkuQuery()
}

const handleSelectSku = (row: RecommendApi.RecommendSkuSimpleVO) => {
  selectedSku.value = row
  formData.value.skuId = row.id
  skuDialogVisible.value = false
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      const data = await RecommendApi.getRecommend(id)
      formData.value = data
      selectedSku.value = {
        id: data.skuId,
        spuName: data.spuName || '',
        picUrl: data.skuPicUrl || data.spuPicUrl,
        price: data.skuPrice,
        marketPrice: data.marketPrice
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = formData.value as RecommendApi.RecommendVO
    if (formType.value === 'create') {
      await RecommendApi.createRecommend(data)
      message.success(t('common.createSuccess'))
    } else {
      await RecommendApi.updateRecommend(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    skuId: undefined as unknown as number,
    status: 0,
    reason: undefined,
    feature: undefined,
    sort: 0
  }
  selectedSku.value = undefined
  formRef.value?.resetFields()
}
</script>
