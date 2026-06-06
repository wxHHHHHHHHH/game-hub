-- ============================================
-- GameHub Seed Data (runs on local profile only)
-- Users are created by DataInitializer.java with proper BCrypt encoding
-- ============================================

-- Sample Videos (INSERT IGNORE)
INSERT IGNORE INTO videos (id, title, description, bilibili_bv, game, thumbnail_url, video_type, uploader_id, likes, created_at) VALUES
(1, 'CS2 五杀翻盘！绝境中的逆天操作',
    '在荒漠迷城这张图上，我们队伍在 12:3 落后的绝境下实现惊天翻盘！\n\n🏆 亮点时刻：\n• 0:45 A点三杀拿下关键局\n• 1:20 残局1v3绝杀\n• 2:10 最后一局五杀收尾',
    'BV1xx411c7mD', 'CS2', 'https://picsum.photos/seed/cs2/640/360', 'BILIBILI', 2, 42, '2024-12-28 20:30:00'),

(2, '幻兽帕鲁联机实况 — 建家第一天就遇到神兽！',
    '团队一起开荒幻兽帕鲁！第一天建家就遇到了一只闪光神兽，全员疯狂大叫 😂',
    'BV1xx411c7mD', '幻兽帕鲁', 'https://picsum.photos/seed/palworld/640/360', 'BILIBILI', 2, 38, '2024-12-25 15:00:00'),

(3, '英雄联盟五黑 — 最搞笑的翻车集锦',
    '说好的认真上分，结果变成了全员翻车现场。\n\n🤡 包含：闪现撞墙、反向大招、以及那个经典的"我先上你跟上"...',
    'BV1xx411c7mD', '英雄联盟', 'https://picsum.photos/seed/lol/640/360', 'BILIBILI', 1, 67, '2024-12-20 10:15:00'),

(4, '致命公司 — 被幽灵追了整整十分钟！',
    '本期致命公司联机，XiaoMing 被幽灵追了整整十分钟。全队笑到无法呼吸，最后全员团灭 😂💀',
    'BV1xx411c7mD', '致命公司', 'https://picsum.photos/seed/lethal/640/360', 'BILIBILI', 2, 25, '2024-12-18 22:00:00'),

(5, 'Valorant 竞技模式 — 新赛季定级赛全记录',
    '新赛季定级赛5场全记录！从青铜到钻石，我们的团队配合正在进化！🎯',
    'BV1xx411c7mD', 'Valorant', 'https://picsum.photos/seed/valorant/640/360', 'BILIBILI', 1, 53, '2024-12-15 18:45:00'),

(6, '年度集锦 — 2024 最精彩的100个瞬间',
    '整理了一整年的搞笑、高光、翻车瞬间。感谢 GameSquad 每一位成员，这一年有你们真好 ❤️\n\n🎵 BGM: Legends Never Die',
    'BV1xx411c7mD', '综合集锦', 'https://picsum.photos/seed/highlight/640/360', 'BILIBILI', 1, 89, '2024-12-31 23:59:00');

-- Sample Comments (INSERT IGNORE)
INSERT IGNORE INTO comments (id, video_id, author, author_id, content, created_at) VALUES
(101, 1, '老张',    2, '这波操作太极限了！最后那个五杀我看了十遍 🔥🔥', '2024-12-29 09:12:00'),
(102, 1, 'Admin',   1, '当时我的心脏都快跳出来了，还好赢了 😂', '2024-12-29 10:30:00'),
(103, 1, '游客',    3, 'cs2的物理引擎真的太舒服了，爆头声音好爽', '2024-12-29 14:55:00'),
(104, 1, '老张',    2, '下周五晚上训练赛一起来！', '2024-12-30 21:42:00'),
(201, 2, 'Admin',   1, '哈哈哈哈建家第一天就遇到神兽是什么运气！', '2024-12-26 11:00:00'),
(202, 2, '老张',    2, '下次我也要一起玩帕鲁！', '2024-12-26 15:30:00'),
(301, 3, '游客',    3, '闪现撞墙那块我反复观看了二十遍，笑死', '2024-12-21 00:15:00'),
(302, 3, '老张',    2, '不是我！那个闪现撞墙绝对不是我！是延迟！', '2024-12-21 08:20:00'),
(303, 3, 'Admin',   1, '解释就是掩饰 😂😂😂', '2024-12-21 09:00:00');
