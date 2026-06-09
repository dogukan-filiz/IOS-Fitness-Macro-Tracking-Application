#!/usr/bin/env python3
"""Generate the finished (final) project document PDF.

Mirrors the structure of pre-document.pdf but reflects the completed project:
real tech stack (SQLite), per-week completion status, and published video links.
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
LOGO = "/Users/dogukanfiliz/fitness-app/scripts/assets/ankara_logo.jpeg"

NAVY = (15, 23, 42)
GRAY = (90, 96, 110)
LINK = (37, 99, 235)
RULE = (210, 214, 220)

PLAYLIST = "https://www.youtube.com/playlist?list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H"
GITHUB = "https://github.com/dogukan-filiz/IOS-Fitness-Macro-Tracking-Application"

WEEKS = [
    ("1. Hafta", ["Proje fikrinin belirlenmesi", "Gerekli teknolojilerin araştırılması",
                  "GitHub repository oluşturulması", "Proje dokümanının hazırlanması"],
     "Proje fikri ve planı anlatıldı.", "7 Nisan 2026",
     "https://www.youtube.com/watch?v=CYnLUYTB3yo&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=2&t=3s"),
    ("2. Hafta", ["React Native geliştirme ortamının kurulması", "Expo projesinin oluşturulması",
                  "Proje klasör yapısının oluşturulması", "Temel bağımlılıkların yüklenmesi"],
     "Kurulum süreci ve proje başlangıcı anlatıldı.", "14 Nisan 2026",
     "https://www.youtube.com/watch?v=8SuirBNspEc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=1"),
    ("3. Hafta", ["Navigation sisteminin kurulması (React Navigation)", "Login ekranının tasarlanması",
                  "Register ekranının tasarlanması", "Basit kullanıcı arayüzü oluşturulması"],
     "Login ve Register ekranlarının çalışması gösterildi.", "21 Nisan 2026",
     "https://www.youtube.com/watch?v=Lz-Z5SqH-Cc&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=3&t=59s"),
    ("4. Hafta", ["Backend projesinin oluşturulması", "Kullanıcı kayıt API'sinin yazılması",
                  "Kullanıcı giriş API'sinin yazılması", "Mobil uygulama ile backend bağlantısı"],
     "API bağlantısı ve kullanıcı işlemleri gösterildi.", "28 Nisan 2026",
     "https://www.youtube.com/watch?v=rIKMhql72fM&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=4"),
    ("5. Hafta", ["Besin ekleme sistemi", "Besin veritabanı oluşturma",
                  "Kalori hesaplama algoritması", "Makro hesaplama sistemi"],
     "Besin ekleme işlemi anlatıldı.", "5 Mayıs 2026",
     "https://www.youtube.com/watch?v=zSS9GPPCems&list=PL9BuUlHQ6EDzBpbM7VOoGhFvy2AYL0R9H&index=5"),
    ("6. Hafta", ["Günlük besin listesi ekranı", "Makro değerlerin hesaplanması",
                  "Günlük özet gösterimi"],
     "Makro hesaplama sistemi anlatıldı.", "12 Mayıs 2026",
     "https://youtu.be/v56BeV5ZrFM?si=7JcvTGzCdWozPKTJ"),
    ("7. Hafta", ["Kilo takip sistemi", "Kilo kayıt ekranı",
                  "Grafik kütüphanesi entegrasyonu", "İlerleme grafiklerinin oluşturulması"],
     "Kilo değişimi grafiği gösterildi.", "19 Mayıs 2026",
     "https://youtu.be/5Im0-geaQbo?si=_XaQ0Km8490pW5Xh"),
    ("8. Hafta", ["Kalori öneri sistemi geliştirilmesi", "BMR (Basal Metabolic Rate) hesaplama",
                  "TDEE (Total Daily Energy Expenditure) hesaplama", "Hedeflere göre kalori önerisi"],
     "Kalori hesaplama sistemi anlatıldı.", "26 Mayıs 2026",
     "https://youtu.be/g9IsptYvB28?si=FbdsWD_pESM_ToWN"),
    ("9. Hafta", ["Uygulama arayüzünün iyileştirilmesi", "Hata düzeltmeleri (bug fixes)",
                  "Tüm ekranlarda tutarlı geri bildirim (InlineMessage bileşeni)",
                  "Kullanıcı deneyimi iyileştirmeleri ve güvenlik temizliği"],
     "Uygulamanın genel işleyişi gösterildi.", "2 Haziran 2026",
     "https://youtu.be/yYmroAlQhJM?si=vysvM5VRrlQ_nWuO"),
    ("10. Hafta", ["Final düzenlemeleri", "Dış API (OpenFoodFacts) bağlantısının sağlamlaştırılması",
                   "Backend uçtan uca smoke test eklenmesi", "Dokümantasyon ve proje sunumuna hazırlık"],
     "Uygulamanın tüm özellikleri anlatıldı.", "9 Haziran 2026",
     "https://youtu.be/W4WdeCMEZSw?si=3sKwDjw2EvTnhY0_"),
]


class Doc(FPDF):
    def __init__(self):
        super().__init__(format="A4")
        self.set_auto_page_break(True, margin=18)
        self.set_margins(22, 20, 22)
        self.add_font("Arial", "", ARIAL)
        self.add_font("Arial", "B", ARIAL_BOLD)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font("Arial", "", 8)
        self.set_text_color(*GRAY)
        self.cell(0, 8, f"{self.page_no()}", align="C")

    def h1(self, text):
        self.ln(2)
        self.set_font("Arial", "B", 15)
        self.set_text_color(*NAVY)
        self.multi_cell(0, 8, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(*RULE)
        self.set_line_width(0.3)
        y = self.get_y() + 1
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(4)

    def h3(self, text):
        self.set_font("Arial", "B", 11.5)
        self.set_text_color(*NAVY)
        self.multi_cell(0, 6.5, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1)

    def para(self, text):
        self.set_font("Arial", "", 11)
        self.set_text_color(40, 44, 52)
        self.multi_cell(0, 6, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1.5)

    def bullet(self, text):
        self.set_font("Arial", "", 11)
        self.set_text_color(40, 44, 52)
        self.cell(7)
        self.cell(4, 6, "•")
        self.multi_cell(0, 6, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def numbered(self, n, text):
        self.set_font("Arial", "", 11)
        self.set_text_color(40, 44, 52)
        self.cell(7)
        self.cell(6, 6, f"{n}.")
        self.multi_cell(0, 6, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def labeled_link(self, label, url):
        self.set_font("Arial", "B", 11)
        self.set_text_color(*NAVY)
        self.cell(self.get_string_width(label) + 1, 6, label)
        self.set_font("Arial", "", 11)
        self.set_text_color(*LINK)
        self.multi_cell(0, 6, url, new_x=XPos.LMARGIN, new_y=YPos.NEXT, link=url)
        self.set_text_color(40, 44, 52)
        self.ln(1)


def cover(pdf):
    pdf.add_page()
    pdf.ln(6)
    pdf.set_font("Arial", "B", 16)
    pdf.set_text_color(*NAVY)
    for line in ["ANKARA ÜNİVERSİTESİ", "MÜHENDİSLİK FAKÜLTESİ", "BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ"]:
        pdf.cell(0, 9, line, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(8)
    logo_w = 48
    pdf.image(LOGO, x=(pdf.w - logo_w) / 2, w=logo_w)
    pdf.ln(14)
    pdf.set_font("Arial", "B", 14)
    pdf.multi_cell(0, 8, "BLM4538 (IOS İle Mobil Uygulama Geliştirme II)\nDersi Projesi Final Dokümanı",
                   align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(28)
    pdf.set_font("Arial", "B", 12)
    pdf.set_text_color(40, 44, 52)
    for line in ["Projenin Başlığı: Fitness & Makro Takibi Uygulaması",
                 "Öğrencinin Adı Soyadı: Doğukan Filiz",
                 "Öğrenci Numarası: 22290746"]:
        pdf.cell(0, 9, line, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(3)
    pdf.ln(34)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 9, "10 Haziran 2026", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def main():
    pdf = Doc()
    cover(pdf)
    pdf.add_page()

    pdf.h1("1. Projenin Amacı")
    pdf.para("Bu projenin amacı, kullanıcıların günlük beslenme alışkanlıklarını takip edebilecekleri ve "
             "tüketilen besinlerin kalori ile makro değerlerini analiz edebilecekleri bir mobil uygulama "
             "geliştirmektir.")
    pdf.para("Uygulama sayesinde kullanıcılar:")
    for b in ["Günlük kalori tüketimini takip edebilir", "Protein, karbonhidrat ve yağ miktarlarını görebilir",
              "Kilo değişimlerini kayıt altına alabilir", "Hedeflerine uygun kalori önerileri alabilir"]:
        pdf.bullet(b)
    pdf.ln(1)
    pdf.para("Proje React Native kullanılarak mobil platformlar için geliştirilmiştir.")

    pdf.h1("2. Kullanılan Teknolojiler")
    tech = [
        ("Mobil Uygulama", ["React Native", "Expo", "TypeScript"]),
        ("Backend", ["Node.js", "Express.js", "JWT tabanlı kimlik doğrulama"]),
        ("Veritabanı", ["SQLite (dosya tabanlı ilişkisel veritabanı)"]),
        ("Dış Servis", ["OpenFoodFacts API (besin arama)"]),
        ("Versiyon Kontrol", ["Git", "GitHub"]),
        ("Tasarım", ["Figma"]),
    ]
    for title, items in tech:
        pdf.h3(title)
        for it in items:
            pdf.bullet(it)
        pdf.ln(1)

    pdf.h1("3. Uygulamanın Temel Özellikleri")
    feats = [
        ("Kullanıcı Sistemi", ["Kullanıcı kayıt olma", "Kullanıcı giriş yapma", "Profil yönetimi"]),
        ("Besin Takibi", ["Günlük besin ekleme", "Besin gramı girme", "Otomatik kalori hesaplama",
                          "Hazır besin veritabanı ve dış API'den arama"]),
        ("Makro Analizi", ["Protein hesaplama ve takibi", "Karbonhidrat hesaplama ve takibi",
                           "Yağ hesaplama ve takibi", "Günlük makro özeti"]),
        ("Kilo Takibi", ["Günlük kilo kaydı", "Grafiksel ilerleme görüntüleme"]),
        ("Kalori Öneri Sistemi", ["Boy, kilo, yaş, cinsiyet, aktivite ve hedefe göre kişisel öneri",
                                  "Mifflin-St Jeor formülü ile BMR ve TDEE hesabı"]),
    ]
    for title, items in feats:
        pdf.h3(title)
        for it in items:
            pdf.bullet(it)
        pdf.ln(1)

    pdf.h1("4. Uygulama Ekranları")
    pdf.para("Uygulamada yer alan ekranlar:")
    for i, s in enumerate([
        "Giriş (Login) ekranı", "Kayıt (Register) ekranı", "Ana panel (Dashboard)",
        "Besin ekleme ekranı", "Günlük besin listesi", "Kilo takip ekranı", "Profil ekranı",
    ], 1):
        pdf.numbered(i, s)

    pdf.h1("5. Proje Geliştirme Planı (Hafta Hafta)")
    pdf.para("Proje on hafta boyunca, her hafta bir özellik eklenerek geliştirilmiştir. "
             "Tüm haftalar tamamlanmış ve her hafta için bir tanıtım videosu yayınlanmıştır.")
    for name, tasks, video, date, url in WEEKS:
        if pdf.will_page_break(40):
            pdf.add_page()
        pdf.h3(name)
        for t in tasks:
            pdf.bullet(t)
        pdf.set_font("Arial", "B", 10.5)
        pdf.set_text_color(22, 101, 52)
        pdf.cell(0, 6, f"Durum: Tamamlandı ({date})", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("Arial", "", 10.5)
        pdf.set_text_color(40, 44, 52)
        pdf.cell(pdf.get_string_width("Video: ") + 1, 6, "Video: ")
        pdf.set_text_color(*LINK)
        pdf.multi_cell(0, 6, url, new_x=XPos.LMARGIN, new_y=YPos.NEXT, link=url)
        pdf.set_text_color(40, 44, 52)
        pdf.ln(3)

    pdf.h1("6. GitHub Kullanımı")
    pdf.para("Proje süresince yapılan tüm çalışmalar GitHub üzerinden paylaşılmıştır. Her hafta yapılan "
             "işlemler commit edilmiş, kod değişiklikleri ve haftalık video linkleri depo dokümanlarında "
             "paylaşılmıştır.")
    pdf.labeled_link("GitHub: ", GITHUB)

    pdf.h1("7. Video Paylaşımı")
    pdf.para("Her hafta yapılan gelişmeler 3-5 dakikalık bir video ile anlatılmıştır. Videolar YouTube "
             "üzerinde bir oynatma listesinde toplanmıştır.")
    pdf.labeled_link("Oynatma Listesi: ", PLAYLIST)

    pdf.h1("8. Sonuç ve Değerlendirme")
    pdf.para("Proje dokümanında başta belirlenen tüm fonksiyonel hedefler tamamlanmıştır: kullanıcı kimlik "
             "doğrulama, günlük besin ve makro takibi, kilo takibi ve grafiksel raporlama ile kişiye özel "
             "kalori önerisi. Teknik hedefler açısından TypeScript, bileşen tabanlı mimari, RESTful API "
             "tasarımı, hata yönetimi ve veri doğrulama prensipleri uygulanmıştır.")
    pdf.para("Son haftalarda yapılan iyileştirmeler (tüm ekranlarda tutarlı geri bildirim, güvenlik "
             "temizliği, dış API'nin sağlamlaştırılması ve otomatik smoke test) ile uygulama, teslim "
             "edilebilir ve güvenilir bir ürün hâline getirilmiştir.")

    out = "/Users/dogukanfiliz/fitness-app/final-document.pdf"
    pdf.output(out)
    print("written", out)


if __name__ == "__main__":
    main()
