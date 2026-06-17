<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="680">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入分类名称" class="!w-240px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入分类编码" class="!w-240px" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="分类描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入分类描述" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
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
import { CommonStatusEnum } from '@/utils/constants'
import * as CategoryApi from '@/api/member/wordingCategory'

defineOptions({ name: 'MemberWordingCategoryForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formRef = ref()

const formData = ref<CategoryApi.MemberWordingCategoryVO>({
  id: undefined,
  name: undefined,
  code: undefined,
  description: undefined,
  status: CommonStatusEnum.ENABLE
})

const formRules = reactive({
  name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '分类编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    code: undefined,
    description: undefined,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (type !== 'update' || !id) return
  formLoading.value = true
  try {
    const data = await CategoryApi.getMemberWordingCategory(id)
    formData.value = { ...formData.value, ...(data || {}) }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = { ...formData.value }
    if (formType.value === 'create') {
      await CategoryApi.createMemberWordingCategory(data)
      message.success(t('common.createSuccess'))
    } else {
      await CategoryApi.updateMemberWordingCategory(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>
