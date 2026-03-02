import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeProvider from '../components/ThemeProvider';
import { Plus, FolderOpen, Calendar, Code2, X } from 'lucide-react';

interface User {
  displayName: string;
  email?: string;
  id?: string;
}

const LANGUAGES = ['cpp', 'python', 'java', 'javascript'];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${BACKEND_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (!data.user) {
          navigate('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate, BACKEND_URL]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/project`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, BACKEND_URL]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const finalName = `${name} [${language}]`;
    const resp = await fetch(`${BACKEND_URL}/project`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: finalName, language })
    });
    if (!resp.ok) {
      setError('Failed to create project');
      return;
    }
    const project = await resp.json();
    setProjects([...projects, project]);
    setShowModal(false);
    setName('');
    setLanguage(LANGUAGES[0]);
  };

  // Helper for sorting projects by createdAt (desc) - most recent first
  const getSortedProjects = () => {
    return [...projects].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-10">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                My Projects
              </h1>
              <p className="text-muted-foreground">
                Manage and organize your coding projects
              </p>
            </div>
            <button
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your projects...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">Create your first project to get started!</p>
              <button
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium mx-auto"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Project Name</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Language</th>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Created</th>
                      <th className="text-center px-6 py-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedProjects().map((project: any, index: number) => (
                      <tr 
                        key={project._id}
                        className={`border-b border-border hover:bg-muted/30 transition-colors ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Code2 className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="font-medium text-foreground truncate max-w-xs">
                              {project.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-medium uppercase">
                            {project.language}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 px-4 py-2 rounded-md font-medium transition-colors text-sm"
                            onClick={() => navigate(`/project/${project._id}`)}
                          >
                            <FolderOpen className="w-4 h-4" />
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal for new project */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Create New Project</h3>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={createProject} className="space-y-5">
                  <div>
                    <label className="block mb-2 font-semibold text-foreground">Project Name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter project name..."
                      required
                      maxLength={64}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-foreground">Language</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all capitalize"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l} value={l} className="capitalize">{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
                    >
                      Create Project
                    </button>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted transition-all font-medium"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
