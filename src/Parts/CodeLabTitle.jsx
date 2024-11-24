import React from 'react';
import { Code2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const CodeLabTitle = () => {
  return (
    <div className="flex items-center justify-center space-x-2 py-2">
      <NavLink to="https://code-lab-seven.vercel.app/">

      <Code2 className="w-6 h-6 text-blue-400" />
      <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        CodeLab
      </h1>
      </NavLink>
    </div>
  );
};

export default CodeLabTitle;