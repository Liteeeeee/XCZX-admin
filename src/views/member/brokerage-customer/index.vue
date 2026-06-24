<template>
  <doc-alert title="分销客户档案" url="https://doc.iocoder.cn/mall/trade-brokerage/" />

  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="86px"
    >
      <el-form-item label="分销员ID" prop="brokerUserId">
        <el-input
          v-model="queryParams.brokerUserId"
          placeholder="请输入分销员ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="粉丝会员ID" prop="memberId">
        <el-input
          v-model="queryParams.memberId"
          placeholder="请输入粉丝会员ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="userNickname">
        <el-input
          v-model="queryParams.userNickname"
          placeholder="请输入用户昵称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
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
        <el-button
          type="warning"
          plain
          :loading="initAllLoading"
          @click="handleInitAll"
          v-hasPermi="['member:brokerage-customer:update']"
        >
          <Icon icon="ep:refresh" class="mr-5px" /> 批量初始化客户档案
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="档案编号" align="center" prop="id" min-width="100" />
      <el-table-column label="分销员ID" align="center" prop="brokerUserId" min-width="100" />
      <el-table-column label="粉丝会员ID" align="center" prop="memberId" min-width="110" />
      <el-table-column label="用户昵称" align="center" prop="userNickname" min-width="120" />
      <el-table-column label="客户昵称" align="center" prop="customerNickname" min-width="120" />
      <el-table-column label="粉丝手机号" align="center" prop="memberMobile" min-width="120" />
      <el-table-column label="会员等级" align="center" prop="memberLevel" min-width="90" />
      <el-table-column label="注册时间" align="center" prop="registerTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="上次登录时间" align="center" prop="lastLoginTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="上次购买时间" align="center" prop="lastPurchaseTime" :formatter="dateFormatter" min-width="170" />
      <el-table-column label="历史消费金额" align="center" prop="totalConsumeAmount" min-width="110" />
      <el-table-column label="历史消费次数" align="center" prop="totalConsumeCount" min-width="110" />
      <el-table-column label="最后浏览商品" align="center" prop="lastBrowseProductName" min-width="160" />
      <el-table-column label="客户端状态" align="center" prop="clientStatus" min-width="110" />
      <el-table-column label="客户备注" align="center" prop="customerRemark" min-width="160" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="dateFormatter" min-width="170" />
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as BrokerageCustomerApi from '@/api/member/brokerage-customer'

defineOptions({ name: 'MemberBrokerageCustomer' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const initAllLoading = ref(false)
const total = ref(0)
const list = ref<BrokerageCustomerApi.MemberBrokerageCustomerVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  brokerUserId: undefined,
  memberId: undefined,
  userNickname: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await BrokerageCustomerApi.getMemberBrokerageCustomerPage(queryParams)
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

const handleInitAll = async () => {
  try {
    await message.confirm('确认批量初始化客户档案？')
    initAllLoading.value = true
    await BrokerageCustomerApi.initAllMemberBrokerageCustomer()
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {
  } finally {
    initAllLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
