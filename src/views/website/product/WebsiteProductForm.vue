<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="60%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="formData.productName" placeholder="请输入商品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品标签" prop="productTag">
            <el-input v-model="formData.productTag" placeholder="请输入商品标签" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="formData.keyword" placeholder="请输入关键字" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开启时间" prop="openTime">
            <el-date-picker
              v-model="formData.openTime"
              type="datetime"
              placeholder="请选择开启时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="w-full!"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="展示状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" clearable controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联商品" prop="spuId">
            <div class="flex flex-wrap items-center gap-10px">
              <el-tag v-if="formData.spuId" type="info">
                SPU：{{ formData.spuName || formData.spuId }}
              </el-tag>
              <el-tag v-if="formData.skuId" type="success">
                SKU：{{ formData.skuName || formData.skuId }}
              </el-tag>
              <el-button @click="spuSelectRef?.open()">选择商品</el-button>
              <el-button v-if="formData.spuId || formData.skuId" @click="clearSelectedProduct">清除</el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="展示理由" prop="displayReason">
            <el-input v-model="formData.displayReason" type="textarea" placeholder="请输入展示理由" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="管理员备注" prop="adminMemo">
            <el-input v-model="formData.adminMemo" type="textarea" placeholder="请输入管理员备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
  <SpuSelect ref="spuSelectRef" :is-select-sku="true" :radio="true" @confirm="selectProduct" />
</template>

<script lang="ts" setup>
import * as WebsiteProductApi from '@/api/mall/promotion/websiteProduct'
import * as ProductSpuApi from '@/api/mall/product/spu'
import { SpuSelect } from '@/views/mall/promotion/components'

defineOptions({ name: 'WebsiteProductForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const statusOptions = [
  { label: '关闭', value: 0 },
  { label: '开启', value: 1 }
]

const formData = ref({
  id: undefined as number | undefined,
  spuId: undefined as number | undefined,
  spuName: undefined as string | undefined,
  skuId: undefined as number | undefined,
  skuName: undefined as string | undefined,
  productName: undefined as string | undefined,
  productTag: undefined as string | undefined,
  keyword: undefined as string | undefined,
  displayReason: undefined as string | undefined,
  adminMemo: undefined as string | undefined,
  status: 0,
  sort: 0,
  openTime: undefined as string | undefined
})

const formRules = reactive({
  productName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '展示状态不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})

const formRef = ref()
const spuSelectRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (!id) return
  formLoading.value = true
  try {
    const data = (await WebsiteProductApi.getWebsiteProduct(id)) as any
    if (data.openTime === 0 || data.openTime === '0') {
      data.openTime = undefined
    }
    formData.value = data
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })

const selectProduct = async (spuId: number, skuIds?: number[]) => {
  const skuId = skuIds?.[0]
  const spu = (await ProductSpuApi.getSpu(spuId)) as ProductSpuApi.Spu
  const sku = spu.skus?.find((item) => item.id === skuId)
  formData.value.spuId = spuId
  formData.value.spuName = spu.name
  formData.value.skuId = skuId
  formData.value.skuName = sku?.name
  if (!formData.value.productName) {
    formData.value.productName = sku?.name || spu.name
  }
}

const clearSelectedProduct = () => {
  formData.value.spuId = undefined
  formData.value.spuName = undefined
  formData.value.skuId = undefined
  formData.value.skuName = undefined
}

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = {
      ...formData.value,
      openTime:
        !formData.value.openTime || formData.value.openTime === (0 as any) || formData.value.openTime === ('0' as any)
          ? null
          : formData.value.openTime
    } as unknown as WebsiteProductApi.WebsiteProductVO
    if (formType.value === 'create') {
      await WebsiteProductApi.createWebsiteProduct(data)
      message.success(t('common.createSuccess'))
    } else {
      await WebsiteProductApi.updateWebsiteProduct(data)
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
    spuId: undefined,
    spuName: undefined,
    skuId: undefined,
    skuName: undefined,
    productName: undefined,
    productTag: undefined,
    keyword: undefined,
    displayReason: undefined,
    adminMemo: undefined,
    status: 0,
    sort: 0,
    openTime: undefined
  }
  formRef.value?.resetFields()
}
</script>
