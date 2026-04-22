<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="省份" prop="provinceId">
        <el-select
          v-model="queryParams.provinceId"
          placeholder="请选择省份"
          clearable
          @change="handleProvinceChange"
          class="!w-240px"
        >
          <el-option
            v-for="item in provinceList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="城市" prop="cityId">
        <el-select
          v-model="queryParams.cityId"
          placeholder="请选择城市"
          clearable
          :disabled="!queryParams.provinceId"
          class="!w-240px"
        >
          <el-option v-for="item in cityList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
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
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['trade:promoter:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增人员
        </el-button>
        <el-button
          type="warning"
          plain
          @click="openImportForm"
          v-hasPermi="['trade:promoter:import']"
        >
          <Icon icon="ep:upload" class="mr-5px" /> 导入人员
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="手机号" align="center" prop="mobile" />
      <el-table-column label="负责地区" align="center">
        <template #default="scope">
          {{ scope.row.provinceName || '' }} {{ scope.row.cityName || '' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['trade:promoter:update']"
          >
            修改地区/信息
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['trade:promoter:delete']"
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

  <!-- 表单弹窗：添加/修改 -->
  <PromoterForm ref="formRef" @success="getList" />
  <!-- 表单弹窗：导入 -->
  <PromoterImportForm ref="importFormRef" @success="getList" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PromoterApi from '@/api/mall/trade/promoter'
import * as AreaApi from '@/api/system/area'
import PromoterForm from './PromoterForm.vue'
import PromoterImportForm from './PromoterImportForm.vue'

defineOptions({ name: 'Promoter' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  name: undefined,
  mobile: undefined,
  provinceId: undefined as number | undefined,
  cityId: undefined as number | undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单

const areaList = ref<any[]>([]) // 省市树形列表
const provinceList = computed(() => areaList.value)
const cityList = computed(() => {
  const province = areaList.value.find((item) => item.id === queryParams.provinceId)
  return province ? province.children : []
})

const handleProvinceChange = () => {
  queryParams.cityId = undefined
}

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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 导入操作 */
const importFormRef = ref()
const openImportForm = () => {
  importFormRef.value.open()
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await PromoterApi.deletePromoter(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  getList()
  // 加载地区数据
  areaList.value = await AreaApi.getAreaTree()
})
</script>
