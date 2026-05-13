<template>
  <doc-alert title="【交易】分销返佣" url="https://doc.iocoder.cn/mall/trade-brokerage/" />

  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="唯一编码" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入唯一编码"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择状态">
          <el-option :value="CommonStatusEnum.ENABLE" label="启用" />
          <el-option :value="CommonStatusEnum.DISABLE" label="禁用" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          v-hasPermi="['trade:brokerage-withdraw-config:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="编号" prop="id" width="80px" />
      <el-table-column align="center" label="唯一编码" prop="code" min-width="160px" />
      <el-table-column align="center" label="提现金额范围" min-width="180px">
        <template #default="scope">
          <div>最低：￥{{ fenToYuan(scope.row.withdrawMinPrice || 0) }}</div>
          <div>最高：￥{{ fenToYuan(scope.row.withdrawMaxPrice || 0) }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提现费率(%)" prop="withdrawFeeRate" min-width="120px">
        <template #default="scope">{{ formatFeeRate(scope.row.withdrawFeeRate) }}</template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status" width="90px">
        <template #default="scope">
          <el-tag v-if="scope.row.status === CommonStatusEnum.ENABLE" type="success">启用</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="90px" />
      <el-table-column align="center" label="备注" prop="remark" min-width="160px" />
      <el-table-column
        align="center"
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column align="center" fixed="right" label="操作" width="90px">
        <template #default="scope">
          <el-button
            v-hasPermi="['trade:brokerage-withdraw-config:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <BrokerageWithdrawConfigForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { fenToYuan } from '@/utils'
import * as BrokerageWithdrawConfigApi from '@/api/mall/trade/brokerage/withdrawConfig'
import BrokerageWithdrawConfigForm from './BrokerageWithdrawConfigForm.vue'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({ name: 'TradeBrokerageWithdrawConfig' })

const loading = ref(true)
const total = ref(0)
const list = ref<BrokerageWithdrawConfigApi.BrokerageWithdrawConfigVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: undefined as string | undefined,
  status: undefined as number | undefined
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await BrokerageWithdrawConfigApi.getBrokerageWithdrawConfigPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = async () => {
  queryParams.pageNo = 1
  await getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  queryParams.code = undefined
  queryParams.status = undefined
  getList()
}

const formatFeeRate = (rate?: number) => {
  if (rate == null) return '-'
  if (Number.isNaN(Number(rate))) return '-'
  return Number(rate).toFixed(1)
}

const formRef = ref()
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value?.open(type, id)
}

onMounted(async () => {
  await getList()
})
</script>
