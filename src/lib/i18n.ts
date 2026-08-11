import { useAppData } from "@/context/AppDataContext"
import type { AppSettings } from "./types"

export type Lang = AppSettings["language"]

const dict = {
  // nav
  nav_today: { ko: "오늘", ja: "今日", en: "Today" },
  nav_record: { ko: "기록", ja: "記録", en: "Record" },
  nav_mindset: { ko: "마음가짐", ja: "心がけ", en: "Mindset" },
  nav_project: { ko: "프로젝트", ja: "プロジェクト", en: "Project" },
  nav_settings: { ko: "설정", ja: "設定", en: "Settings" },

  // common
  common_save: { ko: "저장", ja: "保存", en: "Save" },
  common_cancel: { ko: "취소", ja: "キャンセル", en: "Cancel" },
  common_delete: { ko: "삭제", ja: "削除", en: "Delete" },
  common_add: { ko: "추가", ja: "追加", en: "Add" },
  common_none_project: { ko: "일반(없음)", ja: "一般（なし）", en: "General (none)" },
  common_optional: { ko: "(선택)", ja: "（任意）", en: "(optional)" },
  common_daily: { ko: "매일", ja: "毎日", en: "Daily" },
  common_weekdays: { ko: "요일 선택", ja: "曜日を選択", en: "Choose days" },
  common_once: { ko: "오늘만", ja: "今日だけ", en: "Just today" },

  // today
  today_title: { ko: "오늘의 할 일", ja: "今日のタスク", en: "Today's Tasks" },
  today_empty: { ko: "아직 등록한 할 일이 없습니다.", ja: "まだ登録したタスクがありません。", en: "No tasks added yet." },
  today_add_task: { ko: "할 일 추가", ja: "タスクを追加", en: "Add task" },
  today_section_recurring: { ko: "고정 할 일", ja: "固定タスク", en: "Fixed tasks" },
  today_adhoc_section: { ko: "오늘만", ja: "今日だけ", en: "Just today" },
  today_adhoc_empty: {
    ko: "아직 오늘만 할 일이 없습니다.",
    ja: "まだ今日だけのタスクがありません。",
    en: "No one-time tasks yet.",
  },
  today_add_adhoc_aria: {
    ko: "오늘만 할 일 추가",
    ja: "今日だけのタスクを追加",
    en: "Add a one-time task",
  },
  today_reorder_aria: { ko: "순서 변경", ja: "並び替え", en: "Reorder" },
  today_change_icon_aria: { ko: "아이콘 변경", ja: "アイコンを変更", en: "Change icon" },
  today_change_icon_title: { ko: "아이콘 변경", ja: "アイコンを変更", en: "Change icon" },
  today_delete_confirm_title: {
    ko: "할 일을 삭제하시겠습니까?",
    ja: "タスクを削除しますか？",
    en: "Delete this task?",
  },
  today_delete_confirm_body: {
    ko: '"{name}" 항목이 오늘부터 목록에서 사라집니다. 이전 기록은 그대로 남습니다.',
    ja: "「{name}」が今日から一覧から消えます。これまでの記録はそのまま残ります。",
    en: '"{name}" will be removed from today onward. Its past history stays intact.',
  },
  today_summary: { ko: "오늘 {total}개 중 {done}개 완료", ja: "今日 {total}件中 {done}件完了", en: "{done} of {total} done today" },
  today_done_aria: { ko: "완료로 표시", ja: "完了にする", en: "Mark done" },
  today_undone_aria: { ko: "완료 취소", ja: "完了を取り消す", en: "Undo done" },

  // task add sheet
  task_add_title: { ko: "새 할 일 추가", ja: "新しいタスクを追加", en: "Add new task" },
  task_add_name_label: { ko: "이름", ja: "名前", en: "Name" },
  task_add_name_placeholder: { ko: "예: 물 2L 마시기", ja: "例：水 2L 飲む", en: "e.g. Drink 2L water" },
  task_add_icon_label: { ko: "아이콘", ja: "アイコン", en: "Icon" },
  task_add_repeat_label: { ko: "반복", ja: "繰り返し", en: "Repeat" },
  task_add_once_note: {
    ko: "오늘 하루만 존재하는 할 일로 추가됩니다.",
    ja: "今日だけ存在するタスクとして追加されます。",
    en: "This will be added as a one-time task for today only.",
  },
  task_add_project_label: { ko: "연결할 프로젝트", ja: "紐づけるプロジェクト", en: "Linked project" },

  // record
  record_title: { ko: "기록", ja: "記録", en: "Record" },
  record_all_title: { ko: "전체 보기", ja: "すべて表示", en: "Overview" },
  record_mode_all: { ko: "전체", ja: "すべて", en: "All" },
  record_mode_project: { ko: "프로젝트별", ja: "プロジェクト別", en: "By project" },
  record_mode_item: { ko: "고정 항목별", ja: "固定項目別", en: "By fixed task" },
  record_item_deleted_suffix: { ko: " (삭제됨)", ja: "（削除済み）", en: " (deleted)" },
  record_no_projects: { ko: "등록된 프로젝트가 없습니다.", ja: "登録されたプロジェクトがありません。", en: "No projects yet." },
  record_no_tasks: { ko: "등록된 할 일이 없습니다.", ja: "登録されたタスクがありません。", en: "No tasks yet." },
  record_legend_0: { ko: "0%", ja: "0%", en: "0%" },
  record_legend_100: { ko: "100% 전부 완료", ja: "100% すべて完了", en: "100% all done" },
  record_date_done_count: { ko: "{done} / {total} 완료", ja: "{done} / {total} 完了", en: "{done} / {total} done" },
  record_date_empty: { ko: "그날 해당하는 할 일이 없습니다.", ja: "その日に該当するタスクがありません。", en: "No tasks for that day." },
  record_tap_undo: { ko: "탭하여 취소", ja: "タップで取り消し", en: "Tap to undo" },
  record_tap_done: { ko: "탭하여 완료", ja: "タップで完了", en: "Tap to complete" },
  record_toggle_hint: {
    ko: "탭해서 완료 상태를 바로 바꿀 수 있습니다",
    ja: "タップして完了状態をすぐに変更できます",
    en: "Tap to toggle completion right here",
  },
  record_future_add_placeholder: { ko: "예: 치과 예약 전화", ja: "例：歯医者の予約電話", en: "e.g. Call the dentist" },
  record_future_add_note: {
    ko: "여기서 추가한 할 일은 오늘 탭에는 보이지 않고, 그 날짜가 되어야 나타납니다.",
    ja: "ここで追加したタスクは今日タブには表示されず、その日になると表示されます。",
    en: "Tasks added here won't show on Today until that date arrives.",
  },

  // project
  project_title: { ko: "프로젝트", ja: "プロジェクト", en: "Project" },
  project_new: { ko: "+ 새 프로젝트", ja: "+ 新しいプロジェクト", en: "+ New project" },
  project_empty: {
    ko: '아직 프로젝트가 없습니다. "+ 새 프로젝트"로 시작할 수 있습니다.',
    ja: 'まだプロジェクトがありません。「+ 新しいプロジェクト」から始められます。',
    en: 'No projects yet. Start one with "+ New project".',
  },
  project_started: { ko: "시작", ja: "開始", en: "started" },
  project_add_milestone: { ko: "다음 단계 추가", ja: "次のステップを追加", en: "Add next step" },
  project_notes_count: { ko: "메모 {n}개", ja: "メモ {n}件", en: "{n} notes" },
  project_status_done: { ko: "완료", ja: "完了", en: "Done" },
  project_status_done_with_date: { ko: "완료 · {date}", ja: "完了・{date}", en: "Done · {date}" },
  project_status_active: { ko: "진행 중", ja: "進行中", en: "In progress" },
  project_status_todo: { ko: "예정", ja: "予定", en: "Planned" },
  project_status_todo_with_target: { ko: "{target} 예정", ja: "{target}予定", en: "Planned for {target}" },
  project_add_note: { ko: "+ 오늘 메모 추가", ja: "+ 今日のメモを追加", en: "+ Add today's note" },
  project_note_placeholder: {
    ko: "예: 오늘 새로 익힌 것, 궁금한 점",
    ja: "例：今日新しく学んだこと、気になる点",
    en: "e.g. What I learned today, questions I have",
  },
  project_note_save: { ko: "메모 저장", ja: "メモを保存", en: "Save note" },
  project_complete_milestone: { ko: "이 단계를 완료로 표시", ja: "このステップを完了にする", en: "Mark this step done" },

  // project create sheet
  project_create_title: { ko: "새 프로젝트", ja: "新しいプロジェクト", en: "New project" },
  project_create_name_label: { ko: "이름", ja: "名前", en: "Name" },
  project_create_name_placeholder: { ko: "예: 이사 준비", ja: "例：引っ越し準備", en: "e.g. Moving prep" },
  project_create_start_label: { ko: "시작일", ja: "開始日", en: "Start date" },
  project_create_note: {
    ko: "시작일 이후의 단계들을 순서대로 추가하게 됩니다.",
    ja: "開始日以降のステップを順番に追加していきます。",
    en: "You'll add steps in order after the start date.",
  },

  // milestone add sheet
  milestone_add_title: { ko: "다음 단계 추가", ja: "次のステップを追加", en: "Add next step" },
  milestone_add_name_label: { ko: "단계 이름", ja: "ステップ名", en: "Step name" },
  milestone_add_name_placeholder: {
    ko: "예: 모의고사로 중간 점검",
    ja: "例：模擬試験で中間チェック",
    en: "e.g. Mock exam checkpoint",
  },
  milestone_add_target_label: { ko: "예정 시작일", ja: "予定開始日", en: "Target start" },
  milestone_add_target_placeholder: { ko: "예: 9월 초", ja: "例：9月初め", en: "e.g. Early September" },

  // mindset
  mindset_label: { ko: "마음가짐", ja: "心がけ", en: "Mindset" },
  mindset_empty: { ko: "아직 등록한 문구가 없습니다.", ja: "まだ登録した文言がありません。", en: "No phrases added yet." },
  mindset_edit_link: { ko: "설정에서 문구 수정하기", ja: "設定で文言を編集する", en: "Edit phrases in Settings" },
  mindset_popup_hint: { ko: "화면을 탭하면 사라집니다", ja: "画面をタップすると消えます", en: "Tap anywhere to dismiss" },
  mindset_popup_fallback: {
    ko: "오늘도 작게라도 시작해보기.",
    ja: "今日も小さく始めてみる。",
    en: "Start small again today.",
  },

  // settings
  settings_title: { ko: "설정", ja: "設定", en: "Settings" },
  settings_section_display: { ko: "화면", ja: "画面", en: "Display" },
  settings_theme: { ko: "테마", ja: "テーマ", en: "Theme" },
  settings_theme_light: { ko: "라이트", ja: "ライト", en: "Light" },
  settings_theme_system: { ko: "시스템", ja: "システム", en: "System" },
  settings_theme_dark: { ko: "다크", ja: "ダーク", en: "Dark" },
  settings_language: { ko: "언어", ja: "言語", en: "Language" },
  settings_lang_ko: { ko: "한국어", ja: "韓国語", en: "Korean" },
  settings_lang_ja: { ko: "日本語", ja: "日本語", en: "Japanese" },
  settings_lang_en: { ko: "English", ja: "英語", en: "English" },
  settings_section_mindset: { ko: "마음가짐", ja: "心がけ", en: "Mindset" },
  settings_mindset_edit: { ko: "문구 편집", ja: "文言編集", en: "Edit phrases" },
  settings_section_data: { ko: "데이터", ja: "データ", en: "Data" },
  settings_data_export: { ko: "데이터 내보내기", ja: "データをエクスポート", en: "Export data" },
  settings_data_import: { ko: "데이터 가져오기", ja: "データをインポート", en: "Import data" },
  settings_data_reset: { ko: "전체 초기화", ja: "すべて初期化", en: "Reset all data" },
  settings_reset_confirm_title: {
    ko: "정말 전체 초기화하시겠습니까?",
    ja: "本当にすべて初期化しますか？",
    en: "Reset everything?",
  },
  settings_reset_confirm_body: {
    ko: "할 일·기록·프로젝트·마음가짐 문구가 모두 삭제되며 되돌릴 수 없습니다.",
    ja: "タスク・記録・プロジェクト・心がけの文言がすべて削除され、元に戻せません。",
    en: "Tasks, records, projects, and mindset phrases will all be deleted. This can't be undone.",
  },
  settings_reset_confirm_action: { ko: "초기화", ja: "初期化", en: "Reset" },
  settings_import_error: {
    ko: "파일 형식을 알아볼 수 없습니다. 이 앱에서 내보낸 JSON 파일인지 확인해 주세요.",
    ja: "ファイル形式を認識できません。このアプリからエクスポートしたJSONファイルか確認してください。",
    en: "Couldn't read this file. Make sure it's a JSON file exported from this app.",
  },
  settings_import_success: {
    ko: "데이터를 불러왔습니다.",
    ja: "データを読み込みました。",
    en: "Data imported successfully.",
  },
  settings_section_info: { ko: "정보", ja: "情報", en: "Info" },
  settings_install: { ko: "설치 방법", ja: "インストール方法", en: "How to install" },
  settings_install_ios_label: { ko: "아이폰", ja: "iPhone", en: "iPhone" },
  settings_install_ios_body: {
    ko: "공유 버튼(↑)을 눌러 \"홈 화면에 추가\"를 선택하세요.",
    ja: "共有ボタン（↑）をタップして「ホーム画面に追加」を選んでください。",
    en: 'Tap the Share button (↑), then choose "Add to Home Screen".',
  },
  settings_install_android_label: { ko: "안드로이드", ja: "Android", en: "Android" },
  settings_install_android_body: {
    ko: "메뉴(⋮)를 눌러 \"홈 화면에 추가\"를 선택하세요.",
    ja: "メニュー（⋮）をタップして「ホーム画面に追加」を選んでください。",
    en: 'Tap the menu (⋮), then choose "Add to Home Screen".',
  },
  settings_license: { ko: "오픈소스 라이선스", ja: "オープンソースライセンス", en: "Open-source licenses" },
  settings_license_pretendard_desc: { ko: "한글 UI 폰트", ja: "韓国語UIフォント", en: "Korean UI font" },
  settings_license_lucide_desc: { ko: "아이콘", ja: "アイコン", en: "Icons" },
  settings_license_tabler_desc: {
    ko: "아이콘 (농구공 1종)",
    ja: "アイコン（バスケットボール1種）",
    en: "Icons (1 basketball icon)",
  },
  settings_license_vaul_desc: {
    ko: "바텀시트 드래그 동작",
    ja: "ボトムシートのドラッグ操作",
    en: "Bottom sheet drag gesture",
  },
  settings_version: { ko: "버전", ja: "バージョン", en: "Version" },

  // mindset quote settings
  mindset_quotes_title: { ko: "마음가짐 문구", ja: "心がけの文言", en: "Mindset phrases" },
  mindset_quotes_order_section: { ko: "표시 방식", ja: "表示方法", en: "Display order" },
  mindset_quotes_order_label: { ko: "문구가 나오는 순서", ja: "文言が表示される順序", en: "Order phrases appear" },
  mindset_quotes_random: { ko: "랜덤", ja: "ランダム", en: "Random" },
  mindset_quotes_sequential: { ko: "순차", ja: "順番", en: "Sequential" },
  mindset_quotes_list_section: { ko: "문구 목록 ({n}개)", ja: "文言リスト（{n}件）", en: "Phrase list ({n})" },
  mindset_quotes_add_placeholder: {
    ko: "예: 오늘도 작게라도 시작하기",
    ja: "例：今日も小さく始める",
    en: "e.g. Start small today too",
  },
} as const

export type TKey = keyof typeof dict

export function translate(key: TKey, lang: Lang, vars?: Record<string, string | number>): string {
  let s: string = dict[key][lang] ?? dict[key].ko
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}

export function useT() {
  const { data } = useAppData()
  const lang = data.settings.language
  return (key: TKey, vars?: Record<string, string | number>) => translate(key, lang, vars)
}

export function useLang(): Lang {
  const { data } = useAppData()
  return data.settings.language
}
