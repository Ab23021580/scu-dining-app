import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import ws from 'ws';

globalThis.WebSocket = ws;

// 載入 .env 變數
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 請確認 .env 檔案中有 PUBLIC_SUPABASE_URL 和 PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 模擬爬蟲爬取到的東吳大學兩校區資料
const crawledData = {
  campuses: [
    { id: 'waishuangxi', name: '外雙溪校區', name_en: 'Waishuangxi' },
    { id: 'chungcheng', name: '城中校區', name_en: 'Chungcheng' }
  ],
  categories: [
    { id: 'noodles', name: '麵食', icon: 'ramen_dining', emoji: '🍜' },
    { id: 'drinks', name: '飲品', icon: 'local_cafe', emoji: '🧋' },
    { id: 'snacks', name: '小吃', icon: 'fastfood', emoji: '🥟' }
  ],
  restaurants: [
    {
      id: 'r-canteen-1',
      campus_id: 'waishuangxi',
      name: '第一餐廳',
      description: '提供傳統台式便當、多款麵食與湯品',
      image_url: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d',
      is_open: true,
      rating: 4.5,
      review_count: 328,
      prep_time_min: 10,
      address: '外雙溪校區 學生活動中心 1F'
    },
    {
      id: 'r-b1-food',
      campus_id: 'chungcheng',
      name: '六大樓地下室美食街',
      description: '城中校區最大美食廣場，提供各式料理',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      is_open: true,
      rating: 4.4,
      review_count: 412,
      prep_time_min: 12,
      address: '城中校區 六大樓 B1'
    }
  ],
  menuItems: [
    {
      id: 'm-beef-noodle',
      restaurant_id: 'r-canteen-1',
      category_id: 'noodles',
      name: '招牌麻辣牛肉麵',
      description: '慢火熬煮濃郁高湯，搭配軟嫩牛腱',
      price: 120,
      image_url: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d',
      is_available: true,
      prep_time_min: 10,
      rating: 4.8,
      review_count: 124,
      customizations: [
        { id: 'spicy', label: '辣度', options: ['不辣', '小辣', '中辣'], defaultValue: '小辣' }
      ]
    }
  ]
};

async function uploadToSupabase() {
  console.log('🚀 開始將資料存入 Supabase...');

  // 1. 寫入校區
  const { error: campusErr } = await supabase.from('campuses').upsert(crawledData.campuses);
  if (campusErr) console.error('寫入校區失敗:', campusErr);
  else console.log('✅ 校區資料寫入成功');

  // 2. 寫入分類
  const { error: catErr } = await supabase.from('categories').upsert(crawledData.categories);
  if (catErr) console.error('寫入分類失敗:', catErr);
  else console.log('✅ 分類資料寫入成功');

  // 3. 寫入餐廳
  const { error: restErr } = await supabase.from('restaurants').upsert(crawledData.restaurants);
  if (restErr) console.error('寫入餐廳失敗:', restErr);
  else console.log('✅ 餐廳資料寫入成功');

  // 4. 寫入菜單
  const { error: menuErr } = await supabase.from('menu_items').upsert(crawledData.menuItems);
  if (menuErr) console.error('寫入菜單失敗:', menuErr);
  else console.log('✅ 菜單資料寫入成功');

  console.log('🎉 所有資料已成功儲存至 Supabase！');
}

uploadToSupabase();
