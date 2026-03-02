import { Code2, Sparkles, Image, Zap, Award, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <img 
                src="/codementor-logo.png" 
                alt="CodeMentor" 
                className="w-8 h-8 rounded-lg shadow-sm"
                onError={(e) => {
                  // Fallback to gradient icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-white text-base">CodeMentor</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              AI-powered code compiler for Bharat's developers. Built for the AI for Bharat Hackathon.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Award className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">Hackathon Project</span>
            </div>
          </div>

          {/* Features Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-white mb-3 text-sm">Features</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-orange-400" />
                <span>Multi-language compilation</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>AI-powered hints</span>
              </li>
              <li className="flex items-center gap-2">
                <Image className="w-3 h-3 text-orange-400" />
                <span>Algorithm visualization</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-green-400" />
                <span>Made for Bharat</span>
              </li>
            </ul>
          </div>

          {/* Languages Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-white mb-3 text-sm">Supported Languages</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>C++</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Python</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>Java</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>JavaScript</span>
              </li>
            </ul>
          </div>

          {/* Hackathon Info */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-white mb-3 text-sm">Hackathon Details</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <img src="/aws-logo.webp" alt="AWS" className="w-8 h-6" />
                <span>Powered by AWS</span>
              </li>
              <li>• AI for Bharat Initiative</li>
              <li>• Innovation Partner: H2S</li>
              <li>• Media Partner: YourStory</li>
            </ul>
          </div>
        </div>

        {/* Indian Architecture Decoration */}
        <div className="flex justify-center mb-6">
          <div className="flex items-end gap-1 opacity-20">
            <div className="w-6 h-4 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
            <div className="w-4 h-6 bg-gradient-to-t from-green-400 to-green-300 rounded-t-full"></div>
            <div className="w-8 h-5 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-orange-300 rounded-t-full"></div>
            </div>
            <div className="w-4 h-3 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg"></div>
            <div className="w-6 h-7 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
            <div className="w-4 h-4 bg-gradient-to-t from-green-400 to-green-300 rounded-t-lg"></div>
            <div className="w-8 h-6 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg"></div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {currentYear} CodeMentor • AI for Bharat Hackathon Project
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              Built with <span className="text-orange-400">🧡</span> for Bharat's developers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}