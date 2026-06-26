function Footer() {
  return (
    <div className="py-5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
      <div className="flex flex-col gap-1 items-center md:items-start">
        <span className="font-bold text-gray-900 text-sm">InsightEase</span>
        <span>© 2024 InsightEase. Guided by the Data Sherpa.</span>
      </div>
      <div className="flex flex-wrap justify-center gap-5">
        <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-gray-900 transition-colors">Help Center</a>
        <a href="#" className="hover:text-gray-900 transition-colors">API Documentation</a>
      </div>
    </div>
  );
}

export default Footer;
