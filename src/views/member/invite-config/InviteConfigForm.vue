<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
      v-loading="formLoading"
    >
      <el-form-item label="配置名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入配置名称" />
      </el-form-item>
      <el-form-item label="第一邀请人成长值" prop="firstExperience">
        <el-input-number v-model="formData.firstExperience" :min="0" placeholder="请输入第一邀请人成长值" />
      </el-form-item>
      <el-form-item label="其他邀请人成长值" prop="otherExperience">
        <el-input-number v-model="formData.otherExperience" :min="0" placeholder="请输入其他邀请人成长值" />
      </el-form-item>
      <el-form-item label="首邀人允许升级" prop="firstUpgradeEnable">
        <el-radio-group v-model="formData.firstUpgradeEnable">
          <el-radio :label="true">允许</el-radio>
          <el-radio :label="false">不允许</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="触发升级的会员等级" prop="upgradeLevel">
        <el-input-number v-model="formData.upgradeLevel" :min="1" placeholder="请输入会员等级" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as MemberInviteConfigApi from '@/api/member/invite-config'
import { CommonStatusEnum } from '@/utils/constants'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  name: undefined,
  firstExperience: undefined,
  otherExperience: undefined,
  firstUpgradeEnable: true,
  upgradeLevel: undefined,
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  firstExperience: [{ required: true, message: '第一邀请人成长值不能为空', trigger: 'blur' }],
  otherExperience: [{ required: true, message: '其他邀请人成长值不能为空', trigger: 'blur' }],
  firstUpgradeEnable: [{ required: true, message: '第一邀请人是否允许升级不能为空', trigger: 'change' }],
  upgradeLevel: [{ required: true, message: '触发强制升级的会员等级不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MemberInviteConfigApi.getMemberInviteConfig(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as MemberInviteConfigApi.MemberInviteConfigVO
    if (formType.value === 'create') {
      await MemberInviteConfigApi.createMemberInviteConfig(data)
      message.success(t('common.createSuccess'))
    } else {
      await MemberInviteConfigApi.updateMemberInviteConfig(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    firstExperience: undefined,
    otherExperience: undefined,
    firstUpgradeEnable: true,
    upgradeLevel: undefined,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}

const emit = defineEmits(['success'])
</script>
