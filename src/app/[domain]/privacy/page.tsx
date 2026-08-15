import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  let tenantName = "NewGamingStore";
  let tenantDomain = "newgamingstore.com";
  let language = "id";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let { data: tenantData } = await supabase
      .from("tenants")
      .select("name, domain, theme_config")
      .eq("domain", domain)
      .maybeSingle();

    if (!tenantData) {
      const res = await supabase.from("tenants").select("name, domain, theme_config").limit(1).maybeSingle();
      if (res.data) tenantData = res.data;
    }

    if (tenantData) {
      tenantName = tenantData.name || tenantName;
      tenantDomain = tenantData.domain || tenantDomain;
      language = tenantData.theme_config?.language || "id";
    }
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear() >= 2025 ? currentDate.getFullYear() : 2025;
  const isEn = language === "ms";
  const lastUpdated = isEn ? `November 1, ${year}` : `1 November ${year}`;

  if (isEn) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-300 leading-relaxed">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy for {tenantName}</h1>
        <p className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-4">Last Updated: {lastUpdated}</p>

        <div className="space-y-6">
          <p>
            This Privacy Policy describes how {tenantName} ("We", "Us", "Site", or "Company") collects, uses, discloses, and protects your personal information ("Personal Data") when you use our game top-up and voucher services through the website {tenantName}.
          </p>
          <p>
            By using our services, you consent to the information collection and usage practices described in this Privacy Policy. We are committed to protecting your privacy and data security.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">1. Personal Data We Collect</h2>
            <p className="text-sm md:text-base">We collect several types of information to provide and improve our service to you.</p>

            <div className="space-y-4 text-sm md:text-base mt-2">
              <div>
                <h3 className="font-semibold text-white mb-1">A. Data Provided Directly by Users:</h3>
                <p className="mb-2">This data is collected when you place a transaction or register an account:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Basic Identity Info:</strong> Full name, email address, phone/WhatsApp number.</li>
                  <li><strong className="text-white">Transaction Data:</strong> Information required to complete top-ups, such as Game User ID (UID), in-game nickname, or voucher service account ID.</li>
                  <li><strong className="text-white">Payment Information:</strong> Payment confirmations, including transfer proofs or details related to your chosen payment method. We do not store sensitive credit/debit card numbers; payment data is securely handled by accredited payment service providers.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">B. Data Collected Automatically:</h3>
                <p className="mb-2">This data is collected automatically when you access and use the Site:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-white">Device Data:</strong> Internet Protocol (IP) address, browser type, browser version, device type (desktop/mobile), and operating system.</li>
                  <li><strong className="text-white">Usage Data:</strong> Pages visited on our Site, duration of visit, time and date of access, and interactions (clicks) performed.</li>
                  <li><strong className="text-white">Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to monitor activity on the Site and hold certain information. You can instruct your browser to refuse all cookies, though some features may not function properly without them.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">2. Use of Your Personal Data</h2>
            <p className="text-sm md:text-base">We use the collected Personal Data for various purposes, including:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li><strong className="text-white">Processing and Fulfilling Transactions:</strong> To fulfill requested game top-ups and voucher purchases, and send transaction-related notifications.</li>
              <li><strong className="text-white">Improving Services:</strong> To analyze usage trends, test new features, and enhance website functionality.</li>
              <li><strong className="text-white">Communication:</strong> To respond to your requests, inquiries, or complaints via email, phone, or live chat.</li>
              <li><strong className="text-white">Marketing (Optional):</strong> To deliver promotions, discounts, or updates about new products that may interest you. You may opt out/unsubscribe at any time.</li>
              <li><strong className="text-white">Security & Fraud Prevention:</strong> To detect, prevent, and address fraud, abuse, or unauthorized activities.</li>
              <li><strong className="text-white">Legal Compliance:</strong> To comply with applicable legal obligations and regulations.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">3. Sharing and Disclosure of Personal Data</h2>
            <p className="text-sm md:text-base mb-2">We do not sell or rent your Personal Data to third parties. We only share your Personal Data under the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li><strong className="text-white">Third-Party Service Providers:</strong> We employ third-party companies or individuals to facilitate our service (e.g. payment gateway providers, product suppliers, website hosting). These parties only have access to your Personal Data to perform these tasks and are contractually obligated not to disclose or use it for any other purpose.</li>
              <li><strong className="text-white">Game/Voucher Partners:</strong> We share Transaction Data (such as User ID and top-up quantity) with relevant game publishers or voucher suppliers to complete the fulfillment process.</li>
              <li><strong className="text-white">Legal Compliance:</strong> We may disclose your Personal Data if required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong className="text-white">Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your Personal Data may be transferred as part of that transaction.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">4. Data Security</h2>
            <p className="text-sm md:text-base">
              The security of your Personal Data is important to us. We implement reasonable physical, technical, and managerial security measures to protect your Personal Data against unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p className="text-sm md:text-base">
              However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">5. Data Retention</h2>
            <p className="text-sm md:text-base">
              We will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will also retain and use your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements.
            </p>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">6. Your Privacy Rights</h2>
            <p className="text-sm md:text-base mb-2">Subject to applicable law, you may have certain rights regarding your Personal Data, including the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base mb-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the Personal Data we hold about you.</li>
              <li><strong className="text-white">Rectify:</strong> Request correction of inaccurate or incomplete Personal Data.</li>
              <li><strong className="text-white">Delete:</strong> Request deletion of your Personal Data from our systems, subject to certain legal obligations requiring retention.</li>
            </ul>
            <p className="text-sm md:text-base">To exercise these rights, please contact us using the details provided on our website.</p>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">7. Changes to This Privacy Policy</h2>
            <p className="text-sm md:text-base">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl text-gray-300 leading-relaxed">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Kebijakan Privasi {tenantName}</h1>
      <p className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-4">Terakhir Diperbarui: {lastUpdated}</p>

      <div className="space-y-6">
        <p>
          Kebijakan Privasi ini menjelaskan bagaimana {tenantName} ("Kami", "Situs", atau "Perusahaan") mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadi ("Data Pribadi") Anda ketika Anda menggunakan layanan top up game dan voucher kami melalui website {tenantName}.
        </p>
        <p>
          Dengan menggunakan layanan kami, Anda menyetujui praktik pengumpulan dan penggunaan informasi yang dijelaskan dalam Kebijakan Privasi ini. Kami berkomitmen untuk melindungi privasi dan keamanan data Anda.
        </p>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">1. Data Pribadi yang Kami Kumpulkan</h2>
          <p className="text-sm md:text-base">Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami kepada Anda.</p>
          
          <div className="space-y-4 text-sm md:text-base mt-2">
            <div>
              <h3 className="font-semibold text-white mb-1">A. Data yang Diberikan Langsung oleh Pengguna:</h3>
              <p className="mb-2">Data ini dikumpulkan saat Anda melakukan transaksi atau mendaftar akun:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Informasi Identitas Dasar:</strong> Nama lengkap, alamat email, nomor telepon/WhatsApp.</li>
                <li><strong className="text-white">Data Transaksi:</strong> Informasi yang diperlukan untuk menyelesaikan top up, seperti User ID (UID) game, nickname dalam game, atau ID akun layanan voucher.</li>
                <li><strong className="text-white">Informasi Pembayaran:</strong> Konfirmasi pembayaran, termasuk bukti transfer atau detail yang terkait dengan metode pembayaran yang Anda gunakan. Namun, kami tidak menyimpan detail sensitif kartu kredit/debit; data ini diproses oleh penyedia layanan pembayaran pihak ketiga yang aman.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-1">B. Data yang Dikumpulkan Secara Otomatis:</h3>
              <p className="mb-2">Data ini dikumpulkan secara otomatis saat Anda mengakses dan menggunakan Situs:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Data Perangkat:</strong> Alamat Protokol Internet (IP), jenis browser, versi browser, jenis perangkat (desktop/seluler), dan sistem operasi.</li>
                <li><strong className="text-white">Data Penggunaan:</strong> Halaman yang Anda kunjungi di Situs kami, durasi kunjungan, waktu dan tanggal akses, serta interaksi (klik) yang dilakukan di Situs.</li>
                <li><strong className="text-white">Cookies dan Teknologi Pelacakan:</strong> Kami menggunakan cookies dan teknologi serupa (seperti beacons dan tags) untuk melacak aktivitas di Situs dan menyimpan informasi tertentu. Anda dapat menginstruksikan browser Anda untuk menolak semua cookies, tetapi beberapa bagian layanan kami mungkin tidak berfungsi dengan baik tanpanya.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">2. Penggunaan Data Pribadi Anda</h2>
          <p className="text-sm md:text-base">Kami menggunakan Data Pribadi yang dikumpulkan untuk berbagai tujuan, termasuk:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
            <li><strong className="text-white">Memproses dan Menyelesaikan Transaksi:</strong> Untuk memproses top up game dan pembelian voucher yang Anda minta, serta mengirimkan notifikasi terkait transaksi.</li>
            <li><strong className="text-white">Meningkatkan Layanan:</strong> Untuk menganalisis tren penggunaan Situs, menguji fitur baru, dan meningkatkan fungsionalitas layanan kami.</li>
            <li><strong className="text-white">Komunikasi:</strong> Untuk menanggapi permintaan, pertanyaan, atau keluhan Anda melalui email, telepon, atau live chat.</li>
            <li><strong className="text-white">Pemasaran (Opsional):</strong> Untuk mengirimkan promosi, diskon, atau informasi tentang produk baru kami yang mungkin menarik bagi Anda. Anda memiliki opsi untuk berhenti berlangganan (unsubscribe) kapan saja.</li>
            <li><strong className="text-white">Keamanan dan Pencegahan Penipuan:</strong> Untuk mendeteksi, mencegah, dan mengatasi penipuan, penyalahgunaan, atau kegiatan ilegal lainnya.</li>
            <li><strong className="text-white">Kepatuhan Hukum:</strong> Untuk mematuhi kewajiban hukum yang berlaku sesuai peraturan perundang-undangan.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">3. Pembagian dan Pengungkapan Data Pribadi</h2>
          <p className="text-sm md:text-base mb-2">Kami tidak menjual atau menyewakan Data Pribadi Anda kepada pihak ketiga. Kami hanya membagikan Data Pribadi Anda dalam kondisi berikut:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
            <li><strong className="text-white">Penyedia Layanan Pihak Ketiga:</strong> Kami menggunakan perusahaan atau individu pihak ketiga untuk memfasilitasi layanan kami (misalnya, penyedia gateway pembayaran, mitra supplier produk, penyedia hosting website). Pihak-pihak ini hanya memiliki akses ke Data Pribadi Anda sejauh yang diperlukan untuk menjalankan tugas mereka dan diwajibkan secara kontrak untuk tidak mengungkapkannya atau menggunakannya untuk tujuan lain.</li>
            <li><strong className="text-white">Mitra Game/Voucher:</strong> Kami membagikan Data Transaksi (seperti User ID dan jumlah top up) kepada penerbit game atau penyedia voucher yang bersangkutan untuk menyelesaikan proses isi ulang.</li>
            <li><strong className="text-white">Kepatuhan Hukum:</strong> Jika diwajibkan oleh hukum, proses pengadilan, atau permintaan pemerintah yang sah, kami dapat mengungkapkan Data Pribadi Anda.</li>
            <li><strong className="text-white">Transfer Bisnis:</strong> Jika kami terlibat dalam merger, akuisisi, atau penjualan aset, Data Pribadi Anda dapat dipindahkan sebagai bagian dari aset tersebut.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">4. Keamanan Data Anda</h2>
          <p className="text-sm md:text-base">
            Keamanan Data Pribadi Anda sangat penting bagi kami. Kami menerapkan langkah-langkah keamanan fisik, elektronik, dan manajerial yang wajar untuk melindungi Data Pribadi dari akses, pengungkapan, perubahan, atau penghancuran yang tidak sah.
          </p>
          <p className="text-sm md:text-base">
            Namun, harap diingat bahwa tidak ada metode transmisi melalui Internet atau metode penyimpanan elektronik yang 100% aman. Meskipun kami berusaha keras menggunakan cara-cara yang diterima secara komersial untuk melindungi Data Pribadi Anda, kami tidak dapat menjamin keamanan mutlaknya.
          </p>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">5. Retensi Data</h2>
          <p className="text-sm md:text-base">
            Kami akan menyimpan Data Pribadi Anda hanya selama diperlukan untuk tujuan yang ditetapkan dalam Kebijakan Privasi ini. Kami juga akan menyimpan dan menggunakan Data Pribadi Anda sejauh yang diperlukan untuk mematuhi kewajiban hukum kami (misalnya, jika kami diminta untuk menyimpan data Anda untuk mematuhi undang-undang yang berlaku), menyelesaikan sengketa, dan menegakkan perjanjian hukum kami.
          </p>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">6. Hak-Hak Privasi Anda</h2>
          <p className="text-sm md:text-base mb-2">Sesuai dengan peraturan yang berlaku, Anda mungkin memiliki hak-hak tertentu terkait Data Pribadi Anda, termasuk hak untuk:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm md:text-base mb-2">
            <li><strong className="text-white">Mengakses:</strong> Meminta salinan Data Pribadi yang kami miliki tentang Anda.</li>
            <li><strong className="text-white">Memperbaiki:</strong> Meminta perbaikan Data Pribadi yang tidak akurat atau tidak lengkap.</li>
            <li><strong className="text-white">Menghapus:</strong> Meminta penghapusan Data Pribadi Anda dari sistem kami, dengan tunduk pada kewajiban hukum yang mungkin mengharuskan kami menyimpan data tertentu.</li>
          </ul>
          <p className="text-sm md:text-base">Untuk melaksanakan hak-hak ini, silakan hubungi kami melalui detail kontak di website kami.</p>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">7. Perubahan pada Kebijakan Privasi Ini</h2>
          <p className="text-sm md:text-base">
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir Diperbarui" di bagian atas. Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap perubahan.
          </p>
        </section>
      </div>
    </div>
  );
}
