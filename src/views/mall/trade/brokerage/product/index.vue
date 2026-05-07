<template>
  <!-- 搜索工作栏 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item prop="spuName">
        <el-input
          v-model="queryParams.spuName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <!-- 更新时间在接口中未提供支持，仅做 UI 占位 -->
      <el-form-item prop="updateTime">
        <el-date-picker
          v-model="queryParams.updateTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="更新时间起"
          end-placeholder="更新时间止"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 查询
        </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-5px" /> 重置 </el-button>
        <el-button type="success" plain @click="handleExport" :loading="exportLoading">
          <Icon icon="ep:download" class="mr-5px" /> 导出数据
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品名称" align="center" prop="spuName" min-width="200" />
      <el-table-column label="销售额排名" align="center" prop="salesRank" min-width="120" />
      <!-- 分享次数在接口中不存在，预留空列或用 - 占位 -->
      <el-table-column label="分享次数" align="center" min-width="100">
        <template #default> - </template>
      </el-table-column>
      <el-table-column label="访问人数" align="center" prop="visitCount" min-width="100" />
      <el-table-column label="成交订单" align="center" prop="orderCount" min-width="100" />
      <el-table-column
        label="访问-成交转化率%"
        align="center"
        prop="conversionRate"
        min-width="150"
      >
        <template #default="scope"> {{ scope.row.conversionRate }}% </template>
      </el-table-column>
      <el-table-column label="销售金额" align="center" prop="salesAmount" min-width="120">
        <template #default="scope">
          {{ fenToYuan(scope.row.salesAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="支出佣金" align="center" prop="commissionAmount" min-width="120">
        <template #default="scope">
          {{ fenToYuan(scope.row.commissionAmount) }}
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import * as BrokerageRecordApi from '@/api/mall/trade/brokerage/record'
import { fenToYuan } from '@/utils'

defineOptions({ name: 'BrokerageProductStatistics' })

const message = useMessage()

const loading = ref(true)
const exportLoading = ref(false)
const total = ref(0)
const list = ref<any[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  spuName: undefined,
  updateTime: []
})
const queryFormRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    // 处理参数（去除不支持的参数如 updateTime 避免后端报错）
    const params = {
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
      spuName: queryParams.spuName
    }
    const data = await BrokerageRecordApi.getBrokerageProductStatisticsPage(params)
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

/** 导出按钮操作 */
const handleExport = () => {
  message.warning('导出接口正在开发中，敬请期待')
}

/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>
