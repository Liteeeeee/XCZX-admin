<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="卡号" prop="cardNo">
        <el-input
          v-model="queryParams.cardNo"
          placeholder="请输入卡号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNo">
        <el-input
          v-model="queryParams.batchNo"
          placeholder="请输入批次号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="卡类型" prop="cardType">
        <el-input
          v-model="queryParams.cardType"
          placeholder="请输入卡类型"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="渠道码" prop="channelCode">
        <el-input
          v-model="queryParams.channelCode"
          placeholder="请输入渠道码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会员编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入会员编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="item in cardStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="warning"
          plain
          @click="openImportForm()"
          v-hasPermi="['member:oem-card:import']"
        >
          <Icon icon="ep:upload" class="mr-5px" /> 批量导入
        </el-button>
        <el-button
          type="success"
          plain
          @click="openBindForm()"
          v-hasPermi="['member:oem-card:bind']"
        >
          <Icon icon="ep:link" class="mr-5px" /> 手动绑卡
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="卡号" align="center" prop="cardNo" width="180" show-overflow-tooltip />
      <el-table-column label="卡密" align="center" prop="cardSecret" width="180" show-overflow-tooltip />
      <el-table-column label="卡类型" align="center" prop="cardType" width="100" />
      <el-table-column label="渠道码" align="center" prop="channelCode" width="120" />
      <el-table-column label="批次号" align="center" prop="batchNo" width="140" show-overflow-tooltip />
      <el-table-column label="有效天数" align="center" prop="validDays" width="80" />
      <el-table-column label="绑定会员" align="center" width="160">
        <template #default="scope">
          <div v-if="scope.row.userId">
            <div>ID: {{ scope.row.userId }}</div>
            <div v-if="scope.row.nickname" class="text-xs text-gray-500">
              {{ scope.row.nickname }}
              <span v-if="scope.row.mobile">({{ scope.row.mobile }})</span>
            </div>
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template #default="scope">
          <el-tag :type="getCardStatusTagType(scope.row.status)">
            {{ getCardStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定时间" align="center" prop="bindTime" width="170" :formatter="dateFormatter" />
      <el-table-column label="过期时间" align="center" prop="expireTime" width="170" :formatter="dateFormatter" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="170" :formatter="dateFormatter" />
      <el-table-column label="备注" align="center" prop="remark" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openUpdateForm(scope.row.id)"
            v-hasPermi="['member:oem-card:update']"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.status === 2"
            link
            type="success"
            @click="handleUpdateStatus(scope.row, 1)"
            v-hasPermi="['member:oem-card:update-status']"
          >
            启用
          </el-button>
          <el-button
            v-else-if="scope.row.status !== 2"
            link
            type="warning"
            @click="handleUpdateStatus(scope.row, 2)"
            v-hasPermi="['member:oem-card:update-status']"
          >
            停用
          </el-button>
          <el-button
            v-if="scope.row.userId"
            link
            type="info"
            @click="handleUnbind(scope.row.id)"
            v-hasPermi="['member:oem-card:unbind']"
          >
            解绑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['member:oem-card:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <Dialog v-model="updateDialogVisible" title="编辑服务卡" width="600px">
    <el-form
      ref="updateFormRef"
      :model="updateFormData"
      :rules="updateFormRules"
      label-width="100px"
      v-loading="updateFormLoading"
    >
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="updateFormData.cardNo" disabled />
      </el-form-item>
      <el-form-item label="卡类型" prop="cardType">
        <el-input v-model="updateFormData.cardType" placeholder="请输入卡类型" />
      </el-form-item>
      <el-form-item label="渠道码" prop="channelCode">
        <el-input v-model="updateFormData.channelCode" placeholder="请输入渠道码" />
      </el-form-item>
      <el-form-item label="卡密" prop="cardSecret">
        <el-input v-model="updateFormData.cardSecret" placeholder="请输入卡密（兑换码）" />
      </el-form-item>
      <el-form-item label="有效天数" prop="validDays">
        <el-input-number v-model="updateFormData.validDays" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="updateFormData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="updateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitUpdateForm" :loading="updateFormLoading">
        确 定
      </el-button>
    </template>
  </Dialog>

  <Dialog v-model="importDialogVisible" title="批量导入服务卡" width="500px">
    <el-form
      ref="importFormRef"
      :model="importFormData"
      :rules="importFormRules"
      label-width="100px"
      v-loading="importFormLoading"
    >
      <el-form-item label="上传文件" prop="fileUrl">
        <UploadFile
          v-model="importFormData.fileUrl"
          :file-type="['xlsx', 'xls']"
          :limit="1"
          :file-size="10"
        />
      </el-form-item>
      <el-form-item label="批次号" prop="batchNo">
        <el-input v-model="importFormData.batchNo" placeholder="请输入批次号（可选）" />
      </el-form-item>
      <el-form-item label="卡类型" prop="cardType">
        <el-input v-model="importFormData.cardType" placeholder="请输入卡类型（可选）" />
      </el-form-item>
      <el-form-item label="渠道码" prop="channelCode">
        <el-input v-model="importFormData.channelCode" placeholder="请输入渠道码（可选）" />
      </el-form-item>
      <el-form-item label="有效天数" prop="validDays">
        <el-input-number v-model="importFormData.validDays" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="importFormData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注（可选）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="importDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitImportForm" :loading="importFormLoading">
        确 定
      </el-button>
    </template>
  </Dialog>

  <Dialog v-model="bindDialogVisible" title="手动绑卡" width="500px">
    <el-form
      ref="bindFormRef"
      :model="bindFormData"
      :rules="bindFormRules"
      label-width="120px"
      v-loading="bindFormLoading"
    >
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="bindFormData.cardNo" placeholder="请输入卡号，卡号或卡密至少填一个" />
      </el-form-item>
      <el-form-item label="卡密" prop="cardSecret">
        <el-input v-model="bindFormData.cardSecret" placeholder="请输入卡密，卡号或卡密至少填一个" />
      </el-form-item>
      <el-form-item label="会员编号" prop="userId">
        <el-input-number v-model="bindFormData.userId" :min="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="强制转移" prop="force">
        <el-switch v-model="bindFormData.force" />
        <div class="text-xs text-gray-500 mt-5px">
          开启后，若卡已被他人绑定，将转移给指定会员
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="bindDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitBindForm" :loading="bindFormLoading">
        确 定
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as OemCardApi from '@/api/member/oemCard'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'MemberOemCard' })

const message = useMessage()
const { t } = useI18n()

const cardStatusOptions = [
  { label: '未激活', value: 0 },
  { label: '已激活', value: 1 },
  { label: '已停用', value: 2 },
  { label: '已过期', value: 3 }
]
const getCardStatusLabel = (status: number) => {
  const item = cardStatusOptions.find((i) => i.value === status)
  return item ? item.label : '未知'
}
const getCardStatusTagType = (status: number) => {
  const map: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'danger',
    3: 'warning'
  }
  return map[status] || ''
}

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  cardNo: undefined as string | undefined,
  batchNo: undefined as string | undefined,
  cardType: undefined as string | undefined,
  channelCode: undefined as string | undefined,
  userId: undefined as number | undefined,
  status: undefined as number | undefined,
  createTime: undefined as string[] | undefined
})
const queryFormRef = ref()
const checkedIds = ref<number[]>([])

const getList = async () => {
  loading.value = true
  try {
    const data = await OemCardApi.getOemCardPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const handleSelectionChange = (rows: any[]) => {
  checkedIds.value = rows.map((row) => row.id)
}

// ===== 编辑服务卡 =====
const updateDialogVisible = ref(false)
const updateFormLoading = ref(false)
const updateFormRef = ref<FormInstance>()
const updateFormData = reactive({
  id: 0,
  cardNo: '',
  cardType: '',
  channelCode: '',
  cardSecret: '',
  validDays: 0,
  remark: ''
})
const updateFormRules: FormRules = {
  cardSecret: [{ required: true, message: '卡密不能为空', trigger: 'blur' }],
  validDays: [{ required: true, message: '有效天数不能为空', trigger: 'change' }]
}
const openUpdateForm = async (id: number) => {
  updateFormLoading.value = true
  try {
    const data = await OemCardApi.getOemCard(id)
    Object.assign(updateFormData, {
      id: data.id,
      cardNo: data.cardNo,
      cardType: data.cardType || '',
      channelCode: data.channelCode || '',
      cardSecret: data.cardSecret || '',
      validDays: data.validDays ?? 0,
      remark: data.remark || ''
    })
    updateDialogVisible.value = true
  } finally {
    updateFormLoading.value = false
  }
}
const submitUpdateForm = async () => {
  if (!updateFormRef.value) return
  const valid = await updateFormRef.value.validate().catch(() => false)
  if (!valid) return
  updateFormLoading.value = true
  try {
    await OemCardApi.updateOemCard({
      id: updateFormData.id,
      cardType: updateFormData.cardType,
      channelCode: updateFormData.channelCode,
      cardSecret: updateFormData.cardSecret,
      validDays: updateFormData.validDays,
      remark: updateFormData.remark
    })
    message.success('修改成功')
    updateDialogVisible.value = false
    await getList()
  } finally {
    updateFormLoading.value = false
  }
}

// ===== 批量导入 =====
const importDialogVisible = ref(false)
const importFormLoading = ref(false)
const importFormRef = ref<FormInstance>()
const importFormData = reactive({
  fileUrl: '',
  batchNo: '',
  cardType: '',
  channelCode: '',
  validDays: 0,
  remark: ''
})
const importFormRules: FormRules = {
  fileUrl: [{ required: true, message: '请上传导入文件', trigger: 'change' }]
}
const openImportForm = () => {
  Object.assign(importFormData, {
    fileUrl: '',
    batchNo: '',
    cardType: '',
    channelCode: '',
    validDays: 0,
    remark: ''
  })
  importDialogVisible.value = true
}
const submitImportForm = async () => {
  if (!importFormRef.value) return
  const valid = await importFormRef.value.validate().catch(() => false)
  if (!valid) return
  importFormLoading.value = true
  try {
    const res = await OemCardApi.importOemCard({
      fileUrl: importFormData.fileUrl,
      batchNo: importFormData.batchNo || undefined,
      cardType: importFormData.cardType || undefined,
      channelCode: importFormData.channelCode || undefined,
      validDays: importFormData.validDays,
      remark: importFormData.remark || undefined
    })
    let text = `导入完成`
    if (res && typeof res === 'object') {
      if (res.totalCount !== undefined) {
        text = `总行数：${res.totalCount}；成功：${res.successCount}；失败：${res.failCount}。`
      }
      if (res.fileUrl) {
        text += `<br/> <a href="${res.fileUrl}" target="_blank" style="color: #409EFF; text-decoration: underline;">点击下载失败详情</a>`
      }
    }
    ElMessageBox.alert(text, '导入结果', { dangerouslyUseHTMLString: true })
    importDialogVisible.value = false
    await getList()
  } finally {
    importFormLoading.value = false
  }
}

// ===== 手动绑卡 =====
const bindDialogVisible = ref(false)
const bindFormLoading = ref(false)
const bindFormRef = ref<FormInstance>()
const bindFormData = reactive({
  cardNo: '',
  cardSecret: '',
  userId: 0,
  force: false
})
const bindFormRules: FormRules = {
  userId: [{ required: true, message: '请输入会员编号', trigger: 'change' }]
}
const openBindForm = () => {
  Object.assign(bindFormData, {
    cardNo: '',
    cardSecret: '',
    userId: 0,
    force: false
  })
  bindDialogVisible.value = true
}
const submitBindForm = async () => {
  if (!bindFormRef.value) return
  if (!bindFormData.cardNo && !bindFormData.cardSecret) {
    message.warning('卡号和卡密至少填写一个')
    return
  }
  const valid = await bindFormRef.value.validate().catch(() => false)
  if (!valid) return
  bindFormLoading.value = true
  try {
    await OemCardApi.bindOemCard({
      cardNo: bindFormData.cardNo || undefined,
      cardSecret: bindFormData.cardSecret || undefined,
      userId: bindFormData.userId,
      force: bindFormData.force
    })
    message.success('绑卡成功')
    bindDialogVisible.value = false
    await getList()
  } finally {
    bindFormLoading.value = false
  }
}

// ===== 启用/停用 =====
const handleUpdateStatus = async (row: any, status: number) => {
  try {
    const action = status === 2 ? '停用' : '启用'
    await message.confirm(`确认要${action}卡号为「${row.cardNo}」的服务卡吗？`)
    await OemCardApi.updateOemCardStatus({ id: row.id, status })
    message.success(`${action}成功`)
    await getList()
  } catch {}
}

// ===== 解绑 =====
const handleUnbind = async (id: number) => {
  try {
    await message.confirm('确认要解绑该服务卡吗？解绑后卡片将回到未激活状态，可再次绑定。')
    await OemCardApi.unbindOemCard({ id })
    message.success('解绑成功')
    await getList()
  } catch {}
}

// ===== 删除 =====
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await OemCardApi.deleteOemCard(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
