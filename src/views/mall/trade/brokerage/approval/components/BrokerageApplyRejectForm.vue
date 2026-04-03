<template>
  <Dialog title="审核" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="拒绝原因" prop="auditReason">
        <el-input v-model="formData.auditReason" type="textarea" placeholder="请输入拒绝原因" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as BrokerageApplyApi from '@/api/mall/trade/brokerage/approval'

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const formData = ref({
  id: undefined,
  auditReason: undefined
})
const formRules = reactive({
  auditReason: [{ required: true, message: '拒绝原因不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (id: number) => {
  dialogVisible.value = true
  resetForm()
  formData.value.id = id
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    await BrokerageApplyApi.auditBrokerageApply({
      id: formData.value.id as unknown as number,
      status: 2,
      auditReason: formData.value.auditReason as unknown as string
    })
    message.success('驳回成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    auditReason: undefined
  }
  formRef.value?.resetFields()
}
</script>

