<template>
  <Dialog v-model="dialogVisible" title="确认退款" width="45%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="退款汇总" label-class-name="no-colon">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="实付金额">
            ￥{{ refundSummary ? fenToYuan(refundSummary.payPrice) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="运费金额">
            ￥{{ refundSummary ? fenToYuan(refundSummary.deliveryPrice) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="已退款金额">
            ￥{{ refundSummary ? fenToYuan(refundSummary.refundedPrice) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="剩余可退">
            ￥{{ refundSummary ? fenToYuan(refundSummary.remainingRefundPrice) : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-form-item>
      <el-form-item label="退款金额" prop="refundPrice">
        <el-input-number
          v-model="formData.refundPrice"
          :min="0"
          :max="maxRefundPrice"
          :precision="2"
          :step="0.01"
          class="!w-xs"
          placeholder="请输入退款金额"
        />
        <el-text class="w-full" size="small" type="info">单位：元</el-text>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { FormRules } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import * as AfterSaleApi from '@/api/mall/trade/afterSale/index'
import { convertToInteger, fenToYuan } from '@/utils'

defineOptions({ name: 'AfterSaleRefundForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const refundSummary = ref<AfterSaleApi.AfterSaleOrderItemRefundSummaryRespVO>()
const maxRefundPrice = computed(() => {
  if (!refundSummary.value) return undefined
  return parseFloat(fenToYuan(refundSummary.value.remainingRefundPrice))
})
const formData = ref({
  id: undefined as number | undefined,
  refundPrice: 0
})
const formRules = reactive<FormRules>({
  refundPrice: [{ required: true, message: '退款金额不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (row: AfterSaleApi.TradeAfterSaleVO) => {
  resetForm()
  formLoading.value = true
  formData.value.id = row.id ?? undefined
  try {
    if (row.orderItemId != null) {
      refundSummary.value = await AfterSaleApi.getRefundSummary(row.orderItemId)
      formData.value.refundPrice = parseFloat(fenToYuan(refundSummary.value.remainingRefundPrice))
    } else {
      refundSummary.value = undefined
      formData.value.refundPrice = parseFloat(fenToYuan(row.refundPrice || 0))
    }
    dialogVisible.value = true
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = cloneDeep(unref(formData))
    data.refundPrice = convertToInteger(data.refundPrice)
    await AfterSaleApi.refund(data)
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('success', true)
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  refundSummary.value = undefined
  formData.value = {
    id: undefined,
    refundPrice: 0
  }
  formRef.value?.resetFields()
}
</script>
