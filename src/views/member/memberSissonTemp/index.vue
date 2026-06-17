<template>
  <el-tabs v-model="activeTab">
    <el-tab-pane label="话术模板" name="wording">
      <ContentWrap>
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="话术名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入话术名称"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="话术编码" prop="code">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入话术编码"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="分类编码" prop="categoryCode">
            <el-input
              v-model="queryParams.categoryCode"
              placeholder="请输入分类编码"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="类型编码" prop="typeCode">
            <el-input
              v-model="queryParams.typeCode"
              placeholder="请输入类型编码"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              class="!w-240px"
            >
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
            <el-button @click="handleQuery"
              ><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button
            >
            <el-button @click="resetQuery"
              ><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button
            >
            <el-button
              type="primary"
              @click="openForm('create')"
              v-hasPermi="['member:wording:create']"
            >
              <Icon icon="ep:plus" class="mr-5px" /> 新增
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>

      <ContentWrap>
        <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
          <el-table-column label="编号" align="center" prop="id" width="120px" />
          <el-table-column label="话术名称" align="center" prop="name" min-width="160" />
          <el-table-column label="话术编码" align="center" prop="code" min-width="160" />
          <el-table-column label="分类" align="center" prop="categoryName" min-width="140" />
          <el-table-column label="类型" align="center" prop="typeName" min-width="120" />
          <el-table-column label="模板编码" align="center" prop="templateCode" min-width="160" />
          <el-table-column label="每日上限" align="center" prop="dailyLimit" width="90px" />
          <el-table-column label="涉及商品" align="center" prop="requireProduct" width="90px">
            <template #default="scope">
              <el-tag :type="scope.row.requireProduct ? 'success' : 'info'">
                {{ scope.row.requireProduct ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="涉及优惠券" align="center" prop="requireCoupon" width="100px">
            <template #default="scope">
              <el-tag :type="scope.row.requireCoupon ? 'success' : 'info'">
                {{ scope.row.requireCoupon ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" width="80px">
            <template #default="scope">
              <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            :formatter="dateFormatter"
            width="180px"
          />
          <el-table-column label="操作" align="center" width="150px" fixed="right">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="openForm('update', scope.row.id)"
                v-hasPermi="['member:wording:update']"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
                v-hasPermi="['member:wording:delete']"
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

      <MemberWordingForm ref="formRef" @success="getList" />
    </el-tab-pane>

    <el-tab-pane label="话术分类" name="category" lazy>
      <MemberWordingCategoryList />
    </el-tab-pane>

    <el-tab-pane label="话术类型" name="type" lazy>
      <MemberWordingTypeList />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as WordingApi from '@/api/member/wording'
import MemberWordingForm from './MemberWordingForm.vue'
import MemberWordingCategoryList from './MemberWordingCategoryList.vue'
import MemberWordingTypeList from './MemberWordingTypeList.vue'

defineOptions({ name: 'MemberSissonTemp' })

const message = useMessage()
const { t } = useI18n()

const activeTab = ref<'wording' | 'category' | 'type'>('wording')

const loading = ref(true)
const total = ref(0)
const list = ref<WordingApi.MemberWordingVO[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  code: undefined,
  categoryCode: undefined,
  typeCode: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await WordingApi.getMemberWordingPage(queryParams)
    list.value = data.list || []
    total.value = data.total || 0
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

const formRef = ref()
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await WordingApi.deleteMemberWording(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
