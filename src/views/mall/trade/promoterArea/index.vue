<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 刷新列表</el-button>
        <el-button type="primary" plain @click="openForm('create')" v-hasPermi="['trade:promoter:area:add']">
          <Icon icon="ep:plus" class="mr-5px" /> 新增地图管理人员
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="treeList"
      row-key="areaId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      default-expand-all
    >
      <el-table-column label="地区名称" prop="areaName" min-width="150" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="成员数量" align="center" prop="memberCount" />
      <el-table-column label="主管人员" align="center" prop="name">
        <template #default="scope">
          <span v-if="scope.row.name">{{ scope.row.name }} ({{ scope.row.mobile }})</span>
          <span v-else class="text-gray-400">无</span>
        </template>
      </el-table-column>
      <el-table-column label="地区描述" align="center" prop="description" show-overflow-tooltip />
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row)"
            v-hasPermi="['trade:promoter:area:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="success"
            @click="handleStatusChange(scope.row)"
            v-hasPermi="['trade:promoter:area:update']"
          >
            设置状态
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['trade:promoter:area:delete']"
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

  <AreaForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PromoterApi from '@/api/mall/trade/promoter'
import AreaForm from './AreaForm.vue'

defineOptions({ name: 'PromoterArea' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总条数
const list = ref([]) // 原始列表数据
const treeList = ref([]) // 树形列表数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    // 获取推广员负责的地区列表（Leader管理）
    const data = await PromoterApi.getPromoterAreaPage(queryParams)
    list.value = data.list || []
    total.value = data.total || 0
    
    // 构建树形结构：将平铺的地区记录按上下级关系组成树
    treeList.value = buildTree(list.value)
  } catch (error) {
    console.error('获取地区团队列表失败', error)
  } finally {
    loading.value = false
  }
}

// 扁平列表转树状结构，地市级向下延展到区
const buildTree = (dataList: any[]) => {
  const map = new Map()
  
  // 1. 创建所有节点
  dataList.forEach(item => {
    map.set(item.areaId, { 
      ...item, 
      status: item.status ?? 0,
      memberCount: item.memberCount ?? 0,
      description: item.description ?? '',
      children: [] 
    })
  })

  // 2. 确保所有父节点存在（如果数据只返回了区没有市，需要补全市作为父级以便展示树形）
  dataList.forEach(item => {
    if (item.parentId && item.parentId !== 0 && !map.has(item.parentId)) {
      map.set(item.parentId, {
        id: `virtual_${item.parentId}`, // 虚拟ID
        areaId: item.parentId,
        areaName: item.parentName,
        status: 0,
        memberCount: 0,
        description: '',
        children: [],
        isVirtual: true
      })
    }
  })

  const tree: any[] = []
  
  // 3. 构建树：将子节点塞入父节点
  map.forEach(node => {
    if (node.parentId && node.parentId !== 0) {
      const parent = map.get(node.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        tree.push(node)
      }
    } else {
      // 根节点
      tree.push(node)
    }
  })
  
  return tree
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, row?: any) => {
  formRef.value.open(type, row)
}

/** 设置状态 */
const handleStatusChange = async (row: any) => {
  if (row.isVirtual) {
    message.warning('虚拟父级节点，暂不支持设置状态')
    return
  }
  try {
    const newStatus = row.status === 0 ? 1 : 0
    await message.confirm(`确定要将【${row.areaName}】的状态修改为【${newStatus === 0 ? '开启' : '禁用'}】吗？`)
    await PromoterApi.updatePromoterAreaStatus(row.id, newStatus)
    message.success('状态修改成功')
    row.status = newStatus
  } catch {}
}

/** 删除按钮操作 */
const handleDelete = async (id: number | string) => {
  if (typeof id === 'string' && id.startsWith('virtual_')) {
    message.warning('虚拟父节点，无法删除')
    return
  }
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除（注意后端 swagger 有 delete 接口，还有 clear-leader 接口，这里调用 delete）
    await PromoterApi.deletePromoterArea(id as number)
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
