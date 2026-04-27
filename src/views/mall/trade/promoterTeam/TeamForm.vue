<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="团队名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入团队名称" clearable />
      </el-form-item>

      <el-form-item label="主管人员" prop="leaderId">
        <el-select
          v-model="formData.leaderId"
          placeholder="请选择主管人员"
          clearable
          filterable
          class="w-full"
        >
          <el-option
            v-for="item in promoterList"
            :key="item.id"
            :label="item.name + ' (' + item.mobile + ')'"
            :value="item.id"
          />
        </el-select>
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

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注信息" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as PromoterApi from '@/api/mall/trade/promoter'

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('新增团队') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const promoterList = ref<any[]>([]) // 推广员列表

const formData = reactive({
  id: undefined,
  name: '',
  leaderId: undefined as number | undefined,
  status: 0,
  remark: ''
})

const formRules = reactive({
  name: [{ required: true, message: '团队名称不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '创建团队' : '编辑团队'
  formType.value = type
  resetForm()

  if (promoterList.value.length === 0) {
    // 简化处理：获取前200个推广员供选择，如有更多建议改用搜索分页
    const res = await PromoterApi.getPromoterPage({ pageNo: 1, pageSize: 200 })
    promoterList.value = res.list || []
  }

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await PromoterApi.getPromoterTeam(id)
      formData.id = data.id
      formData.name = data.name
      formData.leaderId = data.leaderId
      formData.status = data.status ?? 0
      formData.remark = data.remark || ''
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 提交请求
  formLoading.value = true
  try {
    const submitData = {
      id: formData.id,
      name: formData.name,
      leaderId: formData.leaderId,
      status: formData.status,
      remark: formData.remark
    }

    if (formType.value === 'create') {
      await PromoterApi.createPromoterTeam(submitData)
      message.success('创建团队成功')
    } else {
      await PromoterApi.updatePromoterTeam(submitData)
      message.success('修改团队成功')
    }
    
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    leaderId: undefined,
    status: 0,
    remark: ''
  })
  formRef.value?.resetFields()
}
</script>