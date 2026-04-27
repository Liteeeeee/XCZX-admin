<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="团队编号" prop="teamCode">
        <el-input
          v-model="queryParams.teamCode"
          placeholder="请输入团队编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="团队名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入团队名称"
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
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['trade:promoter-team:create']">
          <Icon icon="ep:plus" class="mr-5px" /> 创建团队
        </el-button>
        <el-button
          type="warning"
          plain
          @click="importFormRef.open()"
          v-hasPermi="['trade:promoter:import']"
        >
          <Icon icon="ep:upload" class="mr-5px" /> 导入团队人员
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="团队编号" align="center" prop="teamCode" />
      <el-table-column label="团队名称" align="center" prop="name" />
      <el-table-column label="团队负责人" align="center" prop="leaderName">
        <template #default="scope">
          <span v-if="scope.row.leaderName">{{ scope.row.leaderName }} ({{ scope.row.leaderMobile }})</span>
          <span v-else class="text-gray-400">无</span>
        </template>
      </el-table-column>
      <el-table-column label="成员数量" align="center" prop="memberCount" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
            v-hasPermi="['trade:promoter-team:update']"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row)"
            v-hasPermi="['trade:promoter-team:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['trade:promoter-team:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <TeamForm ref="formRef" @success="getList" />
  <PromoterImportForm ref="importFormRef" @success="getList" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PromoterApi from '@/api/mall/trade/promoter'
import TeamForm from './TeamForm.vue'
import PromoterImportForm from '../promoter/PromoterImportForm.vue'

defineOptions({ name: 'PromoterTeam' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总条数
const list = ref([]) // 列表数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  teamCode: undefined,
  name: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const importFormRef = ref() // 导入表单 Ref

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PromoterApi.getPromoterTeamPage(queryParams)
    list.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('获取团队列表失败', error)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, row?: any) => {
  formRef.value.open(type, row?.id)
}

/** 修改状态操作 */
const handleStatusChange = async (row: any) => {
  try {
    const text = row.status === 0 ? '启用' : '关闭'
    await message.confirm(`确认要${text}团队"${row.name}"吗?`)
    // 调用更新接口，只更新状态，其他字段保持原样
    await PromoterApi.updatePromoterTeam({
      id: row.id,
      name: row.name,
      status: row.status
    })
    message.success(text + '成功')
  } catch {
    // 异常或取消时，恢复状态
    row.status = row.status === 0 ? 1 : 0
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await PromoterApi.deletePromoterTeam(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  getList()
})
</script>