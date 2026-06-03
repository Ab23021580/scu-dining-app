import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import ws from 'ws';

globalThis.WebSocket = ws;
dotenv.config();

// 初始化 Supabase
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 找不到 Supabase 憑證，請檢查 .env 檔案');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_API = 'https://dummyjson.com/recipes?limit=20'; // 網路公開的美食 API
const CAMPUS_ID = 'waishuangxi'; 
const RESTAURANT_ID = `rest-${randomUUID().slice(0, 8)}`; 

async function scrapePublicData() {
  console.log(`啟動爬蟲，準備前往網路公開資料庫：${TARGET_API}`);
  
  try {
    const response = await fetch(TARGET_API);
    const data = await response.json();
    
    console.log(`網頁載入完成！`);
    
    const items = data.recipes.map(recipe => {
      // 擷取菜色名稱、描述(用食材拼湊)、圖片與價格(隨機生成價格)
      return {
        categoryName: recipe.mealType[0] || '特色料理',
        itemName: recipe.name,
        price: Math.floor(Math.random() * 150) + 50, // 產生 50~200 的價格
        description: `嚴選食材：${recipe.ingredients.slice(0, 3).join('、')}。`,
        imageUrl: recipe.image,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        prepTimeMin: recipe.prepTimeMinutes
      };
    });

    return {
      name: '城中學餐 - 異國料理部',
      items: items
    };

  } catch (error) {
    console.error('爬取過程中發生錯誤：', error);
    return null;
  }
}

async function saveToSupabase(data) {
  if (!data || data.items.length === 0) {
    console.log('沒有資料可以儲存。');
    return;
  }

  console.log('開始將爬取到的資料存入 Supabase...');

  // 1. 確保校區存在
  await supabase.from('campuses').upsert([
    { id: 'waishuangxi', name: '外雙溪校區', name_en: 'Waishuangxi' },
    { id: 'chungcheng', name: '城中校區', name_en: 'Chungcheng' }
  ]);

  const CURRENT_CAMPUS_ID = 'chungcheng'; // 強制指定為城中校區

  // 2. 建立新餐廳
  const { error: restErr } = await supabase.from('restaurants').upsert({
    id: RESTAURANT_ID,
    campus_id: CURRENT_CAMPUS_ID,
    name: data.name,
    description: '引進多國特色料理，滿足同學們挑剔的味蕾。',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    is_open: true,
    rating: 4.8,
    review_count: 120,
    prep_time_min: 15,
    address: '城中校區 六大樓 B1'
  });

  if (restErr) {
    console.error('儲存餐廳失敗：', restErr);
    return;
  }

  // 3. 處理分類與餐點
  const menuItemsToInsert = [];
  const uniqueCategories = [...new Set(data.items.map(item => item.categoryName))];
  
  for (const catName of uniqueCategories) {
    const catId = `cat-${randomUUID().slice(0, 6)}`;
    
    await supabase.from('categories').upsert({
      id: catId,
      name: catName,
      icon: 'restaurant',
      emoji: '🌍'
    });

    const itemsInCat = data.items.filter(item => item.categoryName === catName);
    for (const item of itemsInCat) {
      menuItemsToInsert.push({
        id: `m-${randomUUID().slice(0, 8)}`,
        restaurant_id: RESTAURANT_ID,
        category_id: catId,
        name: item.itemName,
        description: item.description,
        price: item.price,
        image_url: item.imageUrl,
        is_available: true,
        rating: item.rating,
        review_count: item.reviewCount,
        prep_time_min: item.prepTimeMin
      });
    }
  }

  // 4. 批次寫入所有餐點
  const { error: menuErr } = await supabase.from('menu_items').upsert(menuItemsToInsert);
  
  if (menuErr) {
    console.error('儲存菜單失敗：', menuErr);
  } else {
    console.log(`✅ 成功寫入餐廳「${data.name}」以及 ${menuItemsToInsert.length} 筆真實餐點至 Supabase！`);
  }
}

// 執行主流程
(async () => {
  const scrapedData = await scrapePublicData();
  await saveToSupabase(scrapedData);
})();
