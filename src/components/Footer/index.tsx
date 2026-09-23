const Footer = () => (
  <footer className="bg-page border-t border-bw-border mt-auto py-6">
    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="text-white font-semibold text-sm">Book Worm</span>
      <p className="text-bw-muted text-xs">
        &copy; {new Date().getFullYear()} Book Worm. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
