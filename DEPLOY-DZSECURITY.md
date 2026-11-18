# نشر الموقع على DZSecurity تلقائيًا (GitHub ← DZSecurity)

الفكرة: **مجلد واحد (هذا المشروع) على GitHub**. عند كل تعديل (من لوحة `/admin` أو من الكمبيوتر) يبني GitHub الموقع ويرفعه بالـ FTP إلى DZSecurity. لا حاجة لرفع أي ملفات يدويًا ولا لمجلد «A».

## 1) رفع المشروع إلى GitHub (مرة واحدة)
ارفع **محتويات** هذا المجلد إلى المستودع `chababELihsan/chabab-el-ihssan` (فرع `main`). تأكد أن `package.json` و`src` و`.github/workflows/deploy-dzsecurity.yml` في جذر المستودع (المجلد `.github` يبدأ بنقطة، وإلا لن يعمل النشر التلقائي). لا ترفع `node_modules` ولا `dist`.

## 2) بيانات FTP من cPanel
cPanel ← **حسابات FTP** (FTP Accounts) ← أنشئ حسابًا أو استعمل الرئيسي، وسجّل: الخادم (Host)، اسم المستخدم، كلمة السر.

## 3) إضافتها في GitHub
المستودع ← Settings ← Secrets and variables ← Actions:
- تبويب **Secrets**: `FTP_SERVER` و`FTP_USERNAME` و`FTP_PASSWORD`.
- تبويب **Variables** (اختياري):
  - `SITE_URL` = دومينك الحقيقي، مثل `https://exemple.dz` (يظهر في sitemap والمشاركة). أو غيّر `site_url` من «إعدادات الموقع» في `/admin`.
  - `FTP_DIR` = مجلد الموقع على الخادم إن لم يكن `public_html/`.
  - `FTP_PROTOCOL`: الافتراضي الآن `ftps` (مشفّر)؛ إن فشل الاتصال ضع `ftp` مؤقتًا.

## 4) التشغيل
تبويب **Actions** ← «Deploy to DZSecurity» ← Run workflow. بعد دقيقة أو دقيقتين يظهر الموقع. وبعدها يتحدث تلقائيًا عند كل «حفظ ونشر» في `/admin`.

## 5) الدخول إلى `/admin` على DZSecurity (زر «الدخول بحساب GitHub»)
يعمل الزر عبر ملفين PHP: `public/oauth/auth.php` و`public/oauth/callback.php` (يُنشران تلقائيًا مع الموقع)، وقاعدتا rewrite في `public/.htaccess`.

1. GitHub ← Settings ← Developer settings ← OAuth Apps ← New OAuth App:
   - Homepage URL: `https://دومينك.dz`
   - Authorization callback URL: `https://دومينك.dz/oauth/callback`
   - ثم Generate a new client secret وانسخ Client ID وSecret.
2. انسخ `cei-oauth-config.php.example` إلى `cei-oauth-config.php`، واملأ `client_id` و`client_secret` و`site_url`، ثم ارفعه يدويًا عبر cPanel إلى **جذر الحساب (فوق `public_html`)**. لا تضعه في GitHub أبدًا.
3. الحساب الذي يدخل يجب أن يكون Collaborator في المستودع، ثم الرقم السري كالمعتاد.
4. بديل: «لديك مفتاح GitHub (Personal Access Token)؟» (Fine-grained، صلاحية Contents: Read and write).

## ملاحظات
- فعّل SSL (AutoSSL) في cPanel ثم أزل `#` من سطري https في `public/.htaccess`.
- **تنظيف تاريخ Git (مهم):** وثيقة شخصية وصور أخرى حُذفت من `public/images/uploads` لكنها تبقى قابلة للاسترجاع من تاريخ الـ commits ما دام المستودع عامًا. الحل الأسرع: اجعل المستودع **خاصًا** (Settings ← Danger Zone ← Change visibility). وللحذف النهائي من التاريخ:
  1. انسخ المستودع: `git clone --mirror https://github.com/chababELihsan/chabab-el-ihssan.git`
  2. داخل المجلد: `git filter-repo --invert-paths --path public/images/uploads/<اسم-الملف>` (كرّره لكل ملف حساس؛ الأداة: https://github.com/newren/git-filter-repo).
  3. ادفع: `git push --force --mirror`، ثم اطلب من GitHub Support مسح الـ cache للـ commits القديمة إن لزم.
  4. إن كانت الوثيقة تحوي أرقامًا أو بيانات حساسة فاعتبرها مكشوفة وغيّر ما يمكن تغييره.
- Cloudflare ما زال ممكنًا (`wrangler.jsonc`) لكنه غير لازم لـ DZSecurity.
