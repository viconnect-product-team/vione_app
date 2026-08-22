// Additional locales: Myanmar (my), Khmer (km), Lao (lo).
//
// The canonical dictionary in `i18n.ts` stays vi + en. These locales are
// *overlays*: any key not present here falls back to English, so the app is
// never broken or half-empty for a new language. Add keys here incrementally
// as translations are reviewed.

import type { TKey } from "./i18n";

export type ExtraLang = "my" | "km" | "lo";

export type LocaleOverlay = Partial<Record<TKey, string>>;

const my: LocaleOverlay = {
  // Navigation
  "bc.mobile.nav.label": "အဓိက လမ်းညွှန်",
  "bc.mobile.nav.home": "ပင်မ",
  "bc.mobile.nav.network": "ကွန်ရက်",
  "bc.mobile.nav.community": "အသိုက်အဝန်း",
  "bc.mobile.nav.me": "ကျွန်ုပ်",
  "bc.mobile.v.open": "V အမြန်လုပ်ဆောင်ချက်များ ဖွင့်ရန်",

  // Sign in
  "bc.mobile.auth.welcome": "ပြန်လည်ကြိုဆိုပါသည်",
  "bc.mobile.auth.subtitle": "ကွန်ရက်ချိတ်ဆက်မှုကို ဆက်လက်တိုးချဲ့ရန် ဝင်ရောက်ပါ။",
  "bc.mobile.auth.google": "Google ဖြင့် ဆက်လက်လုပ်ဆောင်ရန်",
  "bc.mobile.auth.apple": "Apple ဖြင့် ဆက်လက်လုပ်ဆောင်ရန်",
  "bc.mobile.auth.or": "သို့မဟုတ်",
  "bc.mobile.auth.emailLabel": "အီးမေးလ် သို့မဟုတ် ဖုန်းနံပါတ်",
  "bc.mobile.auth.emailPlaceholder": "အီးမေးလ် သို့မဟုတ် ဖုန်းနံပါတ် ထည့်ပါ",
  "bc.mobile.auth.passwordLabel": "စကားဝှက်",
  "bc.mobile.auth.passwordPlaceholder": "စကားဝှက် ထည့်ပါ",
  "bc.mobile.auth.showPassword": "စကားဝှက် ပြရန်",
  "bc.mobile.auth.hidePassword": "စကားဝှက် ဖျောက်ရန်",
  "bc.mobile.auth.remember": "မှတ်ထားပါ",
  "bc.mobile.auth.forgot": "စကားဝှက် မေ့နေပါသလား?",
  "bc.mobile.auth.signIn": "ဝင်ရောက်ရန်",
  "bc.mobile.auth.processing": "လုပ်ဆောင်နေသည်...",
  "bc.mobile.auth.noAccount": "အကောင့် မရှိသေးဘူးလား?",
  "bc.mobile.auth.retry": "ထပ်စမ်းရန်",
  "bc.mobile.auth.language": "ဘာသာစကား",
};

const km: LocaleOverlay = {
  "bc.mobile.nav.label": "ការរុករកចម្បង",
  "bc.mobile.nav.home": "ទំព័រដើម",
  "bc.mobile.nav.network": "បណ្ដាញ",
  "bc.mobile.nav.community": "សហគមន៍",
  "bc.mobile.nav.me": "ខ្ញុំ",
  "bc.mobile.v.open": "បើកសកម្មភាពរហ័ស V",

  "bc.mobile.auth.welcome": "សូមស្វាគមន៍ការត្រឡប់មកវិញ",
  "bc.mobile.auth.subtitle": "ចូលគណនី ដើម្បីបន្តភ្ជាប់ និងពង្រីកបណ្ដាញរបស់អ្នក។",
  "bc.mobile.auth.google": "បន្តជាមួយ Google",
  "bc.mobile.auth.apple": "បន្តជាមួយ Apple",
  "bc.mobile.auth.or": "ឬ",
  "bc.mobile.auth.emailLabel": "អ៊ីមែល ឬលេខទូរស័ព្ទ",
  "bc.mobile.auth.emailPlaceholder": "បញ្ចូលអ៊ីមែល ឬលេខទូរស័ព្ទ",
  "bc.mobile.auth.passwordLabel": "ពាក្យសម្ងាត់",
  "bc.mobile.auth.passwordPlaceholder": "បញ្ចូលពាក្យសម្ងាត់",
  "bc.mobile.auth.showPassword": "បង្ហាញពាក្យសម្ងាត់",
  "bc.mobile.auth.hidePassword": "លាក់ពាក្យសម្ងាត់",
  "bc.mobile.auth.remember": "ចងចាំខ្ញុំ",
  "bc.mobile.auth.forgot": "ភ្លេចពាក្យសម្ងាត់?",
  "bc.mobile.auth.signIn": "ចូលគណនី",
  "bc.mobile.auth.processing": "កំពុងដំណើរការ...",
  "bc.mobile.auth.noAccount": "មិនទាន់មានគណនី?",
  "bc.mobile.auth.retry": "ព្យាយាមម្ដងទៀត",
  "bc.mobile.auth.language": "ភាសា",
};

const lo: LocaleOverlay = {
  "bc.mobile.nav.label": "ການນຳທາງຫຼັກ",
  "bc.mobile.nav.home": "ໜ້າຫຼັກ",
  "bc.mobile.nav.network": "ເຄືອຂ່າຍ",
  "bc.mobile.nav.community": "ຊຸມຊົນ",
  "bc.mobile.nav.me": "ຂ້ອຍ",
  "bc.mobile.v.open": "ເປີດການດຳເນີນການດ່ວນ V",

  "bc.mobile.auth.welcome": "ຍິນດີຕ້ອນຮັບກັບມາ",
  "bc.mobile.auth.subtitle": "ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່ເຊື່ອມຕໍ່ ແລະ ຂະຫຍາຍເຄືອຂ່າຍຂອງທ່ານ.",
  "bc.mobile.auth.google": "ສືບຕໍ່ດ້ວຍ Google",
  "bc.mobile.auth.apple": "ສືບຕໍ່ດ້ວຍ Apple",
  "bc.mobile.auth.or": "ຫຼື",
  "bc.mobile.auth.emailLabel": "ອີເມວ ຫຼື ເບີໂທລະສັບ",
  "bc.mobile.auth.emailPlaceholder": "ໃສ່ອີເມວ ຫຼື ເບີໂທລະສັບ",
  "bc.mobile.auth.passwordLabel": "ລະຫັດຜ່ານ",
  "bc.mobile.auth.passwordPlaceholder": "ໃສ່ລະຫັດຜ່ານ",
  "bc.mobile.auth.showPassword": "ສະແດງລະຫັດຜ່ານ",
  "bc.mobile.auth.hidePassword": "ເຊື່ອງລະຫັດຜ່ານ",
  "bc.mobile.auth.remember": "ຈື່ຂ້ອຍໄວ້",
  "bc.mobile.auth.forgot": "ລືມລະຫັດຜ່ານ?",
  "bc.mobile.auth.signIn": "ເຂົ້າສູ່ລະບົບ",
  "bc.mobile.auth.processing": "ກຳລັງດຳເນີນການ...",
  "bc.mobile.auth.noAccount": "ຍັງບໍ່ມີບັນຊີ?",
  "bc.mobile.auth.retry": "ລອງໃໝ່",
  "bc.mobile.auth.language": "ພາສາ",
};

export const localeOverlays: Record<ExtraLang, LocaleOverlay> = { my, km, lo };

export const EXTRA_LANG_LOCALES: Record<ExtraLang, string> = {
  my: "my-MM",
  km: "km-KH",
  lo: "lo-LA",
};
