<template>
  <ContentWrap title="业绩概览">
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item prop="teamCode">
        <el-select
          v-model="queryParams.teamCode"
          placeholder="请选择团队"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="team in teamList"
            :key="team.teamCode"
            :label="`${team.teamName} (${team.teamCode})`"
            :value="team.teamCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入人员姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="更新时间起"
          end-placeholder="更新时间止"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 查询</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <!-- 暂时留空，等待后端导出接口完善 -->
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出数据
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="团队" align="center" prop="teamCode">
        <template #default="scope">
          {{ getTeamName(scope.row.teamCode) || '无' }}
        </template>
      </el-table-column>
      <el-table-column label="账号状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="手机" align="center" prop="mobile" />
      <el-table-column label="推广人数" align="center" prop="bindCount" />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <!-- 预留操作列 -->
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import * as PromoterApi from '@/api/mall/trade/promoter'

defineOptions({ name: 'PromoterPerformance' })

const message = useMessage()

const loading = ref(true) // 列表的加载中
const exportLoading = ref(false) // 导出的加载中
const total = ref(0) // 列表的总页数
const list = ref<any[]>([]) // 列表的数据
const teamList = ref<any[]>([]) // 团队列表下拉数据

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  teamCode: undefined,
  name: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PromoterApi.getPromoterPage(queryParams)
    list.value = data.list
    total.value = data.total
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
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 获取团队列表 */
const getTeamList = async () => {
  const data = await PromoterApi.getPromoterTeamList()
  teamList.value = data || []
}

/** 根据 teamCode 获取团队名称 */
const getTeamName = (teamCode: string) => {
  if (!teamCode) return ''
  const team = teamList.value.find(item => item.teamCode === teamCode)
  return team ? team.teamName : teamCode
}

/** 导出按钮操作 */
const handleExport = async () => {
  message.warning('导出接口正在开发中，敬请期待')
}

/** 初始化 **/
onMounted(async () => {
  await getTeamList()
  await getList()
})
</script>