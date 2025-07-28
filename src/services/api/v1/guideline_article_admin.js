import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  // async index({ params }) {
  //   return base.index({
  //     modelName: `guideline_article/${params.guideline_article}/guideline_article_version`,
  //     params: {
  //       ...params,
  //       ...S_Processor.getFactoryParams()
  //     }
  //   })
  // },
  async create({ data }) {
    const res = await base.create({
      modelName: `admin/guideline_version/${data.guideline_version}/guideline_article`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async batch({ params }) {
    return base.create({
      modelName: `admin/guideline_version/${params.guideline_version_id}/batch/guideline_article`,
      data: {
        ...params
      }
    })
  },
  assignItemType(excelData) {
    // 將數字轉成字串，方便之後比對
    const items = excelData.map(row => ({
      id: row[0] !== undefined ? row[0].toString() : "",
      // 如果 parent_id 為 0 或空白，即視為空（頂層）
      parent_id: row[1] && row[1] !== 0 ? row[1].toString() : "",
      name: row[2] || "",
      content: row[3] || ""
    }));
    // 建立一個 Set，蒐集所有項目中出現過的 parent_id（非空白）
    const parentIds = new Set();
    items.forEach(item => {
      if (item.parent_id && item.parent_id.trim() !== "") {
        parentIds.add(item.parent_id);
      }
    });
    // 如果該項目的 id 在 parentIds 中出現，則它被其他項目引用為父項，type 設為 "title"
    // 否則，type 設為 "article"
    items.forEach(item => {
      item.type = parentIds.has(item.id) ? "title" : "article";
    });
    return items;
  },
  assignSequences(data) {
    // 1. 標準化 id 與 parent_id
    data.forEach(item => {
      // 確保 id 為字串
      item.id = item.id ? item.id.toString() : "";
      // 如果 parent_id 為空字串、null 或只包含空白，就視為頂層（設為 null）
      if (!item.parent_id || item.parent_id.toString().trim() === "") {
        item.parent_id = null;
      } else {
        item.parent_id = item.parent_id.toString();
      }
    });
    // 2. 建立 childrenMap，以 parent_id 為 key 將子項目分組
    const childrenMap = {};
    data.forEach(item => {
      const pid = item.parent_id; // 頂層的 pid 為 null
      if (!childrenMap[pid]) {
        childrenMap[pid] = [];
      }
      childrenMap[pid].push(item);
    });
    // 3. (可選) 根據 id 排序同一父層下的項目，確保順序穩定
    Object.keys(childrenMap).forEach(key => {
      childrenMap[key].sort((a, b) => Number(a.id) - Number(b.id));
    });
    // 4. 定義遞迴函式，從父層開始賦予 sequence
    function recAssign(parentId, parentSeq) {
      const children = childrenMap[parentId] || [];
      children.forEach((child, index) => {
        // index+1 為本層順序，以四位數格式
        const orderStr = (index + 1).toString().padStart(4, '0');
        // 如果 parentSeq 為空（頂層），則子項 sequence 為 orderStr；否則為父項 sequence + '-' + orderStr
        child.sequence = parentSeq ? `${parentSeq}-${orderStr}` : orderStr;
        // 遞迴處理該子項的子項，使用 child.id 作為新的父 id，child.sequence 作為新的父 sequence
        recAssign(child.id, child.sequence);
      });
    }
    // 從頂層開始（parent_id 為 null）
    recAssign(null, "");
    return data;
  },
  assignTypes(data) {
    // 取得所有非空的 parent_id
    const parentIds = data
      .map(item => item.parent_id)
      .filter(id => id !== null && id !== "" && id !== undefined);

    data.forEach(item => {
      // 如果該項目的 id 存在於 parentIds 中，表示它作為父項被使用，設定 type 為 "title"
      // 否則設定為 "article"
      if (parentIds.includes(item.id)) {
        item.type = 'title';
      } else {
        item.type = 'article';
      }
    });
    return data;
  },
  wrapContentWithP(content) {
    return `<p style="line-height: 1.5; font-size: 1.125rem;">${content}</p>`;
  },
  formattedImportData(importModels, sequencePayload, batchArticleData, currentFactory) {
    // 假設 excelData 為原始資料，且每一列格式為 [ id, parent_id, name, content ]
    // 你可以依據 index 計算 sequence（例如四位數字格式）
    const mergedData = sequencePayload?.order.map(orderItem => {
      // 在 importModels 中找出對應 id 的資料
      const model = importModels.find(item => item.id === orderItem.id);
      return {
        id: orderItem.id,
        // 父層從 orderItem 的 parentId 取得，此處若 orderItem.parentId 為 null，
        // 就保持 null；若需要從 importModels 取得別的父層值，則根據需求調整
        parent_id: orderItem.parentId,
        // 從 model 取得 name 與 content
        name: model ? model.name : "",
        content: model ? model.content : "",
        // rich_content 如果 importModels 中沒有，可用 content 代替，或預設為空字符串
        rich_content: model ? model.content : "",
        // sequence 使用 orderItem 的 sequence
        sequence: orderItem.sequence,
        // 預設日期與狀態，可根據需求修改
        effect_at: batchArticleData?.effect_at,
        announce_at: batchArticleData?.announce_at,
        guideline_status: batchArticleData?.guideline_status?.id,
      };
    });
    // console.log(JSON.stringify(mergedData, null, 2));
    // type
    const _data1 = this.assignTypes(mergedData);
    // console.log(JSON.stringify(_data1, null, 2));
    return {
      factory: currentFactory?.id,
      guideline: batchArticleData?.guideline_id,
      guideline_version_id: batchArticleData?.guideline_version_id,
      data: _data1
    }
  },
  categorizeEffects(effectsAll) {
    return effectsAll.reduce((result, item) => {
      if (item.role_type === "factory_effects") {
        result.factory_effects.push(item.id);
      } else if (item.role_type === "effects") {
        result.effects.push(item.id);
      }
      return result;
    }, { factory_effects: [], effects: [] });
  },
  formattedForFileStore(attaches) {
    return attaches.map(item => {
      const newItem = {
        file: item.file.id
      };
      if (item.file_version) {
        newItem.file_version = item.file_version.id;
      }
      return newItem;
    });
  },
  formattedForCreate(data) {
    let _data = {
      guideline_version: data?.guideline_version,
      sequence: data?.sequence,
      name: data?.name,
      guideline: data?.guideline,
      parent_article_version: data?.parent_article_version,
      type: data?.type,
      announce_at: data?.announce_at,
      effect_at: data?.effect_at,
      no_text: data?.no_text,
      content: data?.content,
      rich_content: data?.rich_content,
      guideline_status: data?.guideline_status?.id,
      attaches: data?.file_attaches ? this.formattedForFileStore(data.file_attaches) : [],
      factory_effects: data?.effects_all ? this.categorizeEffects(data.effects_all).factory_effects : [],
      effects: data?.effects_all ? this.categorizeEffects(data.effects_all).effects : [],
      act_version_alls: [],
      article_versions: [],
      // 相關內規(要送API的)
      related_guidelines: []
    };
    // 關聯法規(要送API的)
    data?.relatedActsArticles?.forEach(act => {
      // 法規
      if (act.last_version) {
        _data.act_version_alls.push({
          act_id: act.id,
          act_version_id: act.last_version.id
        });
      }
      // 法規
      else if (act.act_id) {
        _data.act_version_alls.push({
          act_id: act.act_id,
          act_version_id: act.act_version_id
        });
      }
      // 法條
      else if (act.article) {
        _data.article_versions.push({
          article_id: act.article.id,
          article_version_id: act.id,
          act_version_id: act.article.act_version.id
        });
      }
      // 法條
      else if (act.article_id) {
        _data.article_versions.push({
          article_id: act.article_id,
          article_version_id: act.article_version_id,
          act_version_id: act.act_version_id
        });
      }
    });
    // 關聯內規(要送API的)
    data?.related_guidelines_articles?.forEach(item => {
      // 最新版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'last_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item.id,
        });
      }
      // 特定版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'specific_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
        });
      }
      if (
        // 最新版本-層級條文
        item.bind_type === 'specific_layer_or_article' &&
        item.bind_version === 'last_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article_id: item?.guideline_article?.id,
        });
      }
      if (
        // 特定版本-層級條文
        item.bind_type === 'specific_layer_or_article' &&
        item.bind_version === 'specific_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article_id: item?.guideline_article?.id,
          guideline_article_version_id: item?.id,
        });
      }
    })
    return _data
  },
}