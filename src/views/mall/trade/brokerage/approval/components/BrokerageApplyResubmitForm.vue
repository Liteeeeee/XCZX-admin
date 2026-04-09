<template>
  <Dialog title="重新审批" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" v-loading="formLoading">
      <el-form-item label="职业" prop="occupation">
        <el-input v-model="formData.occupation" placeholder="请输入职业" />
      </el-form-item>
      <el-form-item label="证件号码" prop="idCardNo">
        <el-input v-model="formData.idCardNo" placeholder="请输入证件号码" />
      </el-form-item>
      <el-form-item label="证件照正面" prop="idCardFrontUrl">
        <UploadImg v-model="formData.idCardFrontUrl" :limit="1" :is-show-tip="false" />
      </el-form-item>
      <el-form-item label="证件照反面" prop="idCardBackUrl">
        <UploadImg v-model="formData.idCardBackUrl" :limit="1" :is-show-tip="false" />
      </el-form-item>
      <el-form-item label="补充资料(JSON)" prop="additionalInfo">
        <el-input v-model="formData.additionalInfo" type="textarea" placeholder="请输入补充资料（JSON 格式）" />
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
  applyId: undefined,
  occupation: undefined,
  idCardNo: undefined,
  idCardFrontUrl: undefined,
  idCardBackUrl: undefined,
  additionalInfo: undefined
})
const formRules = reactive({
  occupation: [{ required: true, message: '职业不能为空', trigger: 'blur' }],
  idCardNo: [{ required: true, message: '证件号码不能为空', trigger: 'blur' }],
  idCardFrontUrl: [{ required: true, message: '证件照正面不能为空', trigger: 'change' }],
  idCardBackUrl: [{ required: true, message: '证件照反面不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (applyId: number) => {
  dialogVisible.value = true
  resetForm()
  formLoading.value = true
  try {
    const data = await BrokerageApplyApi.getBrokerageApply(applyId)
    formData.value.applyId = applyId
    formData.value.occupation = data.occupation
    formData.value.idCardNo = data.idCardNo
    formData.value.idCardFrontUrl = data.idCardFrontUrl
    formData.value.idCardBackUrl = data.idCardBackUrl
    formData.value.additionalInfo = data.additionalInfo
  } finally {
    formLoading.value = false
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
    await BrokerageApplyApi.resubmitBrokerageApply(formData.value as unknown as BrokerageApplyApi.AppBrokerageApplyResubmitReqVO)
    message.success('重新提交成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    applyId: undefined,
    occupation: undefined,
    idCardNo: undefined,
    idCardFrontUrl: undefined,
    idCardBackUrl: undefined,
    additionalInfo: undefined
  }
  formRef.value?.resetFields()
}
</script>

