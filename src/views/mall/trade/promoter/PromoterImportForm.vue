<template>
  <Dialog v-model="dialogVisible" title="推广员导入" width="500">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="模板下载">
        <el-link type="primary" :underline="false" @click="importTemplate">
          点击下载推广员导入模板
        </el-link>
      </el-form-item>
      <el-form-item label="上传文件" prop="fileUrl">
        <UploadFile
          v-model="formData.fileUrl"
          :file-type="['xlsx', 'xls']"
          :limit="1"
          :file-size="10"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNo">
        <el-input v-model="formData.batchNo" placeholder="请输入批次号（可选）" />
      </el-form-item>
      <el-form-item label="导入原因" prop="reason">
        <el-input v-model="formData.reason" placeholder="请输入导入原因（可选）" type="textarea" />
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
import * as PromoterApi from '@/api/mall/trade/promoter'
import { ElMessageBox } from 'element-plus'

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const formRef = ref()

const formData = reactive({
  fileUrl: '',
  batchNo: '',
  reason: ''
})
const formRules = reactive({
  fileUrl: [{ required: true, message: '请上传导入文件', trigger: 'change' }]
})

/** 打开弹窗 */
const open = () => {
  dialogVisible.value = true
  resetForm()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  
  // 提交请求
  formLoading.value = true
  try {
    const res = await PromoterApi.importPromoter(formData)
    // 显示导入结果
    let text = `总行数：${res.totalCount}；成功：${res.successCount}；失败：${res.failCount}。`
    if (res.fileUrl) {
      text += `<br/> <a href="${res.fileUrl}" target="_blank" style="color: #409EFF; text-decoration: underline;">点击下载失败详情</a>`
      ElMessageBox.alert(text, '导入结果', { dangerouslyUseHTMLString: true })
    } else {
      ElMessageBox.alert(text, '导入结果')
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  Object.assign(formData, {
    fileUrl: '',
    batchNo: '',
    reason: ''
  })
  formRef.value?.resetFields()
}

/** 下载模板操作 */
const importTemplate = async () => {
  const res = await PromoterApi.importPromoterTemplate()
  if (res) {
    window.open(res, '_blank')
  }
}
</script>
