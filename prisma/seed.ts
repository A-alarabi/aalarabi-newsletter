import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Admin user ──────────────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL || 'admin@aalarabi.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'
  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.adminUser.create({ data: { email, passwordHash } })
    console.log('✅ Admin user created:', email)
  } else {
    console.log('ℹ️  Admin user already exists:', email)
  }

  // ── Site settings ───────────────────────────────────────────────
  const settingsCount = await prisma.siteSettings.count()
  if (settingsCount === 0) {
    await prisma.siteSettings.create({
      data: {
        siteName: 'النشرة الأسبوعية',
        description: 'نشرة خفيفة أشارك فيها أبرز ما استفدته خلال الأسبوع — كل يوم أحد',
        accentColor: '#e63946',
      },
    })
    console.log('✅ Site settings created')
  }

  // ── Social links ────────────────────────────────────────────────
  const socialCount = await prisma.socialLink.count()
  if (socialCount === 0) {
    await prisma.socialLink.createMany({
      data: [
        { title: 'تويتر / X',   url: 'https://twitter.com',   platform: 'twitter',   enabled: true,  sortOrder: 0 },
        { title: 'إنستغرام',    url: 'https://instagram.com', platform: 'instagram', enabled: true,  sortOrder: 1 },
        { title: 'يوتيوب',      url: 'https://youtube.com',   platform: 'youtube',   enabled: true,  sortOrder: 2 },
        { title: 'تيك توك',     url: 'https://tiktok.com',    platform: 'tiktok',    enabled: false, sortOrder: 3 },
        { title: 'لينكد إن',    url: 'https://linkedin.com',  platform: 'linkedin',  enabled: false, sortOrder: 4 },
      ],
    })
    console.log('✅ Social links created')
  }

  // ── Sample newsletters ───────────────────────────────────────────
  const sampleNewsletters = [
    {
      slug: 'sample-ai-revolution-2026',
      title: 'ثورة الذكاء الاصطناعي في ٢٠٢٦ 🤖',
      description: 'كيف تغيّر الذكاء الاصطناعي طريقة عملنا وتفكيرنا خلال الأشهر الماضية، وما الذي ينتظرنا في الأفق.',
      content: `<h1>ثورة الذكاء الاصطناعي في ٢٠٢٦</h1>
<p>أهلاً بك في هذه النشرة الأسبوعية. اليوم نتحدث عن الموضوع الذي شغل الجميع: <strong>الذكاء الاصطناعي</strong>.</p>
<h2>ما الذي تغيّر؟</h2>
<p>خلال الأشهر الماضية، شهدنا قفزات نوعية في قدرات النماذج اللغوية الكبيرة. لم يعد الأمر مجرد أداة للكتابة أو الإجابة على الأسئلة، بل أصبح شريكاً حقيقياً في:</p>
<ul>
<li>تطوير البرمجيات والكود</li>
<li>التحليل المالي واتخاذ القرارات</li>
<li>الإبداع الفني والأدبي</li>
<li>البحث العلمي والطبي</li>
</ul>
<h2>أبرز ما قرأته هذا الأسبوع</h2>
<blockquote><p>"الذكاء الاصطناعي لن يأخذ وظيفتك، لكن الشخص الذي يتقن استخدامه سيأخذها."</p></blockquote>
<p>هذه المقولة تلخّص الواقع الجديد. الأدوات موجودة للجميع، لكن المهارة في توظيفها هي الفارق الحقيقي.</p>
<h2>توصيتي لهذا الأسبوع</h2>
<p>جرّب أن تستخدم أداة ذكاء اصطناعي في مهمة واحدة لم تجربها من قبل. سواء كان ذلك في إعداد تقرير، أو تحليل بيانات، أو حتى كتابة بريد إلكتروني احترافي.</p>
<p>إلى اللقاء الأسبوع القادم! 👋</p>`,
      status: 'published' as const,
      publishedAt: new Date('2026-03-10'),
    },
    {
      slug: 'sample-reading-habits-2026',
      title: 'كيف أقرأ ٥٠ كتاباً في السنة 📚',
      description: 'نظام بسيط وعملي طوّرته على مدار سنوات لأقرأ أكثر بجهد أقل — وكيف يمكنك تطبيقه اليوم.',
      content: `<h1>كيف أقرأ ٥٠ كتاباً في السنة</h1>
<p>كثيراً ما يسألني الناس: "كيف تجد الوقت للقراءة؟" الجواب البسيط هو: <strong>لا تجد الوقت، بل تصنعه.</strong></p>
<h2>النظام الذي أتبعه</h2>
<h3>١. قاعدة الصفحات الخمس عشرة</h3>
<p>في كل يوم، خمس عشرة صفحة على الأقل. هذا يعني كتاباً كل أسبوعين إذا كان متوسط الكتاب ٢٢٠ صفحة.</p>
<h3>٢. القراءة متعددة الكتب</h3>
<p>لا تقيّد نفسك بكتاب واحد. أنا دائماً أقرأ في:</p>
<ul>
<li>كتاب في موضوع عملي (أعمال، تقنية)</li>
<li>كتاب في التطوير الشخصي</li>
<li>رواية أو أدب قصصي</li>
</ul>
<h3>٣. مراجعة ما قرأت</h3>
<p>في نهاية كل كتاب، أكتب ثلاث نقاط تعلمتها وكيف سأطبّقها. هذا يجعل القراءة استثماراً حقيقياً وليس مجرد ترفيه.</p>
<h2>توصيتي لهذا الأسبوع</h2>
<p>ابدأ بـ ١٠ دقائق فقط قبل النوم. لا تحتاج لأكثر من ذلك في البداية. المهم هو بناء العادة أولاً.</p>`,
      status: 'published' as const,
      publishedAt: new Date('2026-03-03'),
    },
    {
      slug: 'sample-productivity-system-2026',
      title: 'نظام الإنتاجية الذي غيّر حياتي ⚡',
      description: 'بعد تجربة عشرات الأنظمة والتطبيقات، توصّلت إلى نظام بسيط من ثلاث خطوات يعمل فعلاً.',
      content: `<h1>نظام الإنتاجية الذي غيّر حياتي</h1>
<p>قضيت سنوات أبحث عن "النظام المثالي" للإنتاجية. جرّبت Notion وTodoist وAsana وأكثر من ٣٠ تطبيقاً آخر. ثم اكتشفت الحقيقة:</p>
<blockquote><p>التعقيد عدو الإنتاجية.</p></blockquote>
<h2>النظام الذي أستخدمه الآن</h2>
<h3>الخطوة الأولى: ثلاث مهام يومية</h3>
<p>في كل صباح، أختار <strong>ثلاث مهام فقط</strong> يجب إنجازها اليوم. ليس عشراً، وليس خمساً. ثلاث مهام محددة وقابلة للقياس.</p>
<h3>الخطوة الثانية: العمل بلوكات زمنية</h3>
<p>أقسّم يومي إلى بلوكات من ٩٠ دقيقة مع استراحات ١٥ دقيقة بينها. خلال كل بلوك:</p>
<ul>
<li>الهاتف في الغرفة الثانية</li>
<li>الإشعارات مغلقة بالكامل</li>
<li>تركيز كامل على مهمة واحدة</li>
</ul>
<h3>الخطوة الثالثة: مراجعة أسبوعية</h3>
<p>كل يوم جمعة، أجلس ١٥ دقيقة وأراجع:</p>
<ol>
<li>ما الذي أنجزته هذا الأسبوع؟</li>
<li>ما الذي لم أنجزه ولماذا؟</li>
<li>ما أولوياتي للأسبوع القادم؟</li>
</ol>
<h2>النتيجة</h2>
<p>منذ تطبيق هذا النظام، تضاعف إنتاجي وتراجع التوتر بشكل ملحوظ. الأهم من ذلك: <strong>أنهي كل يوم بشعور الإنجاز لا الإرهاق.</strong></p>`,
      status: 'published' as const,
      publishedAt: new Date('2026-02-24'),
    },
  ]

  for (const nl of sampleNewsletters) {
    await prisma.newsletter.upsert({
      where: { slug: nl.slug },
      update: {},
      create: nl,
    })
  }
  console.log('✅ Sample newsletters seeded')

  console.log('\n🚀 Database ready!')
  console.log('   Login: http://localhost:3000/login')
  console.log(`   Email: ${email}`)
  console.log('   Password: Admin@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
