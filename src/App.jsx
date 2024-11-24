import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { 
  Copy, 
  Download, 
  Play,
  Code2,
  Check,
  ChevronDown,
  AlertCircle,
  X,
  Menu,
  Maximize2,
  Minimize2
} from 'lucide-react';
import CodeLabTitle from './Parts/CodeLabTitle';

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  c: "10.2.0",
  // c: "11.2.0"
};

 
const CODE_SNIPPETS = {
  javascript: `const name = 'Vyas Vishal';
const age = 20;
console.log(\`Name: \${name}, Age: \${age}\`);
console.log('Hello from CodeLab team!');`,

  python: `name = 'Vyas Vishal'
age = 20
print(f'Name: {name}, Age: {age}')
print('Hello from CodeLab team!')`,

  java: `public class Main {
  public static void main(String[] args) {
    String name = "Vyas Vishal";
    int age = 20;
    System.out.println("Name: " + name + ", Age: " + age);
    System.out.println("Hello from CodeLab team!");
  }
}`,

  c: `#include <stdio.h>

    int main() {
    char name[] = "Vyas Vishal";
    int age = 20;
    printf("Name: %s, Age: %d ", name, age);
    printf("Hello from CodeLab team!");
    return 0;
}`
};


const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState(CODE_SNIPPETS.javascript);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState("vs-dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOutputFullscreen, setIsOutputFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsOutputFullscreen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setValue(CODE_SNIPPETS[lang]);
    setShowLanguageMenu(false);
    setMobileMenuOpen(false);
    showNotification(`Switched to ${lang}`);
  };

  const copyCode = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.getValue());
    showNotification('Code copied to clipboard');
  };

  const downloadCode = () => {
    if (!editorRef.current) return;
    const element = document.createElement('a');
    const file = new Blob([editorRef.current.getValue()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Code downloaded');
  };

  const runCode = async () => {
    if (!editorRef.current) return;
    
    setIsLoading(true);
    if (isMobile) {
      setIsOutputFullscreen(true);
    }

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          version: LANGUAGE_VERSIONS[language],
          files: [{ content: editorRef.current.getValue() }]
        })
      });
      
      const data = await response.json();
      const output = data.run.output.split('\n');
      setOutput(output);
      setIsError(!!data.run.stderr);
      
      if (!data.run.stderr) {
        showNotification('Code executed successfully');
      } else {
        showNotification('Execution failed', 'error');
      }
    } catch (error) {
      setOutput(['Error executing code:', error.message]);
      setIsError(true);
      showNotification('Failed to execute code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const MobileMenu = () => (
    <div className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-zinc-800">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 p-4">
            
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Select Language</h3>
            {Object.keys(LANGUAGE_VERSIONS).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-900 hover:bg-zinc-800"
              >
                <span className="capitalize">{lang}</span>
                <span className="text-zinc-400 text-sm">
                  ({LANGUAGE_VERSIONS[lang]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Mobile Menu */}
      {isMobileMenuOpen && <MobileMenu />}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className={`px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${
            notification.type === 'error' ? 'bg-red-500/90' : 'bg-emerald-500/90'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="border-b border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-zinc-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <CodeLabTitle />

            {/* Desktop Language Selector */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                <span className="capitalize">{language}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showLanguageMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 z-50">
                  {Object.keys(LANGUAGE_VERSIONS).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className="flex items-center w-full px-4 py-2 hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="capitalize">{lang}</span>
                      <span className="text-zinc-400 text-sm ml-2">
                        ({LANGUAGE_VERSIONS[lang]})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>










          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={copyCode}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
              title="Copy code"
            >
              <Copy className="w-5 h-5 group-hover:text-blue-400" />
            </button>
            <button
              onClick={downloadCode}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
              title="Download code"
            >
              <Download className="w-5 h-5 group-hover:text-blue-400" />
            </button>
            <button
              onClick={runCode}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-zinc-700 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              <Play className="w-4 h-4" />
              <span className="hidden md:inline">{isLoading ? 'Running...' : 'Run'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Editor */}
        <div className={`${
          isMobile && isOutputFullscreen ? 'hidden' : 'flex-1'
        } md:w-1/2 md:border-r border-zinc-800`}>
          <Editor
            height="calc(100vh - 4rem)"
            theme={theme}
            language={language}
            value={value}
            onChange={setValue}
            onMount={onMount}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible'
              },
              padding: { top: 20 },
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              cursorStyle: 'line'
            }}
          />
        </div>

        {/* Output */}
        <div className={`${
          isMobile && !isOutputFullscreen ? 'hidden' : 'flex-1'
        } md:w-1/2 flex flex-col bg-black`}>
          <div className="px-4 md:px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <span className="font-semibold text-lg">Output</span>
            <div className="flex items-center space-x-2">
              {isMobile && (
                <button
                  onClick={() => setIsOutputFullscreen(!isOutputFullscreen)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {isOutputFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={() => setOutput([])}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Clear output"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 md:p-6 font-mono text-sm overflow-auto">
            {output.length > 0 ? (
              output.map((line, i) => (
                <div 
                  key={i}
                  className={`${isError ? 'text-red-400' : 'text-emerald-400'} mb-1`}
                >
                  {line}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
                <Play className="w-8 h-8" />
                <p className="text-center">
                  Click "Run" to execute your code and<br />see the output here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 py-4 px-6 text-center text-zinc-500 text-sm">
        © Copyright by CodeLab Club from Ampics and created by Vyas Vishal
      </div>
    </div>
  );
};

export default CodeEditor;