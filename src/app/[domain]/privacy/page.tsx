import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const supabase = await createClient();

  let tenantName = "Yowanastore";
  let tenantDomain = "yowanastore.com";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let { data: tenantData } = await supabase
      .from("tenants")
      .select("name, domain")
      .eq("domain", domain)
      .maybeSingle();

    if (!tenantData) {
      const res = await supabase.from("tenants").select("name, domain").limit(1).maybeSingle();
      if (res.data) tenantData = res.data;
    }

    if (tenantData) {
      tenantName = tenantData.name || tenantName;
      tenantDomain = tenantData.domain || tenantDomain;
    }
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear() >= 2025 ? currentDate.getFullYear() : 2025;
  const lastUpdated = `1 November ${year}`;

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
