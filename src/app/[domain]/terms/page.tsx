import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function TermsPage({
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
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms and Conditions of Service for {tenantName}</h1>
        <p className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-4">Last Updated: {lastUpdated}</p>

        <div className="space-y-6">
          <p>
            Welcome to {tenantName}. These Terms and Conditions govern your access to and use of the website https://{tenantDomain} and all products and services available through this site (collectively referred to as the "Service").
          </p>
          <p>
            By accessing or using our Service, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our Service.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">1. Definitions</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              <li><strong className="text-white">{tenantName}/We/Us:</strong> Refers to the service provider and owner of the website https://{tenantDomain}.</li>
              <li><strong className="text-white">User/You:</strong> Any individual or entity accessing or using our Service.</li>
              <li><strong className="text-white">Digital Products:</strong> All vouchers, diamonds, cash, credits, top-ups, e-wallet balances, or other in-game items sold through the Service.</li>
              <li><strong className="text-white">Account:</strong> A user account registered on the Site to access certain features.</li>
              <li><strong className="text-white">Site:</strong> The website https://{tenantDomain}.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">2. General Terms of Service Usage</h2>
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <h3 className="font-semibold text-white mb-1">A. User Eligibility</h3>
                <p>You represent and warrant that you are at least 18 (eighteen) years of age or have obtained parental/guardian consent and have full legal capacity to enter into these Terms and Conditions.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">B. User Account</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You are solely responsible for maintaining the confidentiality of your Account username and password and for all activities that occur under your Account.</li>
                  <li>You must immediately notify Us of any unauthorized use of your Account or any other security breach.</li>
                  <li>We reserve the right to suspend or terminate your Account if there is any indication of suspicious activity, fraud, or violation of these Terms.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">3. Transaction & Digital Product Purchase Terms</h2>
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <h3 className="font-semibold text-white mb-1">A. Ordering</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Every order placed constitutes an offer by You to purchase Digital Products.</li>
                  <li>You are solely responsible for ensuring that all order details, including Game User ID (UID), Nickname, or Target Voucher ID entered are accurate. {tenantName} is not responsible for top-up errors or delivery failures resulting from incorrect user input.</li>
                  <li>All prices listed on the Site are final and inclusive of applicable taxes, unless stated otherwise.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">B. Payment</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Payments must be made through the available payment channels provided on the Site.</li>
                  <li>Transactions will be processed once We receive valid payment confirmation and funds are fully received.</li>
                  <li>Delays or failures in payment processing are the responsibility of third-party payment service providers.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">C. Product Processing and Delivery</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Delivery time for Digital Products varies depending on the product type and supplier system status. We will endeavor to process orders as quickly as possible (typically instant).</li>
                  <li>Digital Products are deemed successfully delivered when: (a) For direct top-ups, the product has arrived at the target ID; or (b) For vouchers, the code is displayed on your screen or sent to your email/contact.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">4. Refund and Cancellation Policy</h2>
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <h3 className="font-semibold text-white mb-1">A. Customer Cancellation</h3>
                <p>Once payment is confirmed and Digital Products are being processed, orders cannot be cancelled or recalled by the User.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">B. Refund Policy</h3>
                <p className="mb-2">Refunds will only be processed if:</p>
                <ul className="list-disc pl-5 space-y-1 mb-2">
                  <li><strong className="text-white">System Failure:</strong> We fail to deliver Digital Products due to errors in Our system or supplier system after payment is received.</li>
                  <li><strong className="text-white">Out of Stock:</strong> The ordered product is unavailable at the time payment is received.</li>
                </ul>
                <p className="mb-2">Refunds will not be issued if:</p>
                <ul className="list-disc pl-5 space-y-1 mb-2">
                  <li>The User incorrectly enters the User ID or target data.</li>
                  <li>The User changes their mind after the transaction has been successfully processed.</li>
                  <li>The voucher code has already been dispatched to the User.</li>
                </ul>
                <p>If a refund is approved, funds will be returned to the original payment method or User Account within 3-7 business days, minus applicable bank or admin fees.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">5. Liability and Warranties</h2>
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <h3 className="font-semibold text-white mb-1">A. Limitation of Liability</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{tenantName} acts solely as a facilitator between Users and official game/voucher suppliers. We are not responsible for changes, suspensions, or service issues arising on the publisher's end (e.g. account bans, currency adjustments).</li>
                  <li>We are not liable for any losses, damages, or claims arising from the use of Accounts, User IDs, or vouchers successfully delivered by Us.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">B. Product Guarantee</h3>
                <p>We guarantee that all Digital Products sold are legal, original, and sourced from official channels. We do not sell illegal or fraudulent items.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">6. Intellectual Property</h2>
            <p className="text-sm md:text-base">All content, logos, trademarks, designs, and software contained on the Site belong to {tenantName} or its licensors and are protected by intellectual property laws. Users are prohibited from using, reproducing, or distributing content without prior written permission.</p>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="text-xl font-bold text-white">7. Miscellaneous</h2>
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <h3 className="font-semibold text-white mb-1">A. Governing Law</h3>
                <p>These Terms and Conditions shall be governed by and construed in accordance with applicable laws.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">B. Dispute Resolution</h3>
                <p>Any dispute arising out of these Terms shall be resolved amicably through mutual consultation. If a settlement cannot be reached, it shall be referred to the competent court.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">C. Amendments</h3>
                <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. Continued access or use of our Service following any revisions constitutes your agreement to be bound by the updated Terms.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

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
