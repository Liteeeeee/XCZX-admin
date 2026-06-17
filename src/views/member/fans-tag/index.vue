<template>
  <doc-alert title="粉丝标签" url="https://doc.iocoder.cn/member/user/" />

  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="标签组" prop="groupId">
        <el-select v-model="queryParams.groupId" placeholder="请选择标签组" clearable class="!w-240px">
          <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标签名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入标签名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="标签编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入标签编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openForm('create')" v-hasPermi="['member:fans-tag:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" min-width="80" />
      <el-table-column label="标签组" align="center" prop="groupId" min-width="120">
        <template #default="scope">
          {{ getGroupName(scope.row.groupId) }}
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" prop="name" min-width="120" />
      <el-table-column label="编码" align="center" prop="code" min-width="140" />
      <el-table-column label="状态" align="center" prop="status" min-width="80">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" min-width="80" />
      <el-table-column label="备注" align="center" prop="remark" min-width="160" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        min-width="170"
      />
      <el-table-column label="操作" align="center" width="150px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['member:fans-tag:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['member:fans-tag:delete']"
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

  <FansTagForm ref="formRef" :group-list="groupList" @success="getList" />
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as FansTagApi from '@/api/member/fans-tag'
import * as FansTagGroupApi from '@/api/member/fans-tag-group'
import FansTagForm from './FansTagForm.vue'

defineOptions({ name: 'MemberFansTag' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref<any[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  groupId: undefined,
  name: undefined,
  code: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref()

const groupList = ref<FansTagGroupApi.FansTagGroupVO[]>([])

const getGroupName = (groupId?: number) => {
  if (!groupId) return ''
  return groupList.value.find((g) => g.id === groupId)?.name ?? String(groupId)
}

const getList = async () => {
  loading.value = true
  try {
    const data = await FansTagApi.getFansTagPage(queryParams)
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
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref<InstanceType<typeof FansTagForm> | null>(null)
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value?.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await FansTagApi.deleteFansTag(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  try {
    groupList.value = await FansTagGroupApi.getSimpleFansTagGroupList()
  } finally {
    await getList()
  }
})
</script>
