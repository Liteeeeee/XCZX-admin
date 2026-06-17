<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="标签组" prop="groupId">
        <el-select v-model="formData.groupId" placeholder="请选择标签组" class="!w-240px">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入编码" />
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
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" class="!w-240px" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
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
import * as FansTagApi from '@/api/member/fans-tag'
import { CommonStatusEnum } from '@/utils/constants'
import type { FansTagGroupVO } from '@/api/member/fans-tag-group'

defineOptions({ name: 'MemberFansTagForm' })

const props = defineProps<{
  groupList: FansTagGroupVO[]
}>()

const emit = defineEmits(['success'])
const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<'create' | 'update'>('create')
const formData = ref<FansTagApi.FansTagVO>({
  id: undefined,
  groupId: undefined,
  name: undefined,
  code: undefined,
  status: CommonStatusEnum.ENABLE,
  sort: undefined,
  remark: undefined
} as any)
const formRules = reactive({
  groupId: [{ required: true, message: '标签组不能为空', trigger: 'change' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FansTagApi.getFansTag(id)
    } finally {
      formLoading.value = false
    }
  } else if (props.groupList?.length > 0) {
    formData.value.groupId = props.groupList[0].id as number
  }
}

defineExpose({ open })

const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  formLoading.value = true
  try {
    const data = formData.value as FansTagApi.FansTagVO
    if (formType.value === 'create') {
      await FansTagApi.createFansTag(data)
      message.success(t('common.createSuccess'))
    } else {
      await FansTagApi.updateFansTag(data)
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
    groupId: undefined,
    name: undefined,
    code: undefined,
    status: CommonStatusEnum.ENABLE,
    sort: undefined,
    remark: undefined
  } as any
  formRef.value?.resetFields()
}
</script>
