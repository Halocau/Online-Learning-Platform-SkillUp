import avatar from "../../assets/logo_skillup.png";
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#272343]/15 bg-[#272343]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e3f6f5] ring-1 ring-[#272343]/10">
                <span className="text-sm font-semibold tracking-tight text-[#272343]">
                  <img src={avatar} alt="SkillUp" />
                </span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-[#fffffe]" >
                SkillUp
              </span>
            </div>
            <p className="text-sm text-[#fffffe] leading-relaxed">
              Nền tảng học trực tuyến hàng đầu dành cho việc phát triển kỹ năng và nâng cao nghề nghiệp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#fffffe] mb-4 ">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2 text-sm text-[#fffffe]">
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Nghề nghiệp
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-base font-semibold tracking-tight text-[#fffffe] mb-4">
              Kết nối
            </h3>
            <ul className="space-y-2 text-sm text-[#fffffe]">
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFD54F] transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-[#fffffe]/15">
          <div className="text-xs text-[#fffffe]">
            © {currentYear} SkillUp.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#fffffe]">
            <a href="#" className="hover:text-[#fffffe] transition-colors" >
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-[#fffffe] transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="hover:text-[#fffffe] transition-colors">
              Trợ giúp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;