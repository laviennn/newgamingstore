import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function TermsPage({
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
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Syarat dan Ketentuan Layanan {tenantName}</h1>
      <p className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-4">Terakhir Diperbarui: {lastUpdated}</p>

      <div className="space-y-6">
        <p>
          Selamat datang di {tenantName}. Syarat dan Ketentuan ini mengatur akses dan penggunaan Anda atas website https://{tenantDomain} dan semua produk serta layanan yang tersedia melalui situs ini (secara kolektif disebut "Layanan").
        </p>
        <p>
          Dengan mengakses atau menggunakan Layanan kami, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan salah satu bagian dari persyaratan ini, mohon untuk tidak menggunakan Layanan kami.
        </p>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">1. Definisi</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
            <li><strong className="text-white">{tenantName}/Kami:</strong> Merujuk pada penyedia layanan dan pemilik website https://{tenantDomain}.</li>
            <li><strong className="text-white">Pengguna/Anda:</strong> Setiap individu atau entitas yang mengakses atau menggunakan Layanan kami.</li>
            <li><strong className="text-white">Produk Digital:</strong> Semua voucher, diamond, cash, credit, top up, saldo e-wallet, atau item in-game lainnya yang dijual melalui Layanan.</li>
            <li><strong className="text-white">Akun:</strong> Akun pengguna yang terdaftar di Situs untuk mengakses fitur tertentu.</li>
            <li><strong className="text-white">Situs:</strong> Website https://{tenantDomain}.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">2. Ketentuan Umum Penggunaan Layanan</h2>
          <div className="space-y-4 text-sm md:text-base">
            <div>
              <h3 className="font-semibold text-white mb-1">A. Kelayakan Pengguna</h3>
              <p>Anda menyatakan dan menjamin bahwa Anda minimal berusia 18 (delapan belas) tahun atau telah mendapatkan persetujuan dari orang tua/wali dan memiliki kapasitas hukum untuk terikat oleh Syarat dan Ketentuan ini.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">B. Akun Pengguna</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan username dan password Akun Anda dan bertanggung jawab atas semua aktivitas yang terjadi di bawah Akun Anda.</li>
                <li>Anda wajib segera memberitahu Kami jika terjadi penggunaan Akun Anda tanpa izin atau pelanggaran keamanan lainnya.</li>
                <li>Kami berhak menangguhkan atau menghentikan Akun Anda jika terdapat indikasi aktivitas mencurigakan, penipuan, atau pelanggaran Syarat dan Ketentuan.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">3. Ketentuan Transaksi dan Pembelian Produk Digital</h2>
          <div className="space-y-4 text-sm md:text-base">
            <div>
              <h3 className="font-semibold text-white mb-1">A. Pemesanan</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Setiap pemesanan dianggap sebagai penawaran dari Anda untuk membeli Produk Digital.</li>
                <li>Anda bertanggung jawab penuh untuk memastikan bahwa semua detail pemesanan, termasuk User ID (UID) Game, Nickname, atau ID Target Voucher, yang Anda masukkan sudah benar. {tenantName} tidak bertanggung jawab atas kesalahan top up atau pengiriman akibat kesalahan input data oleh Pengguna.</li>
                <li>Harga yang tertera pada Situs sudah final dan termasuk PPN (jika berlaku), kecuali dinyatakan lain.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">B. Pembayaran</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pembayaran harus dilakukan melalui metode pembayaran yang tersedia di Situs.</li>
                <li>Transaksi akan diproses setelah Kami menerima konfirmasi pembayaran yang valid dan dana telah Kami terima sepenuhnya.</li>
                <li>Keterlambatan atau kegagalan dalam proses pembayaran adalah tanggung jawab penyedia layanan pembayaran pihak ketiga.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">C. Proses dan Pengiriman Produk</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Waktu pengiriman Produk Digital bervariasi tergantung pada jenis produk dan status sistem penyedia (supplier). Kami akan berusaha memproses pesanan sesegera mungkin (umumnya instan).</li>
                <li>Produk Digital dianggap berhasil dikirim apabila: (a) Untuk top up langsung (misalnya Diamond MLBB), Produk telah masuk ke ID target; atau (b) Untuk voucher/kode, kode telah ditampilkan di layar Anda atau dikirimkan ke email/kontak Anda.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">4. Kebijakan Pengembalian Dana dan Pembatalan (Refund Policy)</h2>
          <div className="space-y-4 text-sm md:text-base">
            <div>
              <h3 className="font-semibold text-white mb-1">A. Pembatalan oleh Pelanggan</h3>
              <p>Setelah pembayaran dikonfirmasi dan Produk Digital sedang diproses, pesanan tidak dapat dibatalkan atau ditarik kembali oleh Pengguna.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">B. Pengembalian Dana (Refund)</h3>
              <p className="mb-2">Refund hanya akan diproses jika:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li><strong className="text-white">Kegagalan Sistem:</strong> Kami terbukti gagal mengirimkan Produk Digital karena error pada sistem Kami atau sistem supplier setelah pembayaran diterima.</li>
                <li><strong className="text-white">Stok Habis:</strong> Produk yang dipesan tidak tersedia (Out of Stock) pada saat pembayaran diterima.</li>
              </ul>
              <p className="mb-2">Refund tidak akan diberikan jika:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Pengguna salah memasukkan User ID atau data target lainnya.</li>
                <li>Pengguna berubah pikiran setelah transaksi berhasil diproses.</li>
                <li>Kode voucher telah dikirimkan ke Pengguna.</li>
              </ul>
              <p>Jika refund disetujui, dana akan dikembalikan ke metode pembayaran awal atau ke Akun Pengguna dalam waktu 3-7 Hari Kerja, dikurangi biaya transaksi bank atau biaya administrasi yang berlaku.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">5. Tanggung Jawab dan Jaminan</h2>
          <div className="space-y-4 text-sm md:text-base">
            <div>
              <h3 className="font-semibold text-white mb-1">A. Batasan Tanggung Jawab</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{tenantName} hanya bertindak sebagai fasilitator antara Pengguna dan penyedia game/voucher resmi. Kami tidak bertanggung jawab atas perubahan, pembatalan, atau masalah layanan yang terjadi pada pihak penyedia game atau voucher (misalnya, banned akun, perubahan in-game currency).</li>
                <li>Kami tidak bertanggung jawab atas kerugian, kerusakan, atau tuntutan yang timbul dari penggunaan Akun, User ID, atau voucher yang telah berhasil Kami kirimkan.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">B. Jaminan Produk</h3>
              <p>Kami menjamin bahwa semua Produk Digital yang kami jual adalah legal, asli, dan valid dari sumber resmi. Kami tidak menjual produk hasil kejahatan atau ilegal.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">6. Kekayaan Intelektual</h2>
          <p className="text-sm md:text-base">Semua konten, logo, merek dagang, desain, dan perangkat lunak yang terdapat pada Situs adalah milik {tenantName} atau pihak ketiga yang memberikan lisensi kepada Kami, dan dilindungi oleh undang-undang kekayaan intelektual. Pengguna dilarang menggunakan, mereproduksi, atau mendistribusikan konten tanpa izin tertulis dari Kami.</p>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-bold text-white">7. Ketentuan Lain-lain</h2>
          <div className="space-y-4 text-sm md:text-base">
            <div>
              <h3 className="font-semibold text-white mb-1">A. Hukum yang Berlaku</h3>
              <p>Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Negara Republik Indonesia.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">B. Penyelesaian Sengketa</h3>
              <p>Setiap sengketa yang timbul dari Syarat dan Ketentuan ini akan diupayakan penyelesaiannya secara musyawarah mufakat. Jika sengketa tidak dapat diselesaikan secara damai, maka akan diselesaikan melalui Pengadilan Negeri terdekat dari lokasi operasional {tenantName}.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">C. Perubahan Syarat dan Ketentuan</h3>
              <p>Kami berhak, atas kebijakan tunggal Kami, untuk memodifikasi atau mengganti Syarat dan Ketentuan ini kapan saja. Kami akan memberikan pemberitahuan setidaknya 15 hari sebelum perubahan baru mulai berlaku. Dengan terus mengakses atau menggunakan Layanan kami setelah perubahan tersebut berlaku, Anda setuju untuk terikat oleh Syarat dan Ketentuan yang direvisi.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
