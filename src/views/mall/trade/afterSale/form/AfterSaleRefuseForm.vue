<template>
  <Dialog v-model="dialogVisible" title="拒绝收货" width="45%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="拒绝原因" prop="refuseMemo">
        <el-input
          v-model="formData.refuseMemo"
          :rows="3"
          placeholder="请输入拒绝原因"
          type="textarea"
        />
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
import * as AfterSaleApi from '@/api/mall/trade/afterSale/index'

defineOptions({ name: 'AfterSaleRefuseForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formData = ref({
  id: undefined as number | undefined,
  refuseMemo: ''
})
const formRules = reactive<FormRules>({
  refuseMemo: [{ required: true, message: '拒绝原因不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (row: AfterSaleApi.TradeAfterSaleVO) => {
  resetForm()
  formData.value.id = row.id ?? undefined
  formData.value.refuseMemo = row.receiveReason ?? ''
  dialogVisible.value = true
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    await AfterSaleApi.refuse(unref(formData))
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    emit('success', true)
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    refuseMemo: ''
  }
  formRef.value?.resetFields()
}
</script>
