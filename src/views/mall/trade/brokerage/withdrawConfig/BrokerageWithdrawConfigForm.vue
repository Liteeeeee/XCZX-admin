<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="45%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="唯一编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入唯一编码" />
      </el-form-item>
      <el-form-item label="提现最低金额" prop="withdrawMinPrice">
        <el-input-number
          v-model="formData.withdrawMinPrice"
          :min="200"
          :precision="2"
          class="!w-xs"
          placeholder="请输入提现最低金额"
        />
        <el-text class="w-full" size="small" type="info">单位：元，最低 200 元</el-text>
      </el-form-item>
      <el-form-item label="提现最高金额" prop="withdrawMaxPrice">
        <el-input-number
          v-model="formData.withdrawMaxPrice"
          :min="0"
          :precision="2"
          class="!w-xs"
          placeholder="请输入提现最高金额"
        />
        <el-text class="w-full" size="small" type="info">单位：元，0 表示不限制</el-text>
      </el-form-item>
      <el-form-item label="提现费率(%)" prop="withdrawFeeRate">
        <el-input-number
          v-model="formData.withdrawFeeRate"
          :max="100"
          :min="0"
          :precision="1"
          :step="0.1"
          class="!w-xs"
          placeholder="请输入提现费率"
        />
        <el-text class="w-full" size="small" type="info">单位：%，保留 1 位小数</el-text>
      </el-form-item>
      <el-form-item label="提现规则内容" prop="withdrawDescription">
        <el-input
          v-model="formData.withdrawDescription"
          :rows="3"
          placeholder="请输入提现规则内容"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="其他说明内容" prop="otherDescription">
        <el-input
          v-model="formData.otherDescription"
          :rows="3"
          placeholder="请输入其他说明内容"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" :rows="3" placeholder="请输入备注" type="textarea" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="CommonStatusEnum.ENABLE">启用</el-radio>
          <el-radio :value="CommonStatusEnum.DISABLE">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" class="!w-xs" placeholder="请输入排序" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { FormRules } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import * as BrokerageWithdrawConfigApi from '@/api/mall/trade/brokerage/withdrawConfig'
import { convertToInteger, fenToYuan } from '@/utils'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'BrokerageWithdrawConfigForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formData = ref({
  id: undefined as number | undefined,
  code: '',
  withdrawMinPrice: 200,
  withdrawMaxPrice: 0,
  withdrawFeeRate: 0,
  withdrawDescription: '',
  otherDescription: '',
  remark: '',
  status: CommonStatusEnum.ENABLE,
  sort: 1
})
const formRules = reactive<FormRules>({
  code: [{ required: true, message: '唯一编码不能为空', trigger: 'blur' }],
  withdrawMinPrice: [{ required: true, message: '提现最低金额不能为空', trigger: 'blur' }],
  withdrawFeeRate: [{ required: true, message: '提现费率不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增佣金提现配置' : '修改佣金提现配置'
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      const res = (await BrokerageWithdrawConfigApi.getBrokerageWithdrawConfig(
        id
      )) as BrokerageWithdrawConfigApi.BrokerageWithdrawConfigVO
      formData.value = {
        id: res.id,
        code: res.code || '',
        withdrawMinPrice: parseFloat(fenToYuan(res.withdrawMinPrice || 0)),
        withdrawMaxPrice: parseFloat(fenToYuan(res.withdrawMaxPrice || 0)),
        withdrawFeeRate: res.withdrawFeeRate || 0,
        withdrawDescription: res.withdrawDescription || '',
        otherDescription: res.otherDescription || '',
        remark: res.remark || '',
        status: res.status ?? CommonStatusEnum.ENABLE,
        sort: res.sort ?? 1
      }
    } finally {
      formLoading.value = false
    }
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
    const data = cloneDeep(unref(formData)) as unknown as BrokerageWithdrawConfigApi.BrokerageWithdrawConfigVO
    data.withdrawMinPrice = convertToInteger(data.withdrawMinPrice)
    data.withdrawMaxPrice = convertToInteger(data.withdrawMaxPrice)
    if (formType.value === 'create') {
      await BrokerageWithdrawConfigApi.createBrokerageWithdrawConfig(data)
      message.success(t('common.createSuccess'))
    } else {
      await BrokerageWithdrawConfigApi.updateBrokerageWithdrawConfig(data)
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
    code: '',
    withdrawMinPrice: 200,
    withdrawMaxPrice: 0,
    withdrawFeeRate: 0,
    withdrawDescription: '',
    otherDescription: '',
    remark: '',
    status: CommonStatusEnum.ENABLE,
    sort: 1
  }
  formRef.value?.resetFields()
}
</script>
